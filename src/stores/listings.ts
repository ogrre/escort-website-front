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
        async () => (await api.get('/listings', { params })).data.data,
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
