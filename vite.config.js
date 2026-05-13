import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'screenshots/*.png'],
      manifest: {
        name: 'FiguritaZ - Álbum 2026',
        short_name: 'FiguritaZ',
        id: '/',
        description: 'Gerenciador de figurinhas com scanner inteligente',
        theme_color: '#05060a',
        background_color: '#05060a',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['sports', 'entertainment', 'utilities'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshots/tablet1.png',
            sizes: '1640x2360',
            type: 'image/png',
            label: 'Dashboard Tático'
          },
          {
            src: 'screenshots/tablet2.png',
            sizes: '1640x2360',
            type: 'image/png',
            label: 'Coleção de Figurinhas'
          },
          {
            src: 'screenshots/tablet3.png',
            sizes: '1640x2360',
            type: 'image/png',
            label: 'Estatísticas de Progresso'
          }
        ]
      }
    })
  ],
})
