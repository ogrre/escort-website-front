<script setup lang="ts">
import { onMounted } from 'vue';
import { useListingsStore } from '../stores/listings';
import { setSeo } from '../lib/seo';
const store = useListingsStore();
onMounted(() => {
  setSeo({
    title: 'Explore profiles | Élégance',
    description: 'Explore curated profiles by city on Élégance.',
  });
  store.search();
});
</script>
<template>
  <section class="mx-auto max-w-7xl px-6 py-14">
    <p class="eyebrow">The directory</p>
    <h1 class="mt-3 text-4xl font-light md:text-5xl">Explore profiles</h1>
    <p class="mt-4 max-w-2xl text-stone-600">
      Browse published profiles and discover your next city.
    </p>
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
      No published profiles are available yet.
    </p>
    <div class="mt-10 grid gap-6 md:grid-cols-3">
      <template v-for="item in store.listings" :key="item.id">
        <article class="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
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
            <p v-if="item.status_text" class="mt-3 text-sm font-medium text-dusty-dark">
              {{ item.status_text }}
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="tag in item.services"
                :key="tag"
                class="rounded-full bg-dusty/10 px-3 py-1 text-xs text-dusty-dark"
                >{{ tag }}</span
              >
            </div>
          </div>
        </article>
      </template>
    </div>
  </section>
</template>
