<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ListingCard from '../components/ListingCard.vue';
import { api } from '../lib/api';
import { cachedRequest } from '../lib/request-cache';
import { normalizeLocations, type ApiLocation, type City } from '../lib/locations';
import { localeKey, type Locale } from '../lib/locale';
import { setSeo } from '../lib/seo';
import { useListingsStore } from '../stores/listings';

const router = useRouter();
const store = useListingsStore();
const locale = inject(localeKey, ref<Locale>('fr'));
const query = ref('');
const selectedCity = ref('');
const selectedGender = ref('');
const majorCities = ref<City[]>([]);
const otherCities = ref<City[]>([]);
const loadingCities = ref(true);

const copy = computed(() =>
  locale.value === 'fr'
    ? {
        eyebrow: 'Annuaire France · 18+',
        title: 'Explorez les profils par ville.',
        intro: '',
        search: 'Rechercher',
        query: 'Pseudo ou mot-clé',
        city: 'Ville',
        gender: 'Profil',
        allCities: 'Toutes les villes',
        allProfiles: 'Tous les profils',
        women: 'Filles',
        men: 'Hommes',
        trans: 'Trans / TV',
        popular: 'Les principales villes',
        nearby: 'Autres villes avec annonces',
        profiles: 'profils',
        listings: 'Profils à découvrir',
        allListings: 'Voir toutes les annonces',
        empty: 'Aucune annonce disponible pour le moment.',
      }
    : {
        eyebrow: 'Directory France · 18+',
        title: 'Explore profiles by city.',
        intro: '',
        search: 'Search',
        query: 'Username or keyword',
        city: 'City',
        gender: 'Profile',
        allCities: 'All cities',
        allProfiles: 'All profiles',
        women: 'Women',
        men: 'Men',
        trans: 'Trans / TV',
        popular: 'Major cities',
        nearby: 'Other cities with listings',
        profiles: 'profiles',
        listings: 'Profiles to discover',
        allListings: 'View all listings',
        empty: 'No listing is available right now.',
      },
);
const visibleListings = computed(() => store.listings.slice(0, 8));
const cityOptions = computed(() => [...majorCities.value, ...otherCities.value]);
function cityPath(city: City) {
  return `/cities/${encodeURIComponent(city.city)}`;
}
function submitSearch() {
  const params = new window.URLSearchParams();
  if (query.value.trim()) params.set('q', query.value.trim());
  if (selectedCity.value) params.set('city', selectedCity.value);
  if (selectedGender.value) params.set('gender', selectedGender.value);
  router.push(`/search${params.toString() ? `?${params.toString()}` : ''}`);
}
onMounted(async () => {
  setSeo({
    title: 'Éclat — Profils vérifiés près de chez vous',
    description: 'Trouvez rapidement des profils et annonces disponibles dans votre ville.',
    canonical: `${window.location.origin}/`,
  });
  try {
    const [major, listed] = await Promise.all([
      cachedRequest(
        'v2:locations:major',
        async () =>
          (await api.get('/locations', { params: { is_major: 1, has_listings: 1 } })).data.data,
        300_000,
      ),
      cachedRequest(
        'v2:locations:listings',
        async () => (await api.get('/locations', { params: { has_listings: 1 } })).data.data,
        300_000,
      ),
      store.search({ sort: 'boosted' }),
    ]);
    majorCities.value = normalizeLocations(major as ApiLocation[]);
    const majorNames = new Set(
      majorCities.value.map((city) =>
        city.city
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase(),
      ),
    );
    otherCities.value = normalizeLocations(listed as ApiLocation[]).filter(
      (city) =>
        !majorNames.has(
          city.city
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .toLowerCase(),
        ),
    );
  } finally {
    loadingCities.value = false;
  }
});
</script>

<template>
  <main class="v2-page v4-home">
    <section class="v2-wrap v4-home-intro">
      <p class="v2-eyebrow">{{ copy.eyebrow }}</p>
      <h1>{{ copy.title }}</h1>
      <h2>{{ copy.popular }}</h2>
      <div v-if="loadingCities" class="v2-city-grid">
        <span v-for="n in 8" :key="n" class="v2-skeleton"></span>
      </div>
      <div v-else class="v2-city-grid">
        <RouterLink
          v-for="city in majorCities"
          :key="city.city"
          :to="cityPath(city)"
          class="v2-city-card"
          ><strong>{{ city.city }}</strong
          ><small>{{ city.listings_count }} {{ copy.profiles }}</small></RouterLink
        >
      </div>
      <div v-if="otherCities.length" class="v2-other-cities">
        <h3>{{ copy.nearby }}</h3>
        <div class="v2-city-inline">
          <RouterLink v-for="city in otherCities" :key="city.city" :to="cityPath(city)"
            >{{ city.city }} <small>{{ city.listings_count }}</small></RouterLink
          >
        </div>
      </div>
    </section>
    <section class="v2-search-panel v4-quick-search" aria-labelledby="quick-search-title">
      <h3 id="quick-search-title">Recherche rapide</h3>
      <form class="v2-search-row" @submit.prevent="submitSearch">
        <input v-model="query" :placeholder="copy.query" autocomplete="off" />
        <select v-model="selectedCity">
          <option value="">{{ copy.allCities }}</option>
          <option v-for="city in cityOptions" :key="city.city" :value="city.city">
            {{ city.city }}
          </option>
        </select>
        <select v-model="selectedGender">
          <option value="">{{ copy.allProfiles }}</option>
          <option value="female">{{ copy.women }}</option>
          <option value="male">{{ copy.men }}</option>
          <option value="trans">TV / TS</option>
          <option value="couple">Couple</option>
        </select>
        <button class="v2-button primary" type="submit">{{ copy.search }}</button>
      </form>
      <div class="v2-filter-chips">
        <RouterLink to="/search?verified=1" class="v2-chip">✓ Vérifiés</RouterLink>
        <RouterLink to="/search?video=1" class="v2-chip">▶ Avec vidéo</RouterLink>
        <RouterLink to="/search" class="v2-chip">Tous les filtres →</RouterLink>
      </div>
    </section>
    <section class="v2-wrap v2-listings" aria-labelledby="listings-title">
      <div class="v2-section-heading">
        <div>
          <p class="v2-eyebrow">{{ copy.eyebrow }}</p>
          <h2 id="listings-title">{{ copy.listings }}</h2>
        </div>
        <RouterLink to="/search" class="v2-button">{{ copy.allListings }}</RouterLink>
      </div>
      <div v-if="store.loading" class="v2-listing-grid">
        <span v-for="n in 4" :key="n" class="v2-listing-skeleton"></span>
      </div>
      <div v-else-if="visibleListings.length" class="v2-listing-grid">
        <ListingCard
          v-for="(listing, index) in visibleListings"
          :key="listing.id"
          :listing="listing"
          :index="index"
        />
      </div>
      <p v-else class="v2-empty">{{ copy.empty }}</p>
    </section>
  </main>
</template>
