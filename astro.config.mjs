// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // ⚠️ AGREGA ESTA LÍNEA (Cambia la URL por tu dominio real cuando lo compres o el de Vercel/Netlify)
  site: 'https://encantia.xyz', 

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});