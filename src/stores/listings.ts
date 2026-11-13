import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../lib/api';
import { cachedRequest } from '../lib/request-cache';
export interface Listing {
  id: string;
  slug: string;
  name: string;
  description: string;
  age: number;
  city: string;
  country: string;
  services: string[];
  photos: { id?: string; url: string; alt?: string }[];
  verified: boolean;
  boosted: boolean;
  gender?: string;
  has_video?: boolean;
  status_text?: string;
  availability?: Record<string, unknown>;
  languages?: string[];
  tags?: string[];
  contacts?: Record<string, { enabled: boolean; value: string }>;
  comments?: { id: string; body: string; author?: { name?: string } }[];
}

interface ProfileSearchResult {
  id: string;
  slug: string;
  pseudo: string;
  age: number;
  city?: { name?: string } | null;
  gender?: string;
  is_verified?: boolean;
  has_video?: boolean;
  main_photo?: { url?: string; thumbnail_url?: string } | null;
  short_bio?: string;
}

function normalizeProfile(profile: ProfileSearchResult): Listing {
  const photoUrl = profile.main_photo?.thumbnail_url ?? profile.main_photo?.url;
  return {
    id: profile.id,
    slug: profile.slug,
    name: profile.pseudo,
    description: profile.short_bio ?? '',
    age: profile.age,
    city: profile.city?.name ?? '',
    country: 'FR',
    services: [],
    photos: photoUrl ? [{ url: photoUrl, alt: profile.pseudo }] : [],
    verified: Boolean(profile.is_verified),
    boosted: false,
    gender: profile.gender,
    has_video: Boolean(profile.has_video),
  };
}
export const useListingsStore = defineStore('listings', () => {
  const listings = ref<Listing[]>([]);
  const loading = ref(false);
  const error = ref('');
  async function search(params: Record<string, string> = {}) {
    loading.value = true;
    error.value = '';
    try {
      const cacheKey = 'listings:' + JSON.stringify(params);
      listings.value = await cachedRequest(
        cacheKey,
        async () => {
          const response = await api.get('/profiles/search', {
            params: { limit: 24, ...params },
          });
          return (response.data.data as ProfileSearchResult[]).map(normalizeProfile);
        },
        30_000,
      );
    } catch {
      listings.value = [];
      error.value = 'Listings could not be loaded. Please try again.';
    } finally {
      loading.value = false;
    }
  }
  return { listings, loading, error, search };
});
