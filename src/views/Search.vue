<script setup lang="ts">
import { onMounted } from 'vue';
import { useListingsStore } from '../stores/listings';
import { setSeo } from '../lib/seo';
import ListingCard from '../components/ListingCard.vue';
const store = useListingsStore();
onMounted(() => {
  setSeo({
    title: 'Profils disponibles par ville | Élégance',
    description: 'Parcourez les profils disponibles et trouvez une ville sur Élégance.',
    canonical: `${window.location.origin}/search`,
  });
  store.search();
});
</script>
<template>
  <section class="mx-auto max-w-7xl px-6 py-14">
    <p class="eyebrow">Annuaire</p>
    <h1 class="mt-3 text-4xl font-light md:text-5xl">Profils disponibles</h1>
    <p class="mt-4 max-w-2xl text-stone-600">Parcourez les profils publiés par ville.</p>
    <div v-if="store.loading" class="mt-10 grid gap-6 md:grid-cols-3" aria-label="Loading listings">
      <div v-for="item in 3" :key="item" class="h-96 animate-pulse rounded-3xl bg-stone-200"></div>
    </div>
    <p v-else-if="store.error" class="mt-10 rounded-2xl bg-red-50 p-5 text-sm text-red-700">
      {{ store.error }}
    </p>
    <p
      v-else-if="!store.listings.length"
      class="mt-10 rounded-2xl border border-dashed border-stone-300 p-10 text-center text-stone-500"
    >
      Aucun profil publié n’est disponible pour le moment.
    </p>
    <div class="mt-10 grid gap-6 md:grid-cols-3">
      <ListingCard v-for="listing in store.listings" :key="listing.id" :listing="listing" />
    </div>
  </section>
</template>
