import { normalizeLocations, type ApiLocation, type City } from '../../src/lib/locations';

type LocationResponse = {
  data?: ApiLocation[];
  meta?: { current_page?: number; last_page?: number; pages?: number };
  links?: { next?: string | null };
};

export async function fetchAllLocations(
  api: ReturnType<typeof usePublicApi>,
  query: Record<string, string | number | undefined> = {},
  options: { maxPages?: number } = {},
): Promise<City[]> {
  const all: ApiLocation[] = [];
  let page = 1;
  let lastPage = 1;
  let hasNext = true;
  const maxPages = options.maxPages ?? 1000;
  while (hasNext && page <= maxPages) {
    const response = await api<LocationResponse>('/locations', {
      query: { ...query, page },
    });
    all.push(...(response.data ?? []));
    const meta = response.meta ?? {};
    lastPage = Number(meta.last_page ?? meta.pages ?? page);
    hasNext = Boolean(response.links?.next) || page < lastPage;
    page += 1;
  }
  return normalizeLocations(all, true).sort((a, b) =>
    a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }),
  );
}

export function cityMatches(city: City, search: string, letter: string): boolean {
  const normalized = city.name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('fr');
  const query = search.trim().toLocaleLowerCase('fr');
  const initial = normalized.charAt(0).toUpperCase();
  return (
    (!query ||
      normalized.includes(query) ||
      city.region?.name.toLocaleLowerCase().includes(query)) &&
    (!letter || initial === letter)
  );
}
