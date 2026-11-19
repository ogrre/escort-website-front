<script setup lang="ts">
import { fetchAllLocations } from '../../../composables/useLocations';
const api = usePublicApi();
const { data, error } = await useAsyncData('locations-directory', () =>
  fetchAllLocations(api, { country: 'FR', has_listings: 1, per_page: 100 }),
);
const config = useRuntimeConfig();
useSeoMeta({
  title: 'Toutes les villes — ÉLÉGANCE',
  description: 'Parcourez l’annuaire officiel des villes françaises et leurs profils publics.',
  robots: 'index,follow',
});
useHead({
  link: [
    { rel: 'canonical', href: `${String(config.public.siteUrl).replace(/\/+$/, '')}/fr/villes` },
  ],
});
</script>
<template>
  <main class="v8-directory v8-container">
    <nav class="v8-breadcrumb" aria-label="Fil d’Ariane">
      <NuxtLink to="/">Accueil</NuxtLink><span>/</span><span>Villes</span>
    </nav>
    <span class="v8-eyebrow">Explorer la France · 18+</span>
    <h1>Toutes les villes</h1>
    <p class="v8-lead">
      Explorez les profils publics par ville. Recherchez par nom ou utilisez l’index alphabétique.
    </p>
    <div v-if="error" class="v8-notice" role="alert">
      Impossible de charger l’annuaire. Réessayez plus tard.
    </div>
    <CityDirectoryGrid v-else :cities="data ?? []" />
  </main>
</template>
