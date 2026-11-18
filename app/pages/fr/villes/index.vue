<script setup lang="ts">
import type { ApiLocation } from '../../../../src/lib/locations';
import { locationList, cityPath } from '../../../utils/public';
const api = usePublicApi();
const route = useRoute();
const { data, error } = await useAsyncData('locations-directory', () =>
  api<ApiLocation[] | { data: ApiLocation[] }>('/locations', {
    query: {
      has_listings: 1,
      search: route.query.search,
      is_major: route.query.is_major,
      per_page: 50,
      page: route.query.page,
    },
  }).then(locationList),
);
const config = useRuntimeConfig();
useSeoMeta({
  title: 'Villes — ÉLÉGANCE',
  description: 'Parcourez les villes françaises où des profils sont disponibles.',
  robots: 'index,follow',
});
useHead({
  link: [
    { rel: 'canonical', href: `${String(config.public.siteUrl).replace(/\/+$/, '')}/fr/villes` },
  ],
});
</script>
<template>
  <main class="v2-page v2-wrap">
    <p class="v2-eyebrow">Annuaire · 18+</p>
    <h1>Villes</h1>
    <form class="v2-search-panel" action="/fr/villes" method="get">
      <input name="search" :value="route.query.search" placeholder="Rechercher une ville" /><button
        class="v2-button primary"
      >
        Rechercher
      </button>
    </form>
    <p v-if="error" role="alert">Les villes ne peuvent pas être chargées.</p>
    <div class="v2-city-grid">
      <NuxtLink
        v-for="city in data ?? []"
        :key="city.slug"
        :to="cityPath(city.slug)"
        class="v2-city-card"
        ><strong>{{ city.name }}</strong
        ><small>{{ city.listings_count }} profils</small></NuxtLink
      >
    </div>
  </main>
</template>
