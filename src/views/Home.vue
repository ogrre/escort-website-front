<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { api } from '../lib/api';
import { setSeo } from '../lib/seo';
import ListingCard from '../components/ListingCard.vue';
import { useListingsStore } from '../stores/listings';

interface City {
  city: string;
  country: string;
  listings_count: number;
}
const cities = ref<City[]>([]);
const listings = useListingsStore();
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
    title: 'Profils d’escorts par ville en France | Élégance',
    description:
      'Trouvez des profils disponibles par ville en France. Choisissez une ville et parcourez les annonces sur Élégance.',
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
  await listings.search({ limit: '6' });
});
</script>

<template>
  <main>
    <section class="hero-glow border-b border-stone-200/80">
      <div class="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <p class="eyebrow">Explore by location</p>
        <h1 class="mt-3 max-w-4xl text-4xl font-light leading-tight md:text-6xl">
          Trouvez un profil dans votre ville.
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
          Parcourez des profils disponibles et commencez par une ville.
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
            placeholder="Rechercher une ville"
            autocomplete="address-level2"
          />
          <button
            class="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-dusty-dark"
          >
            Rechercher
          </button>
        </form>
        <div class="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-500">
          <span>18+</span><span>Profils locaux</span><span>Navigation discrète</span>
        </div>
      </div>
    </section>
    <section
      v-if="listings.loading || listings.listings.length"
      class="border-b border-stone-200 bg-white"
      aria-labelledby="featured-listings-title"
    >
      <div class="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="eyebrow">Profils disponibles</p>
            <h2 id="featured-listings-title" class="mt-2 text-3xl font-light">
              Découvrez les derniers profils
            </h2>
          </div>
          <RouterLink to="/search" class="text-sm font-medium text-dusty-dark hover:underline">
            Tout voir →
          </RouterLink>
        </div>
        <div v-if="listings.loading" class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="item in 3"
            :key="item"
            class="aspect-[4/5] animate-pulse rounded-3xl bg-stone-100"
          ></div>
        </div>
        <div v-else class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ListingCard
            v-for="listing in listings.listings.slice(0, 6)"
            :key="listing.id"
            :listing="listing"
          />
        </div>
      </div>
    </section>
    <section class="border-b border-zinc-200 bg-white" aria-labelledby="city-directory-title">
      <div class="mx-auto max-w-7xl px-6 py-14">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="eyebrow">City directory</p>
            <h2 id="city-directory-title" class="mt-2 text-3xl font-light">Choisissez une ville</h2>
          </div>
          <RouterLink to="/search" class="text-sm font-medium text-dusty-dark hover:underline">
            Voir tous les profils →
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
            ><span class="mt-2 block text-sm text-zinc-500">{{ item.listings_count }} profils</span>
          </RouterLink>
        </div>
        <p v-if="!isLoading && !loadError && !filteredCities.length" class="mt-8 text-zinc-500">
          Les villes apparaîtront dès que des profils seront publiés.
        </p>
      </div>
    </section>
  </main>
</template>
