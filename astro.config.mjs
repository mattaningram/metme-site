// @ts-check
import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

import icon from 'astro-icon'

// https://astro.build/config
export default defineConfig({
  image: {
    responsiveStyles: true,
  },

  vite: {
    plugins: [tailwindcss()],
    css: {
      devSourcemap: true,
    },
  },

  integrations: [icon()],
})
