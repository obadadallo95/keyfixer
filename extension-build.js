import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const outDir = 'extension/dist';

async function buildExtension() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  await esbuild.build({
    entryPoints: [
      'extension/src/background.ts',
      'extension/src/content.ts',
      'extension/src/popup.ts',
    ],
    bundle: true,
    outdir: outDir,
    format: 'esm',
    target: 'es2022',
  });

  fs.copyFileSync('extension/src/popup.html', path.join(outDir, 'popup.html'));
  fs.copyFileSync('extension/manifest.json', path.join(outDir, 'manifest.json'));

  if (fs.existsSync('extension/assets')) {
    const assetsOut = path.join(outDir, 'assets');
    fs.mkdirSync(assetsOut, { recursive: true });
    fs.cpSync('extension/assets', assetsOut, { recursive: true });
  }

  console.log('✅ Extension built successfully in extension/dist');
}

buildExtension().catch((err) => {
  console.error('❌ Extension build failed:', err);
  process.exit(1);
});

