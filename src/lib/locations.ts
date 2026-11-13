export interface ApiLocation {
  city?: string;
  country?: string | { code?: string; name?: string };
  country_code?: string;
  name?: string;
  slug?: string;
  is_major?: boolean | number;
  listings_count?: number;
  profiles_count?: number;
}

export interface City {
  city: string;
  country: string;
  slug?: string;
  listings_count?: number;
}

export function locationKey(location: Pick<City, 'city' | 'country'>): string {
  return normalizeText(location.city) + '|' + normalizeText(location.country);
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
    .map((item) => ({
      city: (item.city ?? item.name ?? '').trim(),
      slug: item.slug?.trim(),
      country:
        typeof item.country === 'string'
          ? item.country.trim()
          : (item.country?.name?.trim() ?? item.country_code ?? ''),
      listings_count: item.listings_count ?? item.profiles_count,
    }))
    .filter((item) => item.city && (item.listings_count ?? 0) > 0);

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
