export interface ApiLocation {
  id?: string | number;
  city?: string;
  country?: string | { code?: string; name?: string };
  country_code?: string;
  name?: string;
  slug?: string;
  region?: { code?: string; name?: string } | null;
  is_major?: boolean | number;
  listings_count?: number;
  profiles_count?: number;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  country: { code: string; name: string };
  region?: { code: string; name: string } | null;
  listings_count: number;
  is_major: boolean;
}

export function locationKey(location: Pick<City, 'name' | 'country'>): string {
  return normalizeText(location.name) + '|' + normalizeText(location.country.code);
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLocaleLowerCase();
}

export function normalizeLocations(items: ApiLocation[]): City[] {
  const locations = items
    .map((item): City | null => {
      const name = (item.name ?? item.city ?? '').trim();
      const slug = item.slug?.trim() ?? '';
      const countryName =
        typeof item.country === 'string'
          ? item.country.trim()
          : (item.country?.name?.trim() ?? item.country_code ?? '');
      const countryCode =
        typeof item.country === 'object'
          ? (item.country.code?.trim() ?? '')
          : (item.country_code?.trim() ?? '');
      if (!name || !slug || !countryName || !countryCode) return null;
      return {
        id: String(item.id ?? slug),
        name,
        slug,
        country: { code: countryCode, name: countryName },
        region: item.region ? { code: item.region.code ?? '', name: item.region.name ?? '' } : null,
        listings_count: item.listings_count ?? item.profiles_count ?? 0,
        is_major: Boolean(item.is_major),
      };
    })
    .filter((item): item is City => item !== null && item.listings_count > 0);

  const uniqueLocations = new Map<string, City>();
  locations.forEach((location) => {
    const key = locationKey(location);
    const previous = uniqueLocations.get(key);
    if (!previous || (location.listings_count ?? 0) > (previous.listings_count ?? 0)) {
      uniqueLocations.set(key, location);
    }
  });

  return [...uniqueLocations.values()];
}
