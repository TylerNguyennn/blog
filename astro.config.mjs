import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
// import node from "@astrojs/node";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: 'https://astrofy-template.netlify.app',
  output: 'hybrid',
  adapter: vercel(),
  integrations: [mdx(), sitemap(), tailwind()]
});