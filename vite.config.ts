import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgLoader from 'vite-plugin-svgr';
import { join } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgLoader()],
  base: '/sandwich/',
  resolve: {
    alias: [
      {
        find: /^@\/(.*)/,
        replacement: join(__dirname, 'src/$1'),
      },
    ],
  },
});
