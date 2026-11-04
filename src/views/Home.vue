<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { api } from '../lib/api';
import { setSeo } from '../lib/seo';

interface City {
  city: string;
  country: string;
  listings_count: number;
}
const cities = ref<City[]>([]);
const cityQuery = ref('');
const isLoading = ref(true);
const loadError = ref('');
const filteredCities = computed(() => {
  const query = cityQuery.value.trim().toLowerCase();
  return query
    ? cities.value.filter((item) => item.city.toLowerCase().includes(query))
    : cities.value;
});
function submitCitySearch() {
  if (cityQuery.value.trim()) {
    window.location.href = `/cities/${encodeURIComponent(cityQuery.value.trim())}`;
  }
}
function updateCityStructuredData(items: City[]) {
  const id = 'city-directory-schema';
  let script = document.getElementById(id);
  if (!script) {
    const element = document.createElement('script');
    element.id = id;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
    script = element;
  }
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Escort profiles by city in France',
    itemListElement: items.slice(0, 50).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.city,
      url: `${window.location.origin}/cities/${encodeURIComponent(item.city)}`,
    })),
  });
}
onMounted(async () => {
  setSeo({
    title: 'Escort profiles by city in France | Élégance',
    description:
      'Explore verified and discreet escort profiles by city in France. Choose a city to discover local listings on Élégance.',
    canonical: `${window.location.origin}/`,
  });
  try {
    cities.value = (await api.get('/cities')).data.data;
    updateCityStructuredData(cities.value);
  } catch {
    loadError.value = 'We could not load the city directory. Please try again.';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <main>
    <section class="hero-glow border-b border-stone-200/80">
      <div class="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <p class="eyebrow">Explore by location</p>
        <h1 class="mt-3 max-w-4xl text-4xl font-light leading-tight md:text-6xl">
          Find escort profiles in your city.
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
          Start with a city to discover local profiles, clear information and a more discreet way to
          explore.
        </p>
        <form
          class="soft-card mt-8 flex max-w-2xl items-center gap-3 p-2"
          @submit.prevent="submitCitySearch"
        >
          <label for="city-search" class="sr-only">Search by city</label>
          <span class="pl-3 text-stone-400" aria-hidden="true">⌕</span>
          <input
            id="city-search"
            v-model="cityQuery"
            class="min-w-0 flex-1 bg-transparent px-1 py-3 outline-none"
            placeholder="Search for a city"
            autocomplete="address-level2"
          />
          <button
            class="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-dusty-dark"
          >
            Search
          </button>
        </form>
        <div class="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-500">
          <span>Adults only</span><span>Privacy first</span><span>Local search</span>
        </div>
      </div>
    </section>
    <section class="border-b border-zinc-200 bg-white" aria-labelledby="city-directory-title">
      <div class="mx-auto max-w-7xl px-6 py-14">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="eyebrow">City directory</p>
            <h2 id="city-directory-title" class="mt-2 text-3xl font-light">Choose a city</h2>
          </div>
          <RouterLink to="/search" class="text-sm font-medium text-dusty-dark hover:underline">
            View all listings →
          </RouterLink>
        </div>
        <div
          v-if="isLoading"
          class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Loading cities"
        >
          <div
            v-for="index in 8"
            :key="index"
            class="h-24 animate-pulse rounded-2xl bg-stone-100"
          ></div>
        </div>
        <p v-else-if="loadError" class="mt-8 rounded-2xl bg-red-50 p-5 text-red-700">
          {{ loadError }}
        </p>
        <div v-else class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RouterLink
            v-for="item in filteredCities"
            :key="`${item.city}-${item.country}`"
            :to="`/cities/${encodeURIComponent(item.city)}`"
            class="soft-card p-5 transition hover:-translate-y-1 hover:border-dusty"
          >
            <span class="text-xl">{{ item.city }}</span
            ><span class="mt-2 block text-sm text-zinc-500"
              >{{ item.listings_count }} profiles</span
            >
          </RouterLink>
        </div>
        <p v-if="!isLoading && !loadError && !filteredCities.length" class="mt-8 text-zinc-500">
          City pages will appear as listings are published.
        </p>
      </div>
    </section>
    <section class="bg-stone-50">
      <div class="mx-auto max-w-3xl px-6 py-14 text-center md:py-20">
        <p class="eyebrow">A local-first experience</p>
        <h2 class="mt-3 text-3xl font-light">Explore with your city as the starting point.</h2>
        <p class="mt-5 leading-8 text-stone-600">
          Every city page is designed to make discovery simple: browse available profiles, compare
          useful details and return to the directory whenever you want to explore somewhere new.
        </p>
      </div>
    </section>
  </main>
</template>
