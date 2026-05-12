// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import preact from '@astrojs/preact';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [preact()],

  adapter: netlify(),

  env: {
    schema: {
      VIRUSTOTAL_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: false
      }),
      ABUSEIPDB_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: false
      }),
      POLYSWARM_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: false
      }),
      OPENROUTER_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: false
      }),
      RATE_LIMIT_POINTS: envField.string({
        context: 'server',
        access: 'secret',
        optional: false
      }),
      RATE_LIMIT_DURATION: envField.string({
        context: 'server',
        access: 'secret',
        optional: false
      }),

    }
  }
});