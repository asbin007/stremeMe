import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { reticle } from '@reticlehq/core/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    reticle(),
  ],
  build: {
    // Raise warning threshold — hls.js alone is ~500 kB (unavoidable)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          if (id.includes('react-dom')) return 'react-dom'
          if (id.includes('react-router')) return 'react-router'
          if (id.includes('/react/')) return 'react'

          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
            return 'redux'
          }

          if (id.includes('@firebase') || id.includes('firebase/')) {
            return 'firebase'
          }

          // Split media libraries — hls.js is large, keep it isolated
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
