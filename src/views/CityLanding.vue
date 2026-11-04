<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useListingsStore } from '../stores/listings';
import { setSeo } from '../lib/seo';
import ListingCard from '../components/ListingCard.vue';

const route = useRoute();
const store = useListingsStore();
const city = ref(String(route.params.city));
onMounted(async () => {
  city.value = decodeURIComponent(city.value);
  setSeo({
    title: `Profils disponibles à ${city.value} | Élégance`,
    description: `Parcourez les profils disponibles à ${city.value} sur Élégance.`,
    canonical: `${window.location.origin}/cities/${encodeURIComponent(city.value)}`,
  });
  await store.search({ city: city.value });
});
</script>

<template>
  <main class="mx-auto max-w-7xl px-6 py-14">
    <p class="eyebrow">Annuaire local</p>
    <h1 class="mt-3 text-4xl font-light md:text-5xl">Profils disponibles à {{ city }}</h1>
    <p class="mt-5 max-w-2xl text-zinc-600">Découvrez les profils publiés à {{ city }}.</p>
    <div class="mt-10 grid gap-6 md:grid-cols-3">
      <ListingCard v-for="listing in store.listings" :key="listing.id" :listing="listing" />
    </div>
    <p v-if="!store.loading && !store.listings.length" class="mt-10 text-zinc-500">
      Aucun profil publié n’est disponible dans cette ville pour le moment.
    </p>
  </main>
</template>
