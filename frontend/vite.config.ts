import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isGHPages = process.env.VITE_GH_PAGES === 'true'

export default defineConfig({
  plugins: [react()],
  // When building for GitHub Pages sub-path, set base accordingly
  base: isGHPages ? '/hearo/' : '/',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
