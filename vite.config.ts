import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// GitHub Pages deploys to /khetmap/ subpath — use VITE_BASE_PATH to handle this.
// Firebase Hosting / Vercel use '/' (no env var needed).
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'leaflet': ['leaflet', 'react-leaflet', 'leaflet-draw'],
          'ui-vendor': ['lucide-react', 'sonner', 'motion', 'recharts'],
          'clerk': ['@clerk/clerk-react'],
        },
      },
    },
    chunkSizeWarningLimit: 300,
  },
})
