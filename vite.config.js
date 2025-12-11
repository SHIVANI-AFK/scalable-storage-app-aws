import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',  // Polyfill 'global' for some libs
  },
  resolve: {
    alias: {
      // Map Node.js modules to browser versions
      stream: 'stream-browserify',
      buffer: 'buffer',
      util: 'util',
      events: 'events',
    },
  },
  optimizeDeps: {
    include: ['stream-browserify', 'buffer', 'util', 'events'],  // Pre-bundle for dev
  },
});