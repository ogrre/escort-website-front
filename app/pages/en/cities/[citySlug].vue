<script setup lang="ts">
import ListingCard from '../../../../src/components/ListingCard.vue';
import { normalizePublicProfile, canonicalSiteUrl, cityPath } from '../../../utils/public';
const route = useRoute();
const api = usePublicApi();
const slug = String(route.params.citySlug);
const { data, error } = await useAsyncData(`city-en:${slug}`, async () => {
  const city = await api<any>(`/locations/${encodeURIComponent(slug)}`);
  const profiles = await api<any>('/profiles/search', {
    query: { city: slug, limit: 24, sort: 'recommended', ...route.query },
  });
  return { city: city.data ?? city, profiles: profiles.data ?? [] };
});
if (error.value || !data.value?.city)
  throw createError({ statusCode: 404, statusMessage: 'City not found' });
useSeoMeta(() => ({
  title: `Profiles in ${data.value!.city.name} | ÉLÉGANCE`,
  description: `Discover profiles and listings available in ${data.value!.city.name}.`,
  robots: Object.keys(route.query).length ? 'noindex,follow' : 'index,follow',
}));
useHead(() => ({ link: [{ rel: 'canonical', href: canonicalSiteUrl(cityPath(slug, 'en')) }] }));
</script>
<template>
  <main class="v2-page v4-home">
    <section class="v2-wrap v4-home-intro">
      <p class="v2-eyebrow">Local directory · 18+</p>
      <h1>Profiles in {{ data.city.name }}</h1>
      <p class="v2-lead">Discover profiles and listings available in {{ data.city.name }}.</p>
      <p class="city-count">{{ data.city.listings_count }} published profiles</p>
    </section>
    <section class="v2-wrap v2-listings">
      <h2>Profiles to discover</h2>
      <div class="v2-listing-grid">
        <ListingCard
          v-for="(profile, index) in data.profiles.map(normalizePublicProfile)"
          :key="profile.id"
          :listing="profile"
          :index="index"
        />
      </div>
    </section>
  </main>
</template>
