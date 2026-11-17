export interface SitemapCity {
  slug: string;
  listings_count: number;
}

export function citySitemapUrls(cities: SitemapCity[], origin: string): string[] {
  return cities
    .filter((city) => city.listings_count > 0)
    .flatMap((city) => [
      `${origin}/fr/villes/${encodeURIComponent(city.slug)}`,
      `${origin}/en/cities/${encodeURIComponent(city.slug)}`,
    ]);
}

export function citySitemapXml(cities: SitemapCity[], origin: string): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...citySitemapUrls(cities, origin).map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    '</urlset>',
  ].join('\n');
}

function escapeXml(value: string): string {
  return value.replace(
    /[<>&'"]/g,
    (character) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;',
      })[character] ?? character,
  );
}
