import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three'
          if (id.includes('node_modules/@react-three/')) return 'react-three'
          if (id.includes('node_modules/react-dom/') || id.includes('node_modules/react/')) return 'react-vendor'
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
