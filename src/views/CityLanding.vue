<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ListingCard from '../components/ListingCard.vue';
import { api } from '../lib/api';
import { citySeoMetadata } from '../lib/city-seo';
import { setSeo } from '../lib/seo';
import { profileApiParams, profileRouteQuery, readProfileFilters } from '../lib/profile-search';
import { useListingsStore } from '../stores/listings';

interface Location {
  id: string;
  name: string;
  slug: string;
  country: { code: string; name: string };
  region?: { code: string; name: string } | null;
  listings_count: number;
  is_major: boolean;
}

const props = defineProps<{ locale: 'fr' | 'en' }>();
const route = useRoute();
const router = useRouter();
const store = useListingsStore();
const city = ref<Location | null>(null);
const loading = ref(true);
const error = ref('');
const filters = ref(readProfileFilters(route.query as Record<string, unknown>));
const english = computed(() => props.locale === 'en');
const citySlug = computed(() => String(route.params.citySlug));

async function load() {
  loading.value = true;
  error.value = '';
  filters.value = readProfileFilters(route.query as Record<string, unknown>);
  try {
    const response = await api.get(`/locations/${encodeURIComponent(citySlug.value)}`);
    city.value = response.data.data as Location;
    setSeo(citySeoMetadata(props.locale, city.value, filters.value));
    await store.search(profileApiParams(filters.value, city.value.slug));
  } catch {
    city.value = null;
    error.value = english.value ? 'This city could not be found.' : 'Cette ville est introuvable.';
    setSeo({
      ...citySeoMetadata(
        props.locale,
        { name: citySlug.value, slug: citySlug.value },
        filters.value,
      ),
      robots: 'noindex,follow',
    });
  } finally {
    loading.value = false;
  }
}

function updateFilters() {
  router.replace({ query: profileRouteQuery(filters.value) });
}

function clearFilters() {
  filters.value = {};
  updateFilters();
}

function goToPage(url: string | null) {
  if (url) void store.searchUrl(url);
}

watch(() => route.fullPath, load);
onMounted(load);
</script>

<template>
  <main class="v2-page v4-home">
    <section v-if="loading" class="v2-wrap v2-empty">
      {{ english ? 'Loading city…' : 'Chargement de la ville…' }}
    </section>
    <section v-else-if="error" class="v2-wrap v2-empty" role="alert">{{ error }}</section>
    <template v-else-if="city">
      <section class="v2-wrap v4-home-intro city-seo-header">
        <p class="v2-eyebrow">{{ english ? 'Local directory · 18+' : 'Annuaire local · 18+' }}</p>
        <h1>{{ english ? 'Profiles in' : 'Profils à' }} {{ city.name }}</h1>
        <p class="v2-lead">
          {{
            english
              ? 'Discover profiles and listings available in'
              : 'Découvrez les profils et annonces disponibles à'
          }}
          {{ city.name }}.
        </p>
        <p class="city-count">
          {{ city.listings_count }} {{ english ? 'published profiles' : 'annonces disponibles' }}
        </p>
      </section>
      <section class="v2-wrap v2-listings" aria-labelledby="listings-title">
        <div class="v2-section-heading">
          <h2 id="listings-title">
            {{ english ? 'Profiles to discover' : 'Profils à découvrir' }}
          </h2>
          <button class="v2-button ghost" type="button" @click="clearFilters">
            {{ english ? 'Clear filters' : 'Effacer les filtres' }}
          </button>
        </div>
        <div class="v2-filter-chips">
          <label class="v2-chip"
            ><input
              v-model="filters.gender"
              value="femme"
              type="radio"
              name="gender"
              @change="updateFilters"
            />
            Femme</label
          >
          <label class="v2-chip"
            ><input
              v-model="filters.gender"
              value="homme"
              type="radio"
              name="gender"
              @change="updateFilters"
            />
            Homme</label
          >
          <label class="v2-chip"
            ><input
              v-model="filters.gender"
              value="tvts"
              type="radio"
              name="gender"
              @change="updateFilters"
            />
            TV/TS</label
          >
          <label class="v2-chip"
            ><input
              v-model="filters.gender"
              value="couple"
              type="radio"
              name="gender"
              @change="updateFilters"
            />
            Couple</label
          >
          <label class="v2-chip"
            ><input v-model="filters.verified" value="1" type="checkbox" @change="updateFilters" />
            {{ english ? 'Verified' : 'Vérifiés' }}</label
          >
          <label class="v2-chip"
            ><input v-model="filters.has_video" value="1" type="checkbox" @change="updateFilters" />
            {{ english ? 'Video' : 'Vidéo' }}</label
          >
        </div>
        <div v-if="store.loading" class="v2-listing-grid">
          <span v-for="n in 4" :key="n" class="v2-listing-skeleton"></span>
        </div>
        <div v-else-if="store.listings.length" class="v2-listing-grid">
          <ListingCard
            v-for="(listing, index) in store.listings"
            :key="listing.id"
            :listing="listing"
            :index="index"
          />
        </div>
        <p v-else class="v2-empty">
          {{
            english
              ? 'No published profile is available in this city right now.'
              : 'Aucun profil publié n’est disponible dans cette ville pour le moment.'
          }}
        </p>
        <nav
          v-if="store.links.next || store.links.prev"
          class="mt-8 flex justify-center gap-3"
          aria-label="Pagination"
        >
          <button
            v-if="store.links.prev"
            class="v2-button"
            type="button"
            @click="goToPage(store.links.prev)"
          >
            {{ english ? 'Previous' : 'Précédent' }}</button
          ><button
            v-if="store.links.next"
            class="v2-button"
            type="button"
            @click="goToPage(store.links.next)"
          >
            {{ english ? 'Next' : 'Suivant' }}
          </button>
        </nav>
      </section>
    </template>
  </main>
</template>
