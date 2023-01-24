import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgLoader from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgLoader()],
  base: '/sandwich/',
});
