import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// 1. Read source of truth from package.json
const pkgPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const targetVersion = pkg.version;
const targetMsixVersion = `${targetVersion}.0`;

console.log(`Checking version synchronization (Target: ${targetVersion}, MSIX: ${targetMsixVersion})...`);

let allSynced = true;

function check(name, found, target) {
  if (found === target) {
    console.log(`✅ ${name} (${found})`);
  } else {
    console.error(`❌ ${name} has version ${found}, expected ${target}`);
    allSynced = false;
  }
}

// 2. package-lock.json
const lockPath = path.join(rootDir, 'package-lock.json');
const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
check('package-lock.json', lock.version, targetVersion);
if (lock.packages && lock.packages['']) {
  check('package-lock.json (packages[""])', lock.packages[''].version, targetVersion);
}

// 3. extension/manifest.json
const manifestPath = path.join(rootDir, 'extension/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
check('extension/manifest.json', manifest.version, targetVersion);

// 4. tauri configs
['tauri.conf.json', 'tauri.appstore.conf.json', 'tauri.windows.conf.json'].forEach(file => {
  const filePath = path.join(rootDir, 'src-tauri', file);
  if (fs.existsSync(filePath)) {
    const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (config.version) {
      check(`src-tauri/${file}`, config.version, targetVersion);
    }
  }
});

// 5. Cargo.toml
const cargoTomlPath = path.join(rootDir, 'src-tauri/Cargo.toml');
const cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');
let cargoPackageName = 'keyfixer-desktop';
const versionMatch = cargoToml.match(/^\[package\][\s\S]*?name\s*=\s*"([^"]+)"[\s\S]*?version\s*=\s*"([^"]+)"/m);
if (versionMatch) {
  cargoPackageName = versionMatch[1];
  check('src-tauri/Cargo.toml', versionMatch[2], targetVersion);
} else {
  console.error('❌ Could not parse version from Cargo.toml');
  allSynced = false;
}

// 6. Cargo.lock
const cargoLockPath = path.join(rootDir, 'src-tauri/Cargo.lock');
if (fs.existsSync(cargoLockPath)) {
  const cargoLock = fs.readFileSync(cargoLockPath, 'utf8');
  // Match the specific package entry block
  const pkgRegex = new RegExp(`\\[\\[package\\]\\]\\nname = "${cargoPackageName}"\\nversion = "([^"]+)"`);
  const lockMatch = cargoLock.match(pkgRegex);
  if (lockMatch) {
    check('src-tauri/Cargo.lock', lockMatch[1], targetVersion);
  } else {
    console.error(`❌ Could not find ${cargoPackageName} in Cargo.lock`);
    allSynced = false;
  }
}

// 7. AppxManifest.xml
const appxPath = path.join(rootDir, 'src-tauri/msix/AppxManifest.xml');
if (fs.existsSync(appxPath)) {
  const appx = fs.readFileSync(appxPath, 'utf8');
  const appxMatch = appx.match(/<Identity[^>]+Version="([^"]+)"/);
  if (appxMatch) {
    check('src-tauri/msix/AppxManifest.xml', appxMatch[1], targetMsixVersion);
  } else {
    console.error('❌ Could not parse version from AppxManifest.xml');
    allSynced = false;
  }
}

if (!allSynced) {
  console.error('\n❌ Version synchronization check failed. Run "npm run version:set -- <version>" to fix.');
  process.exit(1);
}

console.log('\n✅ All versions are synchronized.');
