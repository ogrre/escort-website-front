export function buildCitySearchQuery(values: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined && value !== ''),
  );
}
