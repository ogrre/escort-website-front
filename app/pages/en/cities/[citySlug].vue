<script setup lang="ts">
import { useState } from '#imports';
import {
  cityRouteSlug,
  normalizePublicProfile,
  canonicalSiteUrl,
  cityPath,
} from '../../../utils/public';
import { fetchAllLocations } from '../../../composables/useLocations';
const route = useRoute();
const router = useRouter();
const api = usePublicApi();
const siteUrl = String(useRuntimeConfig().public.siteUrl);
const slug = String(route.params.citySlug);
const drawerOpen = ref(false);
const filtersForUi = computed(() =>
  Object.fromEntries(
    Object.entries(route.query).map(([key, value]) => [
      key,
      Array.isArray(value) ? String(value[0]) : String(value ?? ''),
    ]),
  ),
);
const locationCache = useState<any[]>('public-location-directory', () => []);
const { data, error } = await useAsyncData(
  `city-en:${slug}:${JSON.stringify(route.query)}`,
  async () => {
    const locations = locationCache.value.length
      ? locationCache.value
      : await fetchAllLocations(api, { country: 'FR', has_listings: 1, per_page: 100 });
    locationCache.value = locations;
    const requested = decodeURIComponent(slug)
      .toLocaleLowerCase('en')
      .replace(/[^a-z0-9]+/g, '-');
    const resolvedCity = locations.find(
      (candidate: any) => cityRouteSlug(String(candidate.name ?? '')) === requested,
    );
    if (!resolvedCity) throw createError({ statusCode: 404, statusMessage: 'City not found' });
    const apiCitySlug = resolvedCity.slug;
    const profiles = await api<any>('/profiles/search', {
      query: { city: apiCitySlug, limit: 24, sort: 'recommended', ...route.query },
    });
    return { city: resolvedCity, profiles: profiles.data ?? [] };
  },
);
if (error.value || !data.value?.city)
  throw createError({ statusCode: 404, statusMessage: 'City not found' });
useSeoMeta(() => ({
  title: `Profiles in ${data.value!.city.name} | ÉLÉGANCE`,
  description: `Discover public profiles available in ${data.value!.city.name}.`,
  robots: Object.keys(route.query).length ? 'noindex,follow' : 'index,follow',
}));
useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalSiteUrl(cityPath(slug, 'en'), siteUrl) }],
}));
function updateQuery(values: Record<string, string | undefined>) {
  const query = { ...route.query, ...values } as Record<string, string | undefined>;
  Object.keys(query).forEach((key) => {
    if (!query[key]) delete query[key];
  });
  void router.push({ path: route.path, query });
}
function toggleFilter(key: string) {
  updateQuery({ [key]: route.query[key] ? undefined : '1', page: undefined });
}
function applyAdvanced(values: Record<string, string | undefined>) {
  drawerOpen.value = false;
  updateQuery({ ...values, page: undefined });
}
function toggleAdvanced() {
  drawerOpen.value = !drawerOpen.value;
}
function resetFilters() {
  drawerOpen.value = false;
  void router.push({ path: route.path });
}
function setSort(event: Event) {
  updateQuery({ sort: (event.target as HTMLSelectElement).value, page: undefined });
}
</script>
<template>
  <main class="e-page e-wrap">
    <nav class="e-breadcrumb" aria-label="Breadcrumb">
      <NuxtLink to="/">Home</NuxtLink><span>/</span><NuxtLink to="/en/cities">Cities</NuxtLink
      ><span>/</span><span>{{ data.city.name }}</span>
    </nav>
    <h1 class="v8-city-heading">Profiles in {{ data.city.name }}</h1>
    <section class="e-section">
      <ProfileSearchBar
        :city-slug="slug"
        :values="filtersForUi"
        locale="en"
        :advanced-open="drawerOpen"
        @advanced="toggleAdvanced"
      />
      <ProfileFiltersDrawer
        id="advanced-filters"
        :open="drawerOpen"
        :values="filtersForUi"
        @close="drawerOpen = false"
        @apply="applyAdvanced"
        @reset="resetFilters"
      />
      <div class="e-quick-filters" aria-label="Quick filters">
        <button
          type="button"
          :class="{ active: route.query.verified }"
          @click="toggleFilter('verified')"
        >
          ✓ Verified
        </button>
        <button
          type="button"
          :class="{ active: route.query.has_video }"
          @click="toggleFilter('has_video')"
        >
          With video
        </button>
        <button type="button" :class="{ active: route.query.phone }" @click="toggleFilter('phone')">
          Phone visible
        </button>
        <button type="button" @click="drawerOpen = true">All filters ＋</button>
      </div>
      <div class="e-results-bar">
        <div>
          <span class="e-kicker">Public results</span>
          <h2>{{ data.profiles.length }} profiles in {{ data.city.name }}</h2>
        </div>
        <label class="e-sort"
          ><span>Sort</span
          ><select :value="route.query.sort || 'recommended'" @change="setSort">
            <option value="recommended">Recommended</option>
            <option value="newest">Newest</option>
            <option value="most_viewed">Most viewed</option>
            <option value="last_update">Recently updated</option>
            <option value="last_online">Recently online</option>
          </select></label
        >
      </div>
      <div class="e-profile-grid">
        <PublicProfileCard
          v-for="(profile, index) in data.profiles.map(normalizePublicProfile)"
          :key="profile.id"
          :listing="profile"
          :index="index"
          locale="en"
        />
      </div>
      <p v-if="!data.profiles.length" class="e-empty">
        No public profile is available in this city right now.
      </p>
    </section>
  </main>
</template>
