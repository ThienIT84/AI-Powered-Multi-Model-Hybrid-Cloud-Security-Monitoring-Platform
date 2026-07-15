import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), 'DEV_');
  const backendOrigin = process.env.DEV_BACKEND_ORIGIN ?? env.DEV_BACKEND_ORIGIN ?? 'http://127.0.0.1:8000';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR configuration: detect host automatically
      hmr: process.env.DISABLE_HMR === 'true' ? false : {
        host: undefined, // Auto-detect from client request
        protocol: 'ws',
      },
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Bind to all interfaces but show localhost in console
      middlewareMode: true,
      proxy: {
        '/api': {
          target: backendOrigin,
          changeOrigin: true,
        },
        '/ws': {
          target: backendOrigin,
          changeOrigin: true,
          ws: true,
        },
        '/ingest': {
          target: backendOrigin,
          changeOrigin: true,
        },
      },
    },
  };
});
