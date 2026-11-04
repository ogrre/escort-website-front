<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../lib/api';
import { normalizeLocations, type ApiLocation, type City } from '../lib/locations';
import { setSeo } from '../lib/seo';
import { localeKey, type Locale } from '../lib/locale';

const router = useRouter();
const locale = inject(localeKey, ref<Locale>('fr'));
const copy = computed(() =>
  locale.value === 'fr'
    ? {
        eyebrow: 'Annuaire',
        title: 'Choisissez une ville',
        search: 'Chercher',
        major: 'Villes principales',
        withListings: 'Autres villes avec annonces',
        profiles: 'annonces disponibles',
        empty: 'Aucune ville disponible pour le moment.',
        searchEmpty: 'Aucune ville trouvée.',
      }
    : {
        eyebrow: 'Directory',
        title: 'Choose a city',
        search: 'Search',
        major: 'Major cities',
        withListings: 'Other cities with listings',
        profiles: 'listings available',
        empty: 'No cities are available right now.',
        searchEmpty: 'No city found.',
      },
);
const majorCities = ref<City[]>([]);
const otherCities = ref<City[]>([]);
const cityQuery = ref('');
const citiesLoading = ref(true);
const citiesError = ref('');
const searchResults = ref<City[]>([]);
const searchLoading = ref(false);
const searched = ref(false);
const cities = computed(() => [...majorCities.value, ...otherCities.value]);
const groupedMajorCities = computed(() => {
  const groups = new Map<string, City[]>();
  majorCities.value.forEach((city) => {
    const country = city.country || 'Autres pays';
    groups.set(country, [...(groups.get(country) ?? []), city]);
  });
  return [...groups.entries()];
});
const groupedOtherCities = computed(() => {
  const groups = new Map<string, City[]>();
  otherCities.value.forEach((city) => {
    const country = city.country || 'Autres pays';
    groups.set(country, [...(groups.get(country) ?? []), city]);
  });
  return [...groups.entries()];
});

async function searchLocations() {
  const query = cityQuery.value.trim();
  if (!query) {
    searched.value = false;
    searchResults.value = [];
    return;
  }
  searched.value = true;
  searchLoading.value = true;
  searchResults.value = [];
  try {
    const response = await api.get('/locations', {
      params: { search: query, has_listings: 1 },
    });
    searchResults.value = normalizeLocations(response.data.data as ApiLocation[]);
  } catch {
    searchResults.value = [];
  } finally {
    searchLoading.value = false;
  }
}

function openCity(city: string) {
  router.push(`/cities/${encodeURIComponent(city)}`);
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
    name: 'Annuaire de profils par ville',
    itemListElement: items.slice(0, 100).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.city,
      url: `${window.location.origin}/cities/${encodeURIComponent(item.city)}`,
    })),
  });
}

onMounted(async () => {
  setSeo({
    title: 'Annuaire de profils par ville | Élégance',
    description: 'Parcourez les profils disponibles et les villes couvertes par Élégance.',
    canonical: `${window.location.origin}/`,
  });

  try {
    const [majorResponse, listedResponse] = await Promise.all([
      api.get('/locations', { params: { is_major: 1, has_listings: 1 } }),
      api.get('/locations', { params: { has_listings: 1 } }),
    ]);
    majorCities.value = normalizeLocations(majorResponse.data.data as ApiLocation[]);
    const majorKeys = new Set(majorCities.value.map((item) => `${item.city}-${item.country}`));
    otherCities.value = normalizeLocations(listedResponse.data.data as ApiLocation[]).filter(
      (item) => !majorKeys.has(`${item.city}-${item.country}`),
    );
    updateCityStructuredData(cities.value);
  } catch {
    citiesError.value = 'Les villes sont momentanément indisponibles.';
  } finally {
    citiesLoading.value = false;
  }
});
</script>

<template>
  <main>
    <section class="border-b border-stone-200 bg-white dark:border-stone-800">
      <div class="mx-auto max-w-7xl px-5 py-7 md:px-6 md:py-10">
        <div class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="eyebrow">{{ copy.eyebrow }}</p>
            <h1 class="mt-2 text-3xl font-light md:text-4xl">{{ copy.title }}</h1>
          </div>
          <form
            class="flex w-full max-w-md flex-col gap-2 sm:flex-row"
            @submit.prevent="searchLocations"
          >
            <label for="city-search" class="sr-only">Rechercher une ville</label>
            <input
              id="city-search"
              v-model="cityQuery"
              class="h-12 min-w-0 flex-1 rounded-full border border-stone-300 bg-stone-50 px-5 outline-none transition focus:border-dusty focus:ring-2 focus:ring-dusty/30"
              :placeholder="locale === 'fr' ? 'Rechercher une ville' : 'Search for a city'"
              autocomplete="address-level2"
            />
            <button class="button-primary h-12 w-full sm:w-auto">{{ copy.search }}</button>
          </form>
        </div>
        <div v-if="searched" class="relative mt-3 w-full max-w-md md:ml-auto">
          <div v-if="searchLoading" class="text-sm text-stone-500">Chargement…</div>
          <div
            v-else-if="searchResults.length"
            class="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg dark:border-stone-800 dark:bg-stone-900"
          >
            <button
              v-for="item in searchResults.slice(0, 6)"
              :key="`${item.city}-${item.country}`"
              type="button"
              class="directory-search-result"
              @click="openCity(item.city)"
            >
              <span>{{ item.city }}</span>
              <span v-if="item.listings_count" class="text-xs text-stone-500">
                {{ item.listings_count }} {{ copy.profiles }}
              </span>
              <span v-else class="text-xs text-stone-500">{{ copy.profiles }}</span>
            </button>
          </div>
          <p v-else class="text-sm text-stone-500">{{ copy.searchEmpty }}</p>
        </div>
      </div>
    </section>

    <section class="bg-stone-50 dark:bg-stone-950" aria-labelledby="cities-title">
      <div class="mx-auto max-w-7xl px-5 py-8 md:px-6 md:py-14">
        <div v-if="citiesLoading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="item in 8"
            :key="item"
            class="h-16 animate-pulse rounded-2xl bg-stone-200"
          ></div>
        </div>
        <p v-else-if="citiesError" class="mt-5 text-sm text-red-700">{{ citiesError }}</p>
        <div v-else-if="cities.length" class="space-y-10">
          <div>
            <h2 id="cities-title" class="mb-4 text-xl font-medium">{{ copy.major }}</h2>
            <div
              v-for="[country, countryCities] in groupedMajorCities"
              :key="`major-${country}`"
              class="mb-6 last:mb-0"
            >
              <h2 class="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-stone-500">
                {{ country }}
              </h2>
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <RouterLink
                  v-for="item in countryCities"
                  :key="`${item.city}-${item.country}`"
                  :to="`/cities/${encodeURIComponent(item.city)}`"
                  class="city-link touch-target rounded-2xl border border-stone-200 bg-white p-4 transition dark:border-stone-800 dark:bg-stone-900"
                >
                  <span class="font-medium">{{ item.city }}</span>
                  <span v-if="item.listings_count" class="mt-1 block text-sm text-stone-500">
                    {{ item.listings_count }} {{ copy.profiles }}
                  </span>
                  <span v-else class="mt-1 block text-sm text-stone-500">{{ copy.profiles }}</span>
                </RouterLink>
              </div>
            </div>
          </div>
          <div v-if="otherCities.length">
            <h2 class="mb-4 text-xl font-medium">{{ copy.withListings }}</h2>
            <div
              v-for="[country, countryCities] in groupedOtherCities"
              :key="`other-${country}`"
              class="mb-6 last:mb-0"
            >
              <h3 class="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-stone-500">
                {{ country }}
              </h3>
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <RouterLink
                  v-for="item in countryCities"
                  :key="`${item.city}-${item.country}`"
                  :to="`/cities/${encodeURIComponent(item.city)}`"
                  class="city-link touch-target rounded-2xl border border-stone-200 bg-white p-4 transition dark:border-stone-800 dark:bg-stone-900"
                >
                  <span class="font-medium">{{ item.city }}</span>
                  <span v-if="item.listings_count" class="mt-1 block text-sm text-stone-500">
                    {{ item.listings_count }} {{ copy.profiles }}
                  </span>
                  <span v-else class="mt-1 block text-sm text-stone-500">{{ copy.profiles }}</span>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="rounded-2xl border border-dashed border-stone-300 p-6 text-stone-500">
          {{ copy.empty }}
        </p>
      </div>
    </section>
  </main>
</template>
