<script setup lang="ts">
import type { Listing } from '../stores/listings';
defineProps<{ listing: Listing; index?: number }>();
</script>

<template>
  <article class="v2-listing-card">
    <RouterLink
      :to="`/${encodeURIComponent(listing.city)}/${encodeURIComponent(listing.slug)}`"
      class="v2-listing-link"
    >
      <div class="v2-listing-visual" :class="`alt${(index ?? 0) % 4}`">
        <img
          v-if="listing.photos[0]"
          :src="listing.photos[0].url"
          :alt="listing.photos[0].alt || listing.name"
          loading="lazy"
        />
        <div v-else class="v2-photo-placeholder">
          <span class="v2-photo-tag">Photo de démonstration</span>
          <svg width="70" height="70" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="8" cy="9" r="2" />
            <path d="m3 17 6-5 4 4 3-3 5 5" />
          </svg>
        </div>
        <span v-if="listing.verified" class="v2-badge">✓ Vérifié</span>
        <span v-if="listing.boosted" class="v2-badge premium">Premium</span>
      </div>
      <div class="v2-listing-body">
        <div class="v2-card-title">
          <strong>{{ listing.name }}, {{ listing.age }}</strong
          ><span>↗</span>
        </div>
        <small>{{ listing.city }} · {{ listing.services[0] || 'Profil' }}</small>
        <small v-if="listing.services.length">{{ listing.services.slice(1, 3).join(' · ') }}</small>
        <div class="v2-tags">
          <span v-for="tag in listing.services.slice(0, 3)" :key="tag">{{ tag }}</span>
        </div>
      </div>
    </RouterLink>
  </article>
</template>
