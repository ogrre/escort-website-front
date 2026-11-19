<script setup lang="ts">
import { fetchAllLocations } from '../../../composables/useLocations';
const api = usePublicApi();
const { data, error } = await useAsyncData('locations-directory-en', () =>
  fetchAllLocations(api, { country: 'FR', has_listings: 1, per_page: 100 }),
);
const config = useRuntimeConfig();
useSeoMeta({
  title: 'All cities — ÉLÉGANCE',
  description: 'Browse the official directory of French cities and public profiles.',
  robots: 'index,follow',
});
useHead({
  link: [
    { rel: 'canonical', href: `${String(config.public.siteUrl).replace(/\/+$/, '')}/en/cities` },
  ],
});
</script>
<template>
  <main class="v8-directory v8-container">
    <nav class="v8-breadcrumb" aria-label="Breadcrumb">
      <NuxtLink to="/">Home</NuxtLink><span>/</span><span>Cities</span>
    </nav>
    <span class="v8-eyebrow">Explore France · 18+</span>
    <h1>All cities</h1>
    <p class="v8-lead">
      Explore public profiles by city. Search by name or use the alphabetical index.
    </p>
    <div v-if="error" class="v8-notice" role="alert">The directory could not be loaded.</div>
    <CityDirectoryGrid v-else :cities="data ?? []" />
  </main>
</template>
