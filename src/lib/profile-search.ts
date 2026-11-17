export const SEARCH_PARAMETERS = [
  'q',
  'city',
  'city_id',
  'around_me',
  'lat',
  'lng',
  'radius',
  'gender',
  'verified',
  'has_video',
  'phone',
  'age_min',
  'age_max',
  'nationality',
  'ethnicity',
  'language',
  'sort',
  'page',
  'limit',
  'view',
] as const;

export const GENDERS = ['femme', 'homme', 'tvts', 'couple'] as const;
export type SearchParameter = (typeof SEARCH_PARAMETERS)[number];
export type SearchFilters = Partial<Record<SearchParameter, string>>;

export function readProfileFilters(
  input: URLSearchParams | Record<string, unknown>,
): SearchFilters {
  const result: SearchFilters = {};
  for (const key of SEARCH_PARAMETERS) {
    const value = input instanceof URLSearchParams ? input.get(key) : input[key];
    if (value !== undefined && value !== null && String(value) !== '') result[key] = String(value);
  }
  if (result.gender && !GENDERS.includes(result.gender as (typeof GENDERS)[number])) {
    delete result.gender;
  }
  return result;
}

export function profileApiParams(
  filters: SearchFilters = {},
  citySlug?: string,
): Record<string, string> {
  const params = { ...filters };
  if (citySlug) params.city = citySlug;
  return {
    limit: '24',
    page: '1',
    sort: 'recommended',
    ...params,
  };
}

export function profileRouteQuery(filters: SearchFilters): Record<string, string | undefined> {
  return Object.fromEntries(SEARCH_PARAMETERS.map((key) => [key, filters[key]]));
}

export function isFilteredProfileUrl(filters: SearchFilters): boolean {
  return Object.keys(filters).some((key) => !['page', 'limit', 'sort', 'view'].includes(key));
}
