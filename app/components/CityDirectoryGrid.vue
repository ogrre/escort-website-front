<script setup lang="ts">
import type { City } from '../../src/lib/locations';
import { cityMatches } from '../composables/useLocations';
import { cityPath, cityRouteSlug } from '../utils/public';

const props = defineProps<{ cities: City[]; compact?: boolean }>();
const search = defineModel<string>('search', { default: '' });
const letter = defineModel<string>('letter', { default: '' });
const letters = computed(() =>
  [
    'Toutes',
    ...new Set(
      props.cities.map((city) =>
        city.name
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .charAt(0)
          .toUpperCase(),
      ),
    ),
  ].sort((a, b) => (a === 'Toutes' ? -1 : b === 'Toutes' ? 1 : a.localeCompare(b, 'fr'))),
);
const filteredCities = computed(() =>
  props.cities.filter((city) => cityMatches(city, search.value, letter.value)),
);
</script>

<template>
  <div class="e-directory">
    <div v-if="!compact" class="e-directory-tools">
      <label class="e-sr-only" for="city-directory-search">Rechercher une ville</label>
      <input
        id="city-directory-search"
        v-model="search"
        type="search"
        placeholder="Rechercher une ville"
      />
      <div class="e-letter-filter" aria-label="Filtrer par première lettre">
        <button
          v-for="item in letters"
          :key="item"
          type="button"
          :class="{ active: letter === (item === 'Toutes' ? '' : item) }"
          @click="letter = item === 'Toutes' ? '' : item"
        >
          {{ item }}
        </button>
      </div>
    </div>
    <div class="e-city-list" :class="{ compact }">
      <NuxtLink
        v-for="city in filteredCities"
        :key="city.slug"
        :to="cityPath(cityRouteSlug(city.name))"
        class="e-city-row"
      >
        <span
          ><strong>{{ city.name }}</strong
          ><small>{{ city.region?.name || 'France' }}</small></span
        >
        <span class="e-city-count"
          >{{ city.listings_count > 0 ? `${city.listings_count} profils` : 'Explorer' }}
          <b aria-hidden="true">↗</b></span
        >
      </NuxtLink>
    </div>
    <p v-if="!filteredCities.length" class="e-empty">
      Aucune ville ne correspond à votre recherche.
    </p>
  </div>
</template>
