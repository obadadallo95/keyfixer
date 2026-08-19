#!/usr/bin/env node
/**
 * build-msix.mjs
 *
 * Orchestrates the full Microsoft Store MSIX build pipeline for KeyFixer.
 *
 * Steps:
 *   1. Build the desktop frontend  (npm run build:desktop)
 *   2. Compile Tauri Windows x64 executable  (tauri build --config ...)
 *      - This also produces the NSIS installer as a side-effect (preserved).
 *   3. Generate MSIX PNG assets  (node scripts/generate-msix-assets.mjs)
 *   4. Assemble the MSIX staging directory
 *   5. Locate MakeAppx.exe via Windows SDK path search
 *   6. Pack the .msix
 *   7. Print the output path and SHA-256 hash
 *
 * Output: src-tauri/target/release/bundle/msix/KeyFixer_1.1.1.0_x64.msix
 *
 * Usage:
 *   npm run build:windows:msix
 *
 * Platform: Windows only (MakeAppx.exe is a Windows SDK tool).
 *
 * Signing is handled separately in CI (see .github/workflows/microsoft-store-msix.yml).
 * For local signing, see docs/microsoft-store-msix.md.
 */

import { execSync, spawnSync } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Configuration ─────────────────────────────────────────────────────────────
const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const PACKAGE_NAME    = 'ObadaDallo.KeyFixer';
const VERSION         = `${pkg.version}.0`;
const ARCH            = 'x64';
const APP_ID          = 'KeyFixer';
const MSIX_FILENAME   = `KeyFixer_${VERSION}_${ARCH}.msix`;

const TAURI_RELEASE   = path.join(ROOT, 'src-tauri', 'target', 'release');
const EXE_SRC         = path.join(TAURI_RELEASE, 'keyfixer-desktop.exe');
const MANIFEST_SRC    = path.join(ROOT, 'src-tauri', 'msix', 'AppxManifest.xml');
const ASSETS_SRC      = path.join(ROOT, 'src-tauri', 'msix', 'Assets');
const STAGING_DIR     = path.join(ROOT, 'src-tauri', 'target', 'msix-staging');
const OUTPUT_DIR      = path.join(TAURI_RELEASE, 'bundle', 'msix');
const MSIX_OUT        = path.join(OUTPUT_DIR, MSIX_FILENAME);

// ── Helpers ───────────────────────────────────────────────────────────────────
function run(cmd, cwd = ROOT, env = {}) {
  console.log(`\n$ ${cmd}`);
  try {
    execSync(cmd, {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, ...env },
    });
  } catch (err) {
    console.error(`\nERROR: Command failed: ${cmd}`);
    process.exit(1);
  }
}

function findMakeAppx() {
  // Strategy 1: vswhere to locate Visual Studio / Windows SDK
  const VSWHERE = 'C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe';
  if (fs.existsSync(VSWHERE)) {
    try {
      const vsInstallPath = execSync(
        `"${VSWHERE}" -latest -property installationPath`,
        { encoding: 'utf8' }
      ).trim();
      // MakeAppx ships with the Windows SDK bundled in VS
    } catch {}
  }

  // Strategy 2: Glob known Windows SDK paths (10.0.*)
  const SDK_BIN_BASE = 'C:\\Program Files (x86)\\Windows Kits\\10\\bin';
  if (fs.existsSync(SDK_BIN_BASE)) {
    const versions = fs.readdirSync(SDK_BIN_BASE)
      .filter(d => /^10\.0\.\d+\.\d+$/.test(d))
      .sort((a, b) => {
        const av = a.split('.').map(Number);
        const bv = b.split('.').map(Number);
        for (let i = 0; i < 4; i++) {
          if (av[i] !== bv[i]) return bv[i] - av[i]; // descending — newest first
        }
        return 0;
      });

    for (const ver of versions) {
      const candidate = path.join(SDK_BIN_BASE, ver, 'x64', 'makeappx.exe');
      if (fs.existsSync(candidate)) {
        console.log(`  Found MakeAppx.exe: ${candidate}`);
        return candidate;
      }
    }
  }

  // Strategy 3: Check PATH
  const result = spawnSync('where.exe', ['makeappx.exe'], { encoding: 'utf8' });
  if (result.status === 0 && result.stdout.trim()) {
    const found = result.stdout.trim().split('\n')[0].trim();
    console.log(`  Found MakeAppx.exe in PATH: ${found}`);
    return found;
  }

  // Strategy 4: Visual Studio 2022/2019 bundled SDK
  const VS_CANDIDATES = [
    'C:\\Program Files\\Microsoft Visual Studio\\2022\\Enterprise\\MSBuild\\Current\\Bin\\amd64',
    'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\MSBuild\\Current\\Bin\\amd64',
    'C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Enterprise\\MSBuild\\Current\\Bin\\amd64',
  ];
  for (const dir of VS_CANDIDATES) {
    const candidate = path.join(dir, 'makeappx.exe');
    if (fs.existsSync(candidate)) return candidate;
  }

  console.error('\nERROR: Could not locate MakeAppx.exe.');
  console.error('Install the Windows SDK via Visual Studio Installer.');
  process.exit(1);
}

function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const isWindows = process.platform === 'win32';

  console.log('═══════════════════════════════════════════════════════════');
  console.log(' KeyFixer — Microsoft Store MSIX Build');
  console.log(`  Package : ${PACKAGE_NAME}`);
  console.log(`  Version : ${VERSION}`);
  console.log(`  Arch    : ${ARCH}`);
  console.log('═══════════════════════════════════════════════════════════');

  // ── Step 1: Build desktop frontend ──────────────────────────────────────────
  console.log('\n[1/6] Building desktop frontend (Pro enabled)...');
  run('npm run build:desktop', ROOT, { VITE_PRO_BUILD: 'true' });

  // ── Step 2: Compile Tauri Windows executable ─────────────────────────────────
  console.log('\n[2/6] Compiling Tauri Windows x64 executable (Pro enabled)...');
  run('npx tauri build --config src-tauri/tauri.windows.conf.json --features pro', ROOT, { VITE_PRO_BUILD: 'true' });

  if (!fs.existsSync(EXE_SRC)) {
    console.error(`\nERROR: Expected executable not found: ${EXE_SRC}`);
    process.exit(1);
  }
  console.log(`  ✓ Executable: ${EXE_SRC}`);

  // ── Step 3: Generate MSIX assets ─────────────────────────────────────────────
  console.log('\n[3/6] Generating MSIX PNG assets...');
  run('node scripts/generate-msix-assets.mjs');

  // Verify all required assets exist
  const REQUIRED_ASSETS = [
    'Square44x44Logo.png',
    'Square44x44Logo.targetsize-16.png',
    'Square44x44Logo.targetsize-24.png',
    'Square44x44Logo.targetsize-32.png',
    'Square44x44Logo.targetsize-48.png',
    'Square150x150Logo.png',
    'StoreLogo.png',
    'SplashScreen.png',
  ];
  for (const asset of REQUIRED_ASSETS) {
    if (!fs.existsSync(path.join(ASSETS_SRC, asset))) {
      console.error(`  ERROR: Required asset missing: ${asset}`);
      process.exit(1);
    }
    console.log(`  ✓ ${asset}`);
  }

  // ── Step 4: Assemble staging directory ───────────────────────────────────────
  console.log('\n[4/6] Assembling MSIX staging directory...');
  if (fs.existsSync(STAGING_DIR)) {
    fs.rmSync(STAGING_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(STAGING_DIR, { recursive: true });

  // Copy manifest
  fs.copyFileSync(MANIFEST_SRC, path.join(STAGING_DIR, 'AppxManifest.xml'));
  console.log('  ✓ AppxManifest.xml');

  // Copy assets
  const stagingAssets = path.join(STAGING_DIR, 'Assets');
  copyDir(ASSETS_SRC, stagingAssets);
  console.log('  ✓ Assets/');

  // Copy executable into KeyFixer\ subfolder (matches manifest Executable path)
  const stagingApp = path.join(STAGING_DIR, APP_ID);
  fs.mkdirSync(stagingApp, { recursive: true });
  fs.copyFileSync(EXE_SRC, path.join(stagingApp, 'keyfixer-desktop.exe'));
  console.log('  ✓ KeyFixer\\keyfixer-desktop.exe');

  // ── Step 5: Locate MakeAppx.exe ──────────────────────────────────────────────
  console.log('\n[5/6] Locating MakeAppx.exe...');
  if (!isWindows) {
    console.log('  ⚠ Not running on Windows — skipping MakeAppx step.');
    console.log('  Staging directory assembled at:');
    console.log(`    ${STAGING_DIR}`);
    console.log('  Run this script on a Windows machine to produce the .msix file.');
    process.exit(0);
  }

  const makeAppx = findMakeAppx();

  // ── Step 6: Pack MSIX ────────────────────────────────────────────────────────
  console.log('\n[6/6] Packing MSIX...');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Remove previous output if exists
  if (fs.existsSync(MSIX_OUT)) {
    fs.rmSync(MSIX_OUT);
  }

  run(`"${makeAppx}" pack /d "${STAGING_DIR}" /p "${MSIX_OUT}" /nv`);

  if (!fs.existsSync(MSIX_OUT)) {
    console.error(`\nERROR: MakeAppx did not produce: ${MSIX_OUT}`);
    process.exit(1);
  }

  // ── Report ───────────────────────────────────────────────────────────────────
  const sizeBytes = fs.statSync(MSIX_OUT).size;
  const sizeMB    = (sizeBytes / 1024 / 1024).toFixed(2);
  const hash      = sha256File(MSIX_OUT);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(' MSIX Build Complete');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  File   : ${MSIX_FILENAME}`);
  console.log(`  Path   : ${MSIX_OUT}`);
  console.log(`  Size   : ${sizeMB} MB (${sizeBytes.toLocaleString()} bytes)`);
  console.log(`  SHA256 : ${hash}`);
  console.log('');
  console.log('  Next steps:');
  console.log('  1. Sign with SignTool (see docs/microsoft-store-msix.md)');
  console.log('  2. Upload to Partner Center: https://partner.microsoft.com/');
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('\nBuild failed:', err.message);
  process.exit(1);
});
