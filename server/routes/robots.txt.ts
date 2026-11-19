export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const host = String(config.public.siteUrl).replace(/\/+$/, '');
  const isPreview = host.includes('.vercel.app') || process.env.VERCEL_ENV === 'preview';
  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8');
  return isPreview
    ? `User-agent: *\nDisallow: /\n`
    : `User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /login\nDisallow: /register\nDisallow: /admin\nSitemap: ${host}/sitemap.xml\n`;
});
