// JavaScript (vite.config.js)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [react(),
    nodePolyfills(), // Adds support for Node.js built-in modules
  ],
  server: {
    port: 3000,
  },
});
