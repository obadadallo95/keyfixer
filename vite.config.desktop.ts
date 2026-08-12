import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

if (process.env.VITE_PRO_BUILD === 'true') {
  if (!fs.existsSync(path.resolve(__dirname, 'pro-private/frontend/provider.ts'))) {
    console.error("❌ VITE_PRO_BUILD is true but pro-private/frontend/provider.ts is missing. Failing build.");
    process.exit(1);
  }
}

/**
 * Separate Vite config for the Tauri desktop build.
 * Port 5174 avoids collision with the web dev server on 5173.
 * Output goes to dist-desktop/ (separate from dist/ used by the web build).
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    outDir: 'dist-desktop',
    emptyOutDir: true,
    rollupOptions: {
      input: 'index-desktop.html',
    },
  },
});
