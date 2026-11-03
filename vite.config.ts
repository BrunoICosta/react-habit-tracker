import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Served from https://portfolio.brunoisaac.dev/react-habit-tracker/ in production.
const DEPLOY_BASE = '/react-habit-tracker/'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => {
  // Dev server runs at the root; builds and `vite preview` use the deployed sub-path.
  const base = command === 'build' || isPreview ? DEPLOY_BASE : '/'

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: false,
        includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
        manifest: {
          id: base,
          name: 'Hábitos | rastreador de hábitos',
          short_name: 'Hábitos',
          description:
            'Acompanhe seus hábitos diários com sequências, estatísticas e mapa de calor. Funciona offline.',
          lang: 'pt-BR',
          dir: 'ltr',
          start_url: base,
          scope: base,
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#0e0f13',
          theme_color: '#0e0f13',
          categories: ['productivity', 'lifestyle', 'health'],
          icons: [
            { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {
              name: 'Hoje',
              url: `${base}#/`,
              icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Novo hábito',
              url: `${base}#/habitos/novo`,
              icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest}'],
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true,
        },
      }),
    ],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      restoreMocks: true,
    },
  }
})
