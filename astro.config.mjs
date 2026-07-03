// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
// CHANGE THIS LINE:
import vercel from '@astrojs/vercel'; 

// https://astro.build/config
export default defineConfig({
  // ⚠️ Configuración de dominio oficial
  site: 'https://encantia.xyz', 

  // 🚀 CRÍTICO: Cambia el modo de compilación de estático a Servidor Dinámico (SSR)
  output: 'server',
  adapter: vercel(),

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});
