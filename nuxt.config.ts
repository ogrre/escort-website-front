export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: false },
  css: ['~/../src/styles.css'],
  postcss: { plugins: { tailwindcss: {}, autoprefixer: {} } },
  typescript: { strict: true, typeCheck: true },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8081/api/v1',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    },
  },
  routeRules: {
    '/': { isr: 300 },
    '/fr/villes': { isr: 3600 },
    '/fr/villes/**': { isr: 300 },
    '/fr/profil/**': { isr: 60 },
    '/en/cities': { isr: 3600 },
    '/en/cities/**': { isr: 300 },
    '/en/profile/**': { isr: 60 },
    '/dashboard/**': { ssr: false, headers: { 'cache-control': 'private, no-store' } },
    '/dashboard': { ssr: false, headers: { 'cache-control': 'private, no-store' } },
    '/login': { ssr: false, headers: { 'cache-control': 'private, no-store' } },
    '/register': { ssr: false, headers: { 'cache-control': 'private, no-store' } },
    '/admin': { ssr: false, headers: { 'cache-control': 'private, no-store' } },
  },
  nitro: { preset: 'vercel' },
  app: { head: { htmlAttrs: { lang: 'fr' }, meta: [{ name: 'rating', content: 'adult' }] } },
});
