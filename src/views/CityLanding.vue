<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import ListingCard from '../components/ListingCard.vue';
import { api } from '../lib/api';
import { setSeo } from '../lib/seo';
import { useListingsStore } from '../stores/listings';

interface Location {
  id: string;
  name: string;
  slug: string;
  listings_count: number;
}

const props = defineProps<{ locale: 'fr' | 'en' }>();
const route = useRoute();
const store = useListingsStore();
const city = ref<Location | null>(null);
const loading = ref(true);
const error = ref('');
const english = computed(() => props.locale === 'en');
const citySlug = computed(() => String(route.params.citySlug));
const cityUrl = computed(
  () =>
    `${window.location.origin}/${props.locale}/${english.value ? 'cities' : 'villes'}/${encodeURIComponent(citySlug.value)}`,
);

async function load() {
  try {
    const response = await api.get(`/locations/${encodeURIComponent(citySlug.value)}`);
    city.value = response.data.data as Location;
    setSeo({
      title: `${english.value ? 'Profiles in' : 'Profils à'} ${city.value.name} | Élégance`,
      description: `${english.value ? 'Discover profiles and listings available in' : 'Découvrez les profils et annonces disponibles à'} ${city.value.name}.`,
      canonical: cityUrl.value,
      robots: Object.keys(route.query).length ? 'noindex,follow' : 'index,follow',
    });
    await store.search({ city: city.value.slug, sort: 'recommended', limit: '24', page: '1' });
  } catch {
    error.value = english.value ? 'This city could not be found.' : 'Cette ville est introuvable.';
    setSeo({
      title: error.value,
      description: error.value,
      canonical: cityUrl.value,
      robots: 'noindex,follow',
    });
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <main class="v2-page v4-home">
    <section v-if="loading" class="v2-wrap v2-empty">
      {{ english ? 'Loading city…' : 'Chargement de la ville…' }}
    </section>
    <section v-else-if="error" class="v2-wrap v2-empty">{{ error }}</section>
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
        <h2 id="listings-title">{{ english ? 'Profiles to discover' : 'Profils à découvrir' }}</h2>
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
      </section>
    </template>
  </main>
</template>
