// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// You MUST add 'base: "./",' or check that it is there.
export default defineConfig({
  plugins: [react()],
  base: "./", 
})

