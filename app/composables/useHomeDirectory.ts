import { fetchAllLocations } from './useLocations';
import { normalizePublicProfile } from '../utils/public';
import { useState } from '#imports';

export function useHomeDirectory() {
  const api = usePublicApi();
  const locationCache = useState('public-location-directory', () => []);

  return useAsyncData(
    'home-directory',
    async () => {
      let cities: Awaited<ReturnType<typeof fetchAllLocations>> = [];
      let major: Awaited<ReturnType<typeof fetchAllLocations>> = [];
      let directoryError = false;

      try {
        [cities, major] = await Promise.all([
          fetchAllLocations(api, { country: 'FR', has_listings: 1, per_page: 100 }),
          fetchAllLocations(api, { country: 'FR', is_major: 1, has_listings: 1, per_page: 100 }),
        ]);
        locationCache.value = cities;
      } catch {
        directoryError = true;
      }

      let listings: ReturnType<typeof normalizePublicProfile>[] = [];
      try {
        const profiles = await api<{ data?: Record<string, any>[] }>('/profiles/search', {
          query: { limit: 6, sort: 'newest', view: 'cards' },
        });
        listings = (profiles.data ?? []).map(normalizePublicProfile);
      } catch {
        // The directory remains useful when the optional profile request is unavailable.
      }

      return { cities, major, listings, directoryError };
    },
    {
      default: () => ({ cities: [], major: [], listings: [], directoryError: true }),
    },
  );
}
