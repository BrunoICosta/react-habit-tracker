import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Run `npm run generate-pwa-assets` after changing public/favicon.svg.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: { background: '#6f5cf0' },
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: { background: '#6f5cf0' },
    },
  },
  images: ['public/favicon.svg'],
})
