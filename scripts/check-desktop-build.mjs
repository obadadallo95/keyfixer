#!/usr/bin/env node
/**
 * check-desktop-build.mjs
 *
 * Pre-flight validator for the KeyFixer desktop frontend build.
 * Run BEFORE tauri build to prove dist-desktop/ is ready for packaging.
 *
 * Checks:
 *   1. dist-desktop/index.html exists
 *   2. dist-desktop/index.html is non-empty (> 100 bytes)
 *   3. Every JS/CSS asset referenced by src= / href= exists on disk
 *   4. No localhost, 127.0.0.1, or http:// dev-server references
 *   5. <div id="desktop-root"> is present (required mount point)
 *
 * Exit codes:
 *   0 – all checks passed
 *   1 – one or more checks failed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist-desktop');
const INDEX = path.join(DIST, 'index.html');

let passed = 0;
let failed = 0;

function ok(msg) {
  console.log(`  ✅  ${msg}`);
  passed++;
}

function fail(msg) {
  console.error(`  ❌  ${msg}`);
  failed++;
}

function section(title) {
  console.log(`\n── ${title}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 1 – index.html exists
// ─────────────────────────────────────────────────────────────────────────────
section('Check 1 – dist-desktop/index.html exists');
if (!fs.existsSync(INDEX)) {
  fail(
    `dist-desktop/index.html not found.\n` +
    `  Run "npm run build:desktop" first, or use "npm run build:appstore" which does this automatically.`
  );
  // Cannot proceed with further checks – bail immediately.
  console.error('\n❌  Pre-flight failed – dist-desktop/index.html is missing.\n');
  process.exit(1);
}
ok('dist-desktop/index.html found');

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 2 – index.html is non-empty
// ─────────────────────────────────────────────────────────────────────────────
section('Check 2 – index.html is non-empty');
const stat = fs.statSync(INDEX);
if (stat.size < 100) {
  fail(`dist-desktop/index.html is only ${stat.size} bytes – likely empty or truncated.`);
} else {
  ok(`index.html is ${stat.size} bytes`);
}

const html = fs.readFileSync(INDEX, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 3 – Referenced JS/CSS assets exist on disk
// ─────────────────────────────────────────────────────────────────────────────
section('Check 3 – Referenced JS/CSS assets exist');

// Match src="/assets/..." and href="/assets/..."
const assetPattern = /(?:src|href)="(\/assets\/[^"]+)"/g;
const assetMatches = [...html.matchAll(assetPattern)];

if (assetMatches.length === 0) {
  fail(
    'No /assets/ references found in index.html.\n' +
    '  Expected hashed JS and CSS files from Vite build (e.g. /assets/index-desktop-XXXX.js).'
  );
} else {
  let allAssetsFound = true;
  for (const match of assetMatches) {
    const assetRelPath = match[1]; // e.g. /assets/index-desktop-DJq0DC0m.js
    const assetAbsPath = path.join(DIST, assetRelPath);
    if (!fs.existsSync(assetAbsPath)) {
      fail(`Asset referenced in index.html not found on disk: ${assetRelPath}`);
      allAssetsFound = false;
    } else {
      const assetStat = fs.statSync(assetAbsPath);
      ok(`${assetRelPath} (${(assetStat.size / 1024).toFixed(1)} KB)`);
    }
  }
  if (allAssetsFound && assetMatches.length > 0) {
    // Already printed individual ok() above
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 4 – No dev-server / localhost references
// ─────────────────────────────────────────────────────────────────────────────
section('Check 4 – No dev-server references');

const devPatterns = [
  { label: 'localhost', re: /localhost/i },
  { label: '127.0.0.1', re: /127\.0\.0\.1/ },
  { label: 'http:// (non-https external URL)', re: /http:\/\/[^'"\s>]/ },
];

let devRefFound = false;
for (const { label, re } of devPatterns) {
  if (re.test(html)) {
    fail(`index.html contains a dev-server reference: "${label}"`);
    devRefFound = true;
  }
}
if (!devRefFound) {
  ok('No localhost / 127.0.0.1 / http:// dev-server references found');
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK 5 – desktop-root mount point present
// ─────────────────────────────────────────────────────────────────────────────
section('Check 5 – desktop-root mount point');

if (!html.includes('id="desktop-root"')) {
  fail(
    'index.html does not contain <div id="desktop-root">.\n' +
    '  The desktop React entry (src/desktop-main.tsx) mounts into #desktop-root.\n' +
    '  This means the copied index.html may be the wrong file.'
  );
} else {
  ok('<div id="desktop-root"> mount point present');
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
if (failed > 0) {
  console.error(
    `❌  Pre-flight FAILED: ${failed} check(s) failed, ${passed} passed.\n` +
    `   Fix the issues above before running "npm run build:appstore".\n`
  );
  process.exit(1);
} else {
  console.log(
    `✅  Pre-flight passed: all ${passed} check(s) passed.\n` +
    `   dist-desktop/ is ready for Tauri packaging.\n`
  );
  process.exit(0);
}
