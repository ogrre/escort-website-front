<script setup lang="ts">
import PublicProfileCard from '../components/PublicProfileCard.vue';
import { useHomeDirectory } from '../composables/useHomeDirectory';
import { cityRouteSlug } from '../utils/public';
const { data, error } = await useHomeDirectory();

const visibleCities = computed(() => data.value?.cities ?? []);
const popularCities = computed(
  () => data.value?.major.filter((city) => city.listings_count > 0) ?? [],
);
const directoryUnavailable = computed(() => Boolean(error.value || data.value?.directoryError));
const config = useRuntimeConfig();

useSeoMeta({
  title: 'ÉLÉGANCE — Profils et annonces par ville',
  description: 'Explorez les villes et les profils publics disponibles sur ÉLÉGANCE.',
  robots: 'index,follow',
  ogTitle: 'ÉLÉGANCE — Profils et annonces par ville',
  ogDescription: 'Explorez les villes et les profils publics disponibles sur ÉLÉGANCE.',
});
useHead({
  link: [{ rel: 'canonical', href: `${String(config.public.siteUrl).replace(/\/+$/, '')}/` }],
});
</script>

<template>
  <main class="v8-home v8-container">
    <section class="v8-home-heading">
      <div>
        <span class="v8-eyebrow">Annuaire France · 18+</span>
        <h1>Escortes par ville</h1>
      </div>
      <span class="v8-muted v8-small">Données publiques vérifiées par Laravel</span>
    </section>
    <div v-if="!data && !error" class="v8-notice" role="status">Chargement de l’annuaire…</div>
    <div v-else-if="directoryUnavailable" class="v8-notice" role="alert">
      Les villes ne peuvent pas être chargées pour le moment.
    </div>
    <template v-else>
      <section class="v8-country-strip">
        <span>🇫🇷 France</span
        ><strong
          >{{ visibleCities.reduce((sum, city) => sum + city.listings_count, 0) }} annonces
          <small>actives</small></strong
        >
      </section>
      <section aria-labelledby="cities-title">
        <div class="v8-compact-city-grid">
          <NuxtLink
            v-for="city in popularCities"
            :key="city.slug"
            class="v8-compact-city"
            :to="`/fr/villes/${encodeURIComponent(cityRouteSlug(city.name))}`"
            ><span>{{ city.name }}</span
            ><b>{{ city.listings_count }}</b></NuxtLink
          >
        </div>
      </section>
      <section class="v8-compact-section">
        <div class="v8-compact-subhead">
          <h2 id="cities-title">Autres villes</h2>
          <NuxtLink to="/fr/villes">Toutes les villes ↗</NuxtLink>
        </div>
        <div class="v8-compact-city-grid">
          <NuxtLink
            v-for="city in visibleCities.filter(
              (item) => !popularCities.some((popular) => popular.slug === item.slug),
            )"
            :key="city.slug"
            class="v8-compact-city"
            :to="`/fr/villes/${encodeURIComponent(cityRouteSlug(city.name))}`"
            ><span>{{ city.name }}</span
            ><b>{{ city.listings_count }}</b></NuxtLink
          >
        </div>
      </section>
      <section v-if="data?.listings.length" class="v8-listing-section">
        <div class="v8-between">
          <h2>Dernières annonces</h2>
          <span class="v8-muted v8-small">Profils publiés récemment</span>
        </div>
        <div class="v8-cards">
          <PublicProfileCard
            v-for="(listing, index) in data.listings"
            :key="listing.id"
            :listing="listing"
            :index="index"
          />
        </div>
      </section>
    </template>
  </main>
</template>
