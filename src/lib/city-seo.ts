export function cityCanonical(
  locale: 'fr' | 'en',
  slug: string,
  origin = window.location.origin,
): string {
  return `${origin}/${locale}/${locale === 'fr' ? 'villes' : 'cities'}/${encodeURIComponent(slug)}`;
}

export function citySeoMetadata(
  locale: 'fr' | 'en',
  city: { name: string; slug: string },
  filters: Record<string, unknown> = {},
  origin = globalThis.location?.origin ?? 'http://localhost:5173',
) {
  const english = locale === 'en';
  return {
    title: `${english ? 'Profiles in' : 'Profils à'} ${city.name} | Élégance`,
    description: `${english ? 'Discover profiles and listings available in' : 'Découvrez les profils et annonces disponibles à'} ${city.name}.`,
    canonical: cityCanonical(locale, city.slug, origin),
    robots: Object.keys(filters).length ? 'noindex,follow' : 'index,follow',
  };
}
