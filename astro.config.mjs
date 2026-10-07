// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // TODO: replace with the real production domain (used for canonical URLs and the sitemap).
  site: process.env.SITE_URL ?? 'https://inkwell.example',
  integrations: [mdx(), sitemap()],
  markdown: {
    // Code colours come from CSS variables mapped to the site's theme tokens (see src/styles/docs.css).
    shikiConfig: { theme: 'css-variables' },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
