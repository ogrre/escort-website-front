<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useListingsStore } from '../stores/listings';
import { setSeo } from '../lib/seo';

const route = useRoute();
const store = useListingsStore();
const city = ref(String(route.params.city));
onMounted(async () => {
  city.value = decodeURIComponent(city.value);
  setSeo({
    title: `Escort profiles in ${city.value} | Élégance`,
    description: `Discover discreet, curated profiles in ${city.value}.`,
    canonical: `${window.location.origin}/cities/${encodeURIComponent(city.value)}`,
  });
  await store.search({ city: city.value });
});
</script>

<template>
  <main class="mx-auto max-w-7xl px-6 py-14">
    <p class="text-sm uppercase tracking-[.25em] text-dusty-dark">City directory</p>
    <h1 class="mt-3 text-5xl font-light">Escort profiles in {{ city }}</h1>
    <p class="mt-5 max-w-2xl text-zinc-600">
      Discover available profiles in {{ city }}, with discreet contact details and carefully
      presented listings.
    </p>
    <div class="mt-10 grid gap-6 md:grid-cols-3">
      <article
        v-for="item in store.listings"
        :key="item.id"
        class="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
      >
        <div class="aspect-[4/5] bg-zinc-200">
          <img
            v-if="item.photos[0]"
            :src="item.photos[0].url"
            :alt="item.photos[0].alt || item.name"
            class="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div class="p-5">
          <RouterLink :to="`/${item.city}/${item.slug}`" class="text-xl"
            >{{ item.name }}, {{ item.age }}</RouterLink
          >
          <p class="mt-1 text-zinc-500">{{ item.city }} · {{ item.country }}</p>
        </div>
      </article>
    </div>
    <p v-if="!store.loading && !store.listings.length" class="mt-10 text-zinc-500">
      No published listings are available in this city yet.
    </p>
  </main>
</template>
