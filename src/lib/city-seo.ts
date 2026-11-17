export function normalizeSiteOrigin(origin: string): string {
  return origin.replace(/\/+$/, '');
}

const runtimeSiteOrigin = normalizeSiteOrigin(
  import.meta.env.VITE_SITE_ORIGIN ?? globalThis.location?.origin ?? 'http://localhost:5173',
);

export function cityCanonical(
  locale: 'fr' | 'en',
  slug: string,
  origin = runtimeSiteOrigin,
): string {
  return `${normalizeSiteOrigin(origin)}/${locale}/${locale === 'fr' ? 'villes' : 'cities'}/${encodeURIComponent(slug)}`;
}

export function citySeoMetadata(
  locale: 'fr' | 'en',
  city: { name: string; slug: string },
  filters: Record<string, unknown> = {},
  origin = runtimeSiteOrigin,
) {
  const english = locale === 'en';
  return {
    title: `${english ? 'Profiles in' : 'Profils à'} ${city.name} | Élégance`,
    description: `${english ? 'Discover profiles and listings available in' : 'Découvrez les profils et annonces disponibles à'} ${city.name}.`,
    canonical: cityCanonical(locale, city.slug, origin),
    robots: Object.keys(filters).length ? 'noindex,follow' : 'index,follow',
  };
}
