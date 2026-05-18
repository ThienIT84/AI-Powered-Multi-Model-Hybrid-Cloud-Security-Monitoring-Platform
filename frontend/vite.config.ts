import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR configuration for proper WebSocket HMR over localhost
      hmr: process.env.DISABLE_HMR === 'true' ? false : {
        host: 'localhost',
        protocol: 'ws',
      },
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Bind to all interfaces but show localhost in console
      middlewareMode: true,
    },
  };
});
