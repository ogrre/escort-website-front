<script setup lang="ts">
import PublicProfileCard from '../../components/PublicProfileCard.vue';
import { useHomeDirectory } from '../../composables/useHomeDirectory';
import { cityPath, cityRouteSlug } from '../../utils/public';
const { data, error } = await useHomeDirectory();

const visibleCities = computed(() => data.value?.cities ?? []);
const popularCities = computed(
  () => data.value?.major.filter((city) => city.listings_count > 0) ?? [],
);
const directoryUnavailable = computed(() => Boolean(error.value || data.value?.directoryError));
const config = useRuntimeConfig();

useSeoMeta({
  title: 'ÉLÉGANCE — Profiles and listings by city',
  description: 'Explore cities and public profiles available on ÉLÉGANCE.',
  robots: 'index,follow',
  ogTitle: 'ÉLÉGANCE — Profiles and listings by city',
  ogDescription: 'Explore cities and public profiles available on ÉLÉGANCE.',
});
useHead({
  link: [{ rel: 'canonical', href: `${String(config.public.siteUrl).replace(/\/+$/, '')}/en` }],
});
</script>

<template>
  <main class="v8-home v8-container">
    <section class="v8-home-heading">
      <div>
        <span class="v8-eyebrow">France directory · 18+</span>
        <h1>Escorts by city</h1>
      </div>
      <span class="v8-muted v8-small">Public data verified by Laravel</span>
    </section>
    <div v-if="!data && !error" class="v8-notice" role="status">Loading the directory…</div>
    <div v-else-if="directoryUnavailable" class="v8-notice" role="alert">
      Cities cannot be loaded at the moment.
    </div>
    <template v-else>
      <section class="v8-country-strip">
        <span>🇫🇷 France</span
        ><strong
          >{{ visibleCities.reduce((sum, city) => sum + city.listings_count, 0) }} listings
          <small>active</small></strong
        >
      </section>
      <section aria-labelledby="cities-title">
        <div class="v8-compact-city-grid">
          <NuxtLink
            v-for="city in popularCities"
            :key="city.slug"
            class="v8-compact-city"
            :to="cityPath(cityRouteSlug(city.name), 'en')"
            ><span>{{ city.name }}</span
            ><b>{{ city.listings_count }}</b></NuxtLink
          >
        </div>
      </section>
      <section class="v8-compact-section">
        <div class="v8-compact-subhead">
          <h2 id="cities-title">Other cities</h2>
          <NuxtLink to="/en/cities">All cities ↗</NuxtLink>
        </div>
        <div class="v8-compact-city-grid">
          <NuxtLink
            v-for="city in visibleCities.filter(
              (item) => !popularCities.some((popular) => popular.slug === item.slug),
            )"
            :key="city.slug"
            class="v8-compact-city"
            :to="cityPath(cityRouteSlug(city.name), 'en')"
            ><span>{{ city.name }}</span
            ><b>{{ city.listings_count }}</b></NuxtLink
          >
        </div>
      </section>
      <section v-if="data?.listings.length" class="v8-listing-section">
        <div class="v8-between">
          <h2>Latest listings</h2>
          <span class="v8-muted v8-small">Recently published profiles</span>
        </div>
        <div class="v8-cards">
          <PublicProfileCard
            v-for="(listing, index) in data.listings"
            :key="listing.id"
            :listing="listing"
            :index="index"
            locale="en"
          />
        </div>
      </section>
    </template>
  </main>
</template>
