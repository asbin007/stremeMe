import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react'
          }

          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
            return 'redux'
          }

          if (id.includes('@firebase') || id.includes('firebase/')) {
            return 'firebase'
          }

          if (id.includes('hls.js') || id.includes('react-youtube')) {
            return 'media'
          }

          if (id.includes('framer-motion') || id.includes('gsap')) {
            return 'motion'
          }

          if (id.includes('lucide-react') || id.includes('swiper')) {
            return 'ui'
          }

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
