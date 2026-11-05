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
const loadingSearch = ref(false);
const searchResults = ref<City[]>([]);
const searched = ref(false);

const copy = computed(() =>
  locale.value === 'fr'
    ? {
        eyebrow: 'Annuaire vérifié',
        title: 'Trouvez un profil près de chez vous.',
        intro: 'Sélectionnez une ville ou recherchez directement une annonce.',
        search: 'Rechercher',
        city: 'Ville',
        gender: 'Profil',
        allCities: 'Toutes les villes',
        allProfiles: 'Tous les profils',
        women: 'Filles',
        men: 'Hommes',
        trans: 'Trans / TV',
        popular: 'Villes principales',
        nearby: 'Autres villes avec annonces',
        profiles: 'profils',
        listings: 'Annonces récentes',
        allListings: 'Voir tout',
        empty: 'Aucune annonce disponible pour le moment.',
        signupEyebrow: 'Pas encore inscrit ?',
        signupTitle: 'Accédez à vos favoris et contactez les profils.',
        signup: 'Créer un compte',
        advantages: [
          'Enregistrer vos favoris',
          'Contacter les profils',
          'Recevoir des alertes',
          'Gérer vos annonces',
        ],
      }
    : {
        eyebrow: 'Verified directory',
        title: 'Find a profile near you.',
        intro: 'Choose a city or search directly through the listings.',
        search: 'Search',
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
        listings: 'Recent listings',
        allListings: 'View all',
        empty: 'No listing is available right now.',
        signupEyebrow: 'Not registered yet?',
        signupTitle: 'Save favourites and contact profiles.',
        signup: 'Create an account',
        advantages: ['Save favourites', 'Contact profiles', 'Get alerts', 'Manage listings'],
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
async function searchCities() {
  const value = query.value.trim();
  if (!value) {
    searched.value = false;
    searchResults.value = [];
    return;
  }
  searched.value = true;
  loadingSearch.value = true;
  try {
    const response = await api.get('/locations', { params: { search: value, has_listings: 1 } });
    searchResults.value = normalizeLocations(response.data.data as ApiLocation[]).slice(0, 6);
  } finally {
    loadingSearch.value = false;
  }
}
function chooseCity(city: City) {
  selectedCity.value = city.city;
  query.value = '';
  searched.value = false;
  router.push(cityPath(city));
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
  <main class="v2-page">
    <section class="v2-hero">
      <div class="v2-wrap hero-grid">
        <div>
          <p class="v2-eyebrow">{{ copy.eyebrow }}</p>
          <h1>{{ copy.title }}</h1>
          <p class="v2-lead">{{ copy.intro }}</p>
        </div>
        <form class="v2-search-panel" @submit.prevent="submitSearch">
          <div class="v2-search-row">
            <label class="v2-field wide"
              ><span>{{ copy.city }}</span
              ><input
                v-model="query"
                :placeholder="copy.allCities"
                autocomplete="address-level2"
                @input="searchCities" /></label
            ><label class="v2-field"
              ><span>{{ copy.gender }}</span
              ><select v-model="selectedGender">
                <option value="">{{ copy.allProfiles }}</option>
                <option value="female">{{ copy.women }}</option>
                <option value="male">{{ copy.men }}</option>
                <option value="trans">{{ copy.trans }}</option>
              </select></label
            ><button class="v2-button primary" type="submit">{{ copy.search }}</button>
          </div>
          <div v-if="searched" class="v2-search-results">
            <span v-if="loadingSearch" class="v2-muted">Chargement…</span
            ><template v-else
              ><button
                v-for="city in searchResults"
                :key="city.city"
                type="button"
                @click="chooseCity(city)"
              >
                {{ city.city }} <small>{{ city.listings_count }} {{ copy.profiles }}</small></button
              ><span v-if="!searchResults.length" class="v2-muted"
                >Aucune ville trouvée.</span
              ></template
            >
          </div>
        </form>
      </div>
    </section>
    <section class="v2-wrap v2-directory" aria-labelledby="directory-title">
      <div class="v2-section-heading">
        <div>
          <p class="v2-eyebrow">Éclat</p>
          <h2 id="directory-title">{{ copy.popular }}</h2>
        </div>
        <span class="v2-muted">{{ cityOptions.length }} villes disponibles</span>
      </div>
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
    <section class="v2-banner">
      <div class="v2-wrap banner-content">
        <div>
          <p class="v2-eyebrow">{{ copy.signupEyebrow }}</p>
          <strong>{{ copy.signupTitle }}</strong
          ><RouterLink to="/register" class="v2-button primary">{{ copy.signup }}</RouterLink>
        </div>
        <ul>
          <li v-for="advantage in copy.advantages" :key="advantage"><b>✓</b>{{ advantage }}</li>
        </ul>
      </div>
    </section>
    <section class="v2-wrap v2-listings" aria-labelledby="listings-title">
      <div class="v2-section-heading">
        <div>
          <p class="v2-eyebrow">{{ copy.eyebrow }}</p>
          <h2 id="listings-title">{{ copy.listings }}</h2>
        </div>
        <RouterLink to="/search" class="v2-button ghost">{{ copy.allListings }}</RouterLink>
      </div>
      <div v-if="store.loading" class="v2-listing-grid">
        <span v-for="n in 4" :key="n" class="v2-listing-skeleton"></span>
      </div>
      <div v-else-if="visibleListings.length" class="v2-listing-grid">
        <ListingCard v-for="listing in visibleListings" :key="listing.id" :listing="listing" />
      </div>
      <p v-else class="v2-empty">{{ copy.empty }}</p>
    </section>
  </main>
</template>
