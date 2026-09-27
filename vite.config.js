import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Expose Vite dev server on all network interfaces so LAN/mobile devices can connect
    host: true,
    proxy: {
      // Forward /api requests to the local Express backend during development.
      // This means the frontend always calls a relative /api URL (no hardcoded IP),
      // which works from any device on the LAN.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
