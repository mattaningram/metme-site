// @ts-check
import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

import icon from 'astro-icon'
import favicons from 'astro-favicons'

// https://astro.build/config
export default defineConfig({
  site: 'https://metme.app',

  image: {
    responsiveStyles: true,
  },

  vite: {
    plugins: [tailwindcss()],
    css: {
      devSourcemap: true,
    },
  },

  integrations: [
    icon(),
    favicons({
      input: './src/media/metme/metme-ios-icon.png',
      name: 'MetMe',
      short_name: 'MetMe',
    }),
  ],
})
