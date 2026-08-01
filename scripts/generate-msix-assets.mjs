#!/usr/bin/env node
/**
 * generate-msix-assets.mjs
 *
 * Generates all required Microsoft Store MSIX PNG assets from the existing
 * high-resolution KeyFixer icon (src-tauri/icons/icon_512x512.png).
 *
 * Required assets (per AppxManifest.xml):
 *   - Square44x44Logo.png          (44×44)
 *   - Square44x44Logo.targetsize-16.png  (16×16)
 *   - Square44x44Logo.targetsize-24.png  (24×24)
 *   - Square44x44Logo.targetsize-32.png  (32×32)
 *   - Square44x44Logo.targetsize-48.png  (48×48)
 *   - Square150x150Logo.png        (150×150)
 *   - StoreLogo.png                (50×50)
 *   - SplashScreen.png             (620×300) — dark background, centred icon
 *
 * Source: src-tauri/icons/icon_512x512.png
 * Output: src-tauri/msix/Assets/
 *
 * Uses the `sharp` npm package for fast, lossless PNG resizing.
 * Run: node scripts/generate-msix-assets.mjs
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function loadSharp() {
  try {
    return require('sharp');
  } catch {
    console.error('ERROR: sharp is not installed.');
    console.error('Run: npm install --save-dev sharp');
    process.exit(1);
  }
}

const SRC_ICON = path.join(root, 'src-tauri', 'icons', 'icon_512x512.png');
const OUT_DIR  = path.join(root, 'src-tauri', 'msix', 'Assets');

// Assets that are plain icon resizes
const ICON_ASSETS = [
  { name: 'Square44x44Logo.png',              size: 44  },
  { name: 'Square44x44Logo.targetsize-16.png', size: 16  },
  { name: 'Square44x44Logo.targetsize-24.png', size: 24  },
  { name: 'Square44x44Logo.targetsize-32.png', size: 32  },
  { name: 'Square44x44Logo.targetsize-48.png', size: 48  },
  { name: 'Square150x150Logo.png',             size: 150 },
  { name: 'StoreLogo.png',                     size: 50  },
];

async function generateIconAssets(sharp) {
  if (!fs.existsSync(SRC_ICON)) {
    console.error(`ERROR: Source icon not found: ${SRC_ICON}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const asset of ICON_ASSETS) {
    const outPath = path.join(OUT_DIR, asset.name);
    await sharp(SRC_ICON)
      .resize(asset.size, asset.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // transparent background
      })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`  ✓ ${asset.name} (${asset.size}×${asset.size})`);
  }
}

async function generateSplashScreen(sharp) {
  // SplashScreen: 620×300, dark background (#0f172a), icon centred at 200×200
  const SPLASH_W = 620;
  const SPLASH_H = 300;
  const ICON_SIZE = 180;
  const outPath = path.join(OUT_DIR, 'SplashScreen.png');

  // Resize icon for splash
  const iconBuffer = await sharp(SRC_ICON)
    .resize(ICON_SIZE, ICON_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const left = Math.floor((SPLASH_W - ICON_SIZE) / 2);
  const top  = Math.floor((SPLASH_H - ICON_SIZE) / 2);

  await sharp({
    create: {
      width: SPLASH_W,
      height: SPLASH_H,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 255 }, // #0f172a
    },
  })
    .composite([{ input: iconBuffer, left, top }])
    .png()
    .toFile(outPath);

  console.log(`  ✓ SplashScreen.png (${SPLASH_W}×${SPLASH_H})`);
}

async function main() {
  console.log('Generating MSIX assets for Microsoft Store...');
  console.log(`  Source : ${SRC_ICON}`);
  console.log(`  Output : ${OUT_DIR}`);
  console.log('');

  const sharp = await loadSharp();

  await generateIconAssets(sharp);
  await generateSplashScreen(sharp);

  console.log('');
  console.log('All MSIX assets generated successfully.');
}

main().catch((err) => {
  console.error('Asset generation failed:', err.message);
  process.exit(1);
});
