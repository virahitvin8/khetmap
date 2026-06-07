import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
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
