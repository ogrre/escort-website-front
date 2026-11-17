import type { Locale } from './locale';

export function cityPath(locale: Locale, slug: string): string {
  return `/${locale}/${locale === 'fr' ? 'villes' : 'cities'}/${encodeURIComponent(slug)}`;
}

export function citySearchPath(
  locale: Locale,
  slug: string,
  query: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const queryString = params.toString();
  return `${cityPath(locale, slug)}${queryString ? `?${queryString}` : ''}`;
}
