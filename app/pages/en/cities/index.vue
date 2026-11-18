<script setup lang="ts">
import type { ApiLocation } from '../../../../src/lib/locations';
import { locationList, cityPath } from '../../../utils/public';
const api = usePublicApi();
const { data } = await useAsyncData('locations-directory-en', () =>
  api<ApiLocation[] | { data: ApiLocation[] }>('/locations', {
    query: { has_listings: 1, per_page: 50 },
  }).then(locationList),
);
const config = useRuntimeConfig();
useSeoMeta({
  title: 'Cities — ÉLÉGANCE',
  description: 'Browse French cities with available profiles.',
  robots: 'index,follow',
});
useHead({
  link: [
    { rel: 'canonical', href: `${String(config.public.siteUrl).replace(/\/+$/, '')}/en/cities` },
  ],
});
</script>
<template>
  <main class="v2-page v2-wrap">
    <p class="v2-eyebrow">Directory · 18+</p>
    <h1>Cities</h1>
    <div class="v2-city-grid">
      <NuxtLink
        v-for="city in data ?? []"
        :key="city.slug"
        :to="cityPath(city.slug, 'en')"
        class="v2-city-card"
        ><strong>{{ city.name }}</strong
        ><small>{{ city.listings_count }} profiles</small></NuxtLink
      >
    </div>
  </main>
</template>
