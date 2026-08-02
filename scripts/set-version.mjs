import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Usage: node set-version.mjs <version (e.g. 1.1.2)>');
  process.exit(1);
}

const msixVersion = `${version}.0`;

console.log(`Setting version to ${version} (MSIX: ${msixVersion})...`);

// 1. package.json
const pkgPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = version;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// 2. extension/manifest.json
const manifestPath = path.join(rootDir, 'extension/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.version = version;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

// 3. tauri configs
['tauri.conf.json', 'tauri.appstore.conf.json', 'tauri.windows.conf.json'].forEach(file => {
  const filePath = path.join(rootDir, 'src-tauri', file);
  if (fs.existsSync(filePath)) {
    const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (config.version) config.version = version;
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2) + '\n');
  }
});

// 4. Cargo.toml
const cargoTomlPath = path.join(rootDir, 'src-tauri/Cargo.toml');
let cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');
let cargoPackageName = 'keyfixer-desktop';
cargoToml = cargoToml.replace(
  /^(\[package\][\s\S]*?name\s*=\s*")([^"]+)("[\s\S]*?version\s*=\s*")([^"]+)(")/m,
  (match, p1, p2, p3, p4, p5) => {
    cargoPackageName = p2;
    return `${p1}${p2}${p3}${version}${p5}`;
  }
);
fs.writeFileSync(cargoTomlPath, cargoToml);

// 5. AppxManifest.xml
const appxPath = path.join(rootDir, 'src-tauri/msix/AppxManifest.xml');
if (fs.existsSync(appxPath)) {
  let appx = fs.readFileSync(appxPath, 'utf8');
  appx = appx.replace(/(<Identity[^>]+Version=")[^"]+(")/, `$1${msixVersion}$2`);
  fs.writeFileSync(appxPath, appx);
}

// 6. Run commands
console.log('Running npm install to update package-lock.json...');
execSync('npm install', { cwd: rootDir, stdio: 'inherit' });

console.log(`Running cargo update -p ${cargoPackageName} to update Cargo.lock...`);
execSync(`cargo update -p ${cargoPackageName}`, { cwd: path.join(rootDir, 'src-tauri'), stdio: 'inherit' });

console.log('Version synchronization complete.');
