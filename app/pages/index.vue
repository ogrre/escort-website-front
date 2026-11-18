<script setup lang="ts">
import ListingCard from '../../src/components/ListingCard.vue';
import type { ApiLocation } from '../../src/lib/locations';
import { locationList, normalizePublicProfile, cityPath } from '../utils/public';

const api = usePublicApi();
const route = useRoute();
const { data } = await useAsyncData('home-public', async () => {
  const [locations, profiles] = await Promise.all([
    api<ApiLocation[] | { data: ApiLocation[] }>('/locations', {
      query: { is_major: 1, has_listings: 1, per_page: 12 },
    }),
    api<{ data: Record<string, any>[] }>('/profiles/search', {
      query: { limit: 8, sort: 'recommended', ...route.query },
    }),
  ]);
  return { cities: locationList(locations), listings: profiles.data.map(normalizePublicProfile) };
});
const config = useRuntimeConfig();
useSeoMeta({
  title: 'ÉLÉGANCE — Profils et annonces par ville',
  description:
    'Découvrez les profils et annonces disponibles dans les principales villes françaises.',
  robots: 'index,follow',
  ogTitle: 'ÉLÉGANCE — Profils et annonces par ville',
  ogDescription:
    'Découvrez les profils et annonces disponibles dans les principales villes françaises.',
});
useHead({
  link: [{ rel: 'canonical', href: `${String(config.public.siteUrl).replace(/\/+$/, '')}/` }],
});
</script>

<template>
  <main class="v2-page v4-home">
    <section class="v2-wrap v4-home-intro">
      <p class="v2-eyebrow">Annuaire France · 18+</p>
      <h1>Explorez les profils par ville.</h1>
      <h2>Les principales villes</h2>
      <div class="v2-city-grid">
        <NuxtLink
          v-for="city in data?.cities ?? []"
          :key="city.slug"
          :to="cityPath(city.slug)"
          class="v2-city-card"
          ><strong>{{ city.name }}</strong
          ><small>{{ city.listings_count }} profils</small></NuxtLink
        >
      </div>
      <NuxtLink to="/fr/villes" class="v2-button">Toutes les villes →</NuxtLink>
    </section>
    <section class="v2-search-panel v4-quick-search">
      <h2>Recherche rapide</h2>
      <form class="v2-search-row" action="/" method="get">
        <input name="q" :value="route.query.q" placeholder="Pseudo ou mot-clé" /><select
          name="gender"
          :value="route.query.gender"
        >
          <option value="">Tous les profils</option>
          <option value="femme">Femme</option>
          <option value="homme">Homme</option>
          <option value="tvts">TV / TS</option>
          <option value="couple">Couple</option></select
        ><button class="v2-button primary" type="submit">Rechercher</button>
      </form>
    </section>
    <section class="v2-wrap v2-listings">
      <h2>Profils à découvrir</h2>
      <div class="v2-listing-grid">
        <ListingCard
          v-for="(listing, index) in data?.listings ?? []"
          :key="listing.id"
          :listing="listing"
          :index="index"
        />
      </div>
      <p v-if="!data?.listings.length" class="v2-empty">
        Aucun profil publié n’est disponible pour le moment.
      </p>
    </section>
  </main>
</template>
