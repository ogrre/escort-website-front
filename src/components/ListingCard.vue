<script setup lang="ts">
import type { Listing } from '../stores/listings';
defineProps<{ listing: Listing }>();
</script>

<template>
  <article class="v2-listing-card">
    <RouterLink :to="`/${encodeURIComponent(listing.city)}/${listing.id}`" class="v2-listing-link">
      <div class="v2-listing-visual">
        <img
          v-if="listing.photos[0]"
          :src="listing.photos[0].url"
          :alt="listing.photos[0].alt || listing.name"
          loading="lazy"
        />
        <div v-else class="v2-photo-placeholder"><span>ÉCLAT</span></div>
        <span v-if="listing.verified" class="v2-badge">✓ Vérifié</span>
        <span v-if="listing.boosted" class="v2-badge premium">Premium</span>
      </div>
      <div class="v2-listing-body">
        <div class="v2-card-title">
          <strong>{{ listing.name }}, {{ listing.age }}</strong
          ><span>↗</span>
        </div>
        <small>{{ listing.city }} · {{ listing.country }}</small>
        <p v-if="listing.status_text">{{ listing.status_text }}</p>
        <div class="v2-tags">
          <span v-for="tag in listing.services.slice(0, 3)" :key="tag">{{ tag }}</span>
        </div>
      </div>
    </RouterLink>
  </article>
</template>
