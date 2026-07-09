import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          // Keep React + Clerk together (Clerk needs React internals)
          if (id.includes('/react/') || id.includes('react-dom') || id.includes('@clerk/')) return 'vendor'
          if (id.includes('react-router')) return 'react-router'

          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
            return 'redux'
          }

          if (id.includes('@firebase') || id.includes('firebase/')) {
            return 'firebase'
          }

          if (id.includes('hls.js')) return 'hls'
          if (id.includes('react-youtube')) return 'youtube'

          if (id.includes('framer-motion') || id.includes('gsap')) {
            return 'motion'
          }

          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('swiper')) return 'swiper'

          return 'vendor'
        },
      },
    },
  },
  server: {
    proxy: {
      '/api/football-data': {
        target: 'https://api.football-data.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/football-data/, ''),
      },
    },
  },
})
