<script setup lang="ts">
import type { Listing } from '../../src/stores/listings';
import { profilePath, translateProfileValue } from '../utils/public';

const props = defineProps<{ listing: Listing; index?: number; locale?: 'fr' | 'en' }>();
</script>

<template>
  <article class="e-card">
    <NuxtLink :to="profilePath(listing.id, locale)" class="e-card-link">
      <div class="e-card-media" :class="`e-tone-${(index ?? 0) % 4}`">
        <img
          v-if="listing.photos[0]?.url"
          :src="listing.photos[0].url"
          :alt="listing.photos[0].alt || listing.name"
          width="640"
          height="800"
          :loading="index && index > 1 ? 'lazy' : 'eager'"
          decoding="async"
          referrerpolicy="no-referrer"
        />
        <span v-else class="e-card-placeholder">Photo indisponible</span>
        <span v-if="listing.verified" class="e-card-badge">✓ Vérifié</span>
      </div>
      <div class="e-card-body">
        <div class="e-card-name">
          <strong
            >{{ listing.name }}<span v-if="listing.age">, {{ listing.age }}</span></strong
          ><span aria-hidden="true">↗</span>
        </div>
        <p>
          {{ listing.city || 'Profil public' }}
          <span v-if="listing.gender"> · {{ translateProfileValue(listing.gender, locale) }}</span>
        </p>
        <p v-if="listing.services.length || listing.styles?.length">
          {{
            [...(listing.services ?? []), ...(listing.styles ?? [])]
              .slice(0, 2)
              .map((value) => translateProfileValue(value, props.locale))
              .join(' · ')
          }}
        </p>
      </div>
    </NuxtLink>
  </article>
</template>
