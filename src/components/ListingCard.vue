<script setup lang="ts">
import type { Listing } from '../stores/listings';

defineProps<{ listing: Listing }>();
</script>

<template>
  <article class="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
    <RouterLink :to="`/${encodeURIComponent(listing.city)}/${listing.id}`" class="block">
      <div class="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <img
          v-if="listing.photos[0]"
          :src="listing.photos[0].url"
          :alt="listing.photos[0].alt || `${listing.name}, ${listing.age} ans à ${listing.city}`"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span
          v-if="listing.verified"
          class="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-stone-800"
        >
          Vérifié
        </span>
      </div>
      <div class="p-5">
        <h2 class="text-xl font-medium text-stone-900">{{ listing.name }}, {{ listing.age }}</h2>
        <p class="mt-1 text-sm text-stone-500">{{ listing.city }} · {{ listing.country }}</p>
        <p v-if="listing.status_text" class="mt-3 text-sm font-medium text-dusty-dark">
          {{ listing.status_text }}
        </p>
        <div v-if="listing.services.length" class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="tag in listing.services.slice(0, 3)"
            :key="tag"
            class="rounded-full bg-dusty/10 px-3 py-1 text-xs text-dusty-dark"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </RouterLink>
  </article>
</template>
