// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless'

// https://astro.build/config
export default defineConfig({
  // ⚠️ Configuración de dominio oficial
  site: 'https://encantia.xyz', 

  // 🚀 CRÍTICO: Cambia el modo de compilación de estático a Servidor Dinámico (SSR)
  // Esto activa las rutas de API dinámicas como /api/submit-application
  output: 'server',
  adapter: vercel(),

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});
