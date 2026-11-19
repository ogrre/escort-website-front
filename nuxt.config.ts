export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: false },
  css: ['~/../src/styles.css'],
  postcss: { plugins: { tailwindcss: {}, autoprefixer: {} } },
  typescript: { strict: true, typeCheck: true },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? '/api/backend',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    },
    apiInternalBaseUrl:
      process.env.NUXT_API_INTERNAL_BASE_URL ??
      process.env.NUXT_PUBLIC_API_BASE_URL ??
      'http://localhost:8081/api/v1',
  },
  routeRules: {
    '/': { isr: 300 },
    // Directory and city pages accept query filters; keep them SSR-only until
    // Vercel query-string cache behavior is verified for this API contract.
    '/fr/villes': { isr: false },
    '/fr/villes/**': { isr: false },
    // Keep dynamic profile payloads SSR-only. ISR in dev can request a
    // route payload that has not been generated yet and break hydration.
    '/fr/profil/**': { isr: false },
    '/en/cities': { isr: false },
    '/en/cities/**': { isr: false },
    '/en/profile/**': { isr: false },
    '/dashboard/**': { ssr: false, headers: { 'cache-control': 'private, no-store' } },
    '/dashboard': { ssr: false, headers: { 'cache-control': 'private, no-store' } },
    '/login': { ssr: false, headers: { 'cache-control': 'private, no-store' } },
    '/register': { ssr: false, headers: { 'cache-control': 'private, no-store' } },
    '/admin': { ssr: false, headers: { 'cache-control': 'private, no-store' } },
  },
  nitro: { preset: process.env.NITRO_PRESET ?? 'vercel' },
  app: { head: { htmlAttrs: { lang: 'fr' }, meta: [{ name: 'rating', content: 'adult' }] } },
});
