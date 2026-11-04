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
  listings_count?: number;
}

export function normalizeLocations(items: ApiLocation[]): City[] {
  return items
    .map((item) => ({
      city: item.city ?? item.name ?? '',
      country:
        typeof item.country === 'string'
          ? item.country
          : (item.country?.name ?? item.country_code ?? ''),
      listings_count: item.listings_count ?? item.profiles_count,
    }))
    .filter((item) => item.city);
}
