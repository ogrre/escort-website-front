import { cityRouteSlug } from '../../app/utils/public';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const origin = String(config.public.siteUrl).replace(/\/+$/, '');
  const apiBase = String(config.public.apiBaseUrl).replace(/\/+$/, '');
  const response = await $fetch<any>('/locations', {
    baseURL: apiBase,
    query: { has_listings: 1, per_page: 1000 },
    headers: { Accept: 'application/json' },
    timeout: 10000,
  });
  const locations = Array.isArray(response) ? response : (response.data ?? []);
  const urls = [
    `${origin}/`,
    `${origin}/en`,
    `${origin}/fr/villes`,
    `${origin}/en/cities`,
    ...locations
      .filter(
        (location: any) => Number(location.listings_count ?? location.profiles_count ?? 0) > 0,
      )
      .flatMap((location: any) => [
        `${origin}/fr/villes/${encodeURIComponent(cityRouteSlug(String(location.name ?? '')))}`,
        `${origin}/en/cities/${encodeURIComponent(cityRouteSlug(String(location.name ?? '')))}`,
      ]),
  ];
  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url.replace(/&/g, '&amp;')}</loc></url>`).join('')}</urlset>`;
});
