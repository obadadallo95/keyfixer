import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const outDir = 'extension/dist';
fs.mkdirSync(outDir, { recursive: true });

esbuild.build({
  entryPoints: ['extension/src/background.ts', 'extension/src/content.ts', 'extension/src/popup.ts'],
  bundle: true,
  outdir: outDir,
  format: 'esm',
  target: 'es2022'
}).catch(() => process.exit(1));

// Copy assets
fs.cpSync('extension/assets', outDir, { recursive: true });
fs.copyFileSync('extension/src/popup.html', path.join(outDir, 'popup.html'));
fs.copyFileSync('extension/manifest.json', path.join(outDir, 'manifest.json'));
