import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../lib/api';
import { cachedRequest } from '../lib/request-cache';

export interface Listing {
  id: string;
  slug?: string;
  name: string;
  description: string;
  age: number;
  city: string;
  country?: string;
  services: string[];
  photos: { id?: string; url: string; alt?: string }[];
  verified: boolean;
  boosted: boolean;
  status_text?: string;
  availability?: Record<string, unknown>;
  languages?: string[];
  tags?: string[];
  contacts?: Record<string, { enabled: boolean; value: string }>;
  comments?: { id: string; body: string; author?: { name?: string } }[];
}

interface ProfileSearchResult {
  id: string;
  slug?: string;
  pseudo?: string;
  name?: string;
  description?: string;
  short_bio?: string;
  age?: number;
  city?: { name?: string; slug?: string } | null;
  main_photo?: { url?: string; thumbnail_url?: string } | null;
  is_verified?: boolean;
  verified?: boolean;
  boosted?: boolean;
}

function normalizeProfile(profile: ProfileSearchResult): Listing {
  const name = profile.pseudo ?? profile.name ?? '';
  const photoUrl = profile.main_photo?.thumbnail_url ?? profile.main_photo?.url;
  return {
    id: profile.id,
    slug: profile.slug,
    name,
    description: profile.short_bio ?? profile.description ?? '',
    age: profile.age ?? 0,
    city: profile.city?.name ?? '',
    services: [],
    photos: photoUrl ? [{ url: photoUrl, alt: name }] : [],
    verified: profile.is_verified ?? profile.verified ?? false,
    boosted: profile.boosted ?? false,
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
      const requestParams = { limit: '24', ...params };
      const cacheKey = 'profiles:' + JSON.stringify(requestParams);
      listings.value = await cachedRequest(
        cacheKey,
        async () => {
          const response = await api.get('/profiles/search', { params: requestParams });
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
