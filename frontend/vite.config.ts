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
      // HMR configuration: detect host automatically
      hmr: process.env.DISABLE_HMR === 'true' ? false : {
        host: undefined, // Auto-detect from client request
        protocol: 'ws',
      },
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Bind to all interfaces but show localhost in console
      middlewareMode: true,
    },
  };
});
