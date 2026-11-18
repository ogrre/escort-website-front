<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { api } from '../lib/api';
import { normalizeLocations, type ApiLocation, type City } from '../lib/locations';
import { setSeo } from '../lib/seo';

const props = defineProps<{ locale: 'fr' | 'en' }>();
const cities = ref<City[]>([]);
const loading = ref(true);
const english = computed(() => props.locale === 'en');

onMounted(async () => {
  setSeo({
    title: english.value ? 'Cities | Élégance' : 'Villes | Élégance',
    description: english.value ? 'Browse profiles by city.' : 'Parcourez les profils par ville.',
    canonical: `${window.location.origin}/${english.value ? 'en/cities' : 'fr/villes'}`,
  });
  try {
    cities.value = normalizeLocations(
      (await api.get('/locations', { params: { has_listings: 1 } })).data.data as ApiLocation[],
    );
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="v2-page v2-wrap v4-home">
    <p class="v2-eyebrow">{{ english ? 'Directory · 18+' : 'Annuaire · 18+' }}</p>
    <h1>{{ english ? 'Cities' : 'Villes' }}</h1>
    <div v-if="loading" class="v2-city-grid">
      <span v-for="n in 8" :key="n" class="v2-skeleton"></span>
    </div>
    <div v-else class="v2-city-grid">
      <RouterLink
        v-for="city in cities"
        :key="city.slug"
        :to="`/${english ? 'en/cities' : 'fr/villes'}/${encodeURIComponent(city.slug)}`"
        class="v2-city-card"
      >
        <strong>{{ city.name }}</strong
        ><small>{{ city.listings_count }} {{ english ? 'profiles' : 'profils' }}</small>
      </RouterLink>
    </div>
  </main>
</template>
