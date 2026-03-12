import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isStaticBuild = process.env.VITE_DEMO_MODE === 'true'

export default defineConfig({
  plugins: [react()],
  // When building for GitHub Pages sub-path, set base accordingly
  base: isStaticBuild ? '/hearo/' : '/',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
