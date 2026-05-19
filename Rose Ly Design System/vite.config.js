import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative assets loading for standalone PWA offline deployments
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        wizard: resolve(__dirname, 'ui_kits/setup-wizard/index.html'),
        admin: resolve(__dirname, 'ui_kits/mobile-admin/index.html'),
        tv: resolve(__dirname, 'ui_kits/tv-display/index.html'),
        jumaat: resolve(__dirname, 'ui_kits/tv-display/jumaat.html'),
      },
      output: {
        // Keep PWA icon assets at predictable (non-hashed) paths so manifests can reference them
        assetFileNames: (assetInfo) => {
          if (['logo-mark.png', 'favicon.png'].includes(assetInfo.name || '')) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
