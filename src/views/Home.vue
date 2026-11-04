<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ListingCard from '../components/ListingCard.vue';
import { api } from '../lib/api';
import { setSeo } from '../lib/seo';
import { useListingsStore } from '../stores/listings';

interface City {
  city: string;
  country: string;
  listings_count: number;
}

const router = useRouter();
const listings = useListingsStore();
const cities = ref<City[]>([]);
const cityQuery = ref('');
const citiesLoading = ref(true);
const citiesError = ref('');

function submitCitySearch() {
  const city = cityQuery.value.trim();
  if (city) router.push(`/cities/${encodeURIComponent(city)}`);
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
    const [citiesResponse] = await Promise.all([
      api.get('/cities'),
      listings.search({ limit: '12' }),
    ]);
    cities.value = citiesResponse.data.data;
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
      <div class="mx-auto max-w-7xl px-6 py-8 md:py-10">
        <div class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="eyebrow">Annuaire</p>
            <h1 class="mt-2 text-3xl font-light md:text-4xl">Profils disponibles</h1>
          </div>
          <form
            class="flex w-full max-w-md flex-col gap-2 sm:flex-row"
            @submit.prevent="submitCitySearch"
          >
            <label for="city-search" class="sr-only">Rechercher une ville</label>
            <input
              id="city-search"
              v-model="cityQuery"
              class="min-w-0 flex-1 rounded-full border border-stone-300 bg-stone-50 px-5 py-3 outline-none transition focus:border-dusty focus:ring-2 focus:ring-dusty/30"
              placeholder="Aller à une ville"
              autocomplete="address-level2"
            />
            <button class="button-primary w-full sm:w-auto">Ouvrir</button>
          </form>
        </div>
        <nav
          v-if="!citiesLoading && cities.length"
          class="mt-7 flex gap-2 overflow-x-auto pb-1"
          aria-label="Villes populaires"
        >
          <RouterLink
            v-for="item in cities.slice(0, 8)"
            :key="`${item.city}-${item.country}`"
            :to="`/cities/${encodeURIComponent(item.city)}`"
            class="touch-target whitespace-nowrap rounded-full border border-stone-200 px-4 py-3 text-sm text-stone-600 transition hover:border-dusty hover:text-dusty-dark"
          >
            {{ item.city }}
          </RouterLink>
        </nav>
      </div>
    </section>

    <section class="bg-stone-50 dark:bg-stone-950" aria-labelledby="profiles-title">
      <div class="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div v-if="listings.loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="item in 6"
            :key="item"
            class="aspect-[4/5] animate-pulse rounded-3xl bg-stone-200"
          ></div>
        </div>
        <p v-else-if="listings.error" class="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          {{ listings.error }}
        </p>
        <div v-else-if="listings.listings.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ListingCard v-for="listing in listings.listings" :key="listing.id" :listing="listing" />
        </div>
        <div
          v-else
          class="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center"
        >
          <h2 id="profiles-title" class="text-2xl font-light">Aucun profil disponible</h2>
          <p class="mt-3 text-stone-500">Choisissez une ville pour parcourir son annuaire.</p>
        </div>
      </div>
    </section>

    <section
      class="border-t border-stone-200 bg-white dark:border-stone-800"
      aria-labelledby="cities-title"
    >
      <div class="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <h2 id="cities-title" class="text-2xl font-light">Toutes les villes</h2>
        <p v-if="citiesError" class="mt-5 text-sm text-red-700">{{ citiesError }}</p>
        <div v-else-if="citiesLoading" class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="item in 8"
            :key="item"
            class="h-16 animate-pulse rounded-2xl bg-stone-100"
          ></div>
        </div>
        <div v-else class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <RouterLink
            v-for="item in cities"
            :key="`${item.city}-${item.country}`"
            :to="`/cities/${encodeURIComponent(item.city)}`"
            class="touch-target rounded-2xl border border-stone-200 bg-stone-50 p-4 transition hover:border-dusty hover:bg-white"
          >
            <span class="font-medium">{{ item.city }}</span>
            <span class="mt-1 block text-sm text-stone-500">{{ item.listings_count }} profils</span>
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
