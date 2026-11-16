<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import ListingCard from '../components/ListingCard.vue';
import { api } from '../lib/api';
import { cachedRequest } from '../lib/request-cache';
import { normalizeLocations, type ApiLocation, type City } from '../lib/locations';
import { localeKey, type Locale } from '../lib/locale';
import { setSeo } from '../lib/seo';
import { useListingsStore } from '../stores/listings';

const router = useRouter();
const route = useRoute();
const store = useListingsStore();
const locale = inject(localeKey, ref<Locale>('fr'));
const query = ref('');
const selectedCity = ref('');
const selectedGender = ref('');
const selectedVerified = ref(false);
const selectedVideo = ref(false);
const selectedAgeMin = ref('');
const selectedAgeMax = ref('');
const selectedSort = ref('recommended');
const selectedRadius = ref('25');
const currentPage = ref(1);
const aroundMe = ref(false);
const coordinates = ref<{ lat: number; lng: number } | null>(null);
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
        age: 'Âge',
        minAge: 'Âge min.',
        maxAge: 'Âge max.',
        sort: 'Trier par',
        recommended: 'Recommandés',
        newest: 'Plus récents',
        mostViewed: 'Plus vus',
        lastOnline: 'Dernière activité',
        around: 'Autour de moi',
        radius: 'Rayon',
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
        age: 'Age',
        minAge: 'Min age',
        maxAge: 'Max age',
        sort: 'Sort by',
        recommended: 'Recommended',
        newest: 'Newest',
        mostViewed: 'Most viewed',
        lastOnline: 'Last online',
        around: 'Around me',
        radius: 'Radius',
        popular: 'Major cities',
        nearby: 'Other cities with listings',
        profiles: 'profiles',
        listings: 'Profiles to discover',
        allListings: 'View all listings',
        empty: 'No listing is available right now.',
      },
);
const visibleListings = computed(() =>
  store.listings
    .filter(
      (listing) =>
        !selectedGender.value ||
        listing.gender === selectedGender.value ||
        (listing.tags ?? []).includes(selectedGender.value),
    )
    .filter((listing) => !selectedVerified.value || listing.verified)
    .filter(
      (listing) =>
        !selectedVideo.value ||
        listing.has_video === true ||
        (listing.tags ?? []).includes('video'),
    ),
);
const cityOptions = computed(() => [...majorCities.value, ...otherCities.value]);
function selectCity(city: City) {
  selectedCity.value = city.slug ?? city.city;
  aroundMe.value = false;
  coordinates.value = null;
  submitSearch();
}
function submitSearch() {
  const params = new window.URLSearchParams();
  if (query.value.trim()) params.set('q', query.value.trim());
  if (selectedCity.value) params.set('city', selectedCity.value);
  if (selectedGender.value) params.set('gender', selectedGender.value);
  if (selectedVerified.value) params.set('verified', '1');
  if (selectedVideo.value) params.set('video', '1');
  if (selectedAgeMin.value) params.set('age_min', selectedAgeMin.value);
  if (selectedAgeMax.value) params.set('age_max', selectedAgeMax.value);
  if (selectedSort.value) params.set('sort', selectedSort.value);
  if (currentPage.value > 1) params.set('page', String(currentPage.value));
  if (aroundMe.value && coordinates.value) {
    params.set('around_me', '1');
    params.set('lat', String(coordinates.value.lat));
    params.set('lng', String(coordinates.value.lng));
    params.set('radius', selectedRadius.value);
  }
  router.push(`/${params.toString() ? `?${params.toString()}` : ''}`);
}
function syncFilters() {
  query.value = String(route.query.q ?? '');
  selectedCity.value = String(route.query.city ?? '');
  selectedGender.value = String(route.query.gender ?? '');
  selectedVerified.value = route.query.verified === '1';
  selectedVideo.value = route.query.video === '1';
  selectedAgeMin.value = String(route.query.age_min ?? '');
  selectedAgeMax.value = String(route.query.age_max ?? '');
  selectedSort.value = String(route.query.sort ?? 'recommended');
  selectedRadius.value = String(route.query.radius ?? '25');
  currentPage.value = Math.max(Number(route.query.page ?? 1) || 1, 1);
  aroundMe.value = route.query.around_me === '1';
}
function normalizeCityFilter() {
  if (!selectedCity.value) return;
  const normalized = selectedCity.value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
  const city = cityOptions.value.find(
    (option) =>
      option.slug === selectedCity.value ||
      option.city
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase() === normalized,
  );
  if (city?.slug) selectedCity.value = city.slug;
}
async function loadListings() {
  const params: Record<string, string> = {
    sort: selectedSort.value,
    page: String(currentPage.value),
  };
  if (selectedCity.value) params.city = selectedCity.value;
  if (query.value) params.q = query.value;
  if (selectedGender.value) params.gender = selectedGender.value;
  if (selectedVerified.value) params.verified = '1';
  if (selectedVideo.value) params.has_video = '1';
  if (selectedAgeMin.value) params.age_min = selectedAgeMin.value;
  if (selectedAgeMax.value) params.age_max = selectedAgeMax.value;
  if (aroundMe.value && coordinates.value) {
    params.around_me = '1';
    params.lat = String(coordinates.value.lat);
    params.lng = String(coordinates.value.lng);
    params.radius = selectedRadius.value;
  }
  await store.search(params);
  if (!store.listings.length && selectedCity.value) {
    const city = cityOptions.value.find((option) => option.slug === selectedCity.value);
    if (city && city.city !== selectedCity.value) {
      await store.search({ ...params, city: city.city });
    }
  }
}
function requestBrowserLocation(force = false) {
  const geolocation = globalThis.navigator?.geolocation;
  if (!geolocation || (!force && (route.query.city || route.query.around_me))) return;

  geolocation.getCurrentPosition(
    (position) => {
      coordinates.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      aroundMe.value = true;
      selectedCity.value = '';
      currentPage.value = 1;
      void loadListings();
    },
    () => {
      // Paris remains the predictable default when location access is refused.
    },
    { enableHighAccuracy: false, timeout: 5000, maximumAge: 300_000 },
  );
}
function goToPage(page: number) {
  if (page < 1 || page > store.pagination.pages || page === currentPage.value) return;
  currentPage.value = page;
  submitSearch();
}
watch(
  () => route.fullPath,
  async () => {
    syncFilters();
    await loadListings();
  },
);
onMounted(async () => {
  syncFilters();
  if (!route.query.city && !route.query.around_me) selectedCity.value = 'Paris';
  setSeo({
    title: 'Élégance — Profils vérifiés près de chez vous',
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
    normalizeCityFilter();
    await loadListings();
    requestBrowserLocation();
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
        <button
          v-for="city in majorCities"
          :key="city.city"
          type="button"
          class="v2-city-card"
          :class="{ active: selectedCity === (city.slug ?? city.city) && !aroundMe }"
          @click="selectCity(city)"
        >
          <strong>{{ city.city }}</strong>
          <small>{{ city.listings_count }} {{ copy.profiles }}</small>
        </button>
      </div>
      <div v-if="otherCities.length" class="v2-other-cities">
        <h3>{{ copy.nearby }}</h3>
        <div class="v2-city-inline">
          <button
            v-for="city in otherCities"
            :key="city.city"
            type="button"
            :class="{ active: selectedCity === (city.slug ?? city.city) && !aroundMe }"
            @click="selectCity(city)"
          >
            {{ city.city }} <small>{{ city.listings_count }}</small>
          </button>
        </div>
      </div>
    </section>
    <section class="v2-search-panel v4-quick-search" aria-labelledby="quick-search-title">
      <div class="v2-filter-heading">
        <h3 id="quick-search-title">{{ copy.search }}</h3>
        <button type="button" class="v2-chip" @click="requestBrowserLocation(true)">
          ◎ {{ copy.around }}
        </button>
      </div>
      <form class="v2-search-row" @submit.prevent="submitSearch">
        <input v-model="query" :placeholder="copy.query" autocomplete="off" />
        <select v-model="selectedCity">
          <option value="">{{ copy.allCities }}</option>
          <option
            v-for="city in cityOptions"
            :key="city.slug ?? city.city"
            :value="city.slug ?? city.city"
          >
            {{ city.city }}
          </option>
        </select>
        <select v-model="selectedGender">
          <option value="">{{ copy.allProfiles }}</option>
          <option value="femme">{{ copy.women }}</option>
          <option value="homme">{{ copy.men }}</option>
          <option value="tvts">TV / TS</option>
          <option value="couple">Couple</option>
        </select>
        <button class="v2-button primary" type="submit">{{ copy.search }}</button>
      </form>
      <div class="v2-filter-row">
        <label>
          <span>{{ copy.minAge }}</span>
          <input v-model="selectedAgeMin" type="number" min="18" max="80" placeholder="18" />
        </label>
        <label>
          <span>{{ copy.maxAge }}</span>
          <input v-model="selectedAgeMax" type="number" min="18" max="80" placeholder="80" />
        </label>
        <label>
          <span>{{ copy.sort }}</span>
          <select v-model="selectedSort">
            <option value="recommended">{{ copy.recommended }}</option>
            <option value="newest">{{ copy.newest }}</option>
            <option value="most_viewed">{{ copy.mostViewed }}</option>
            <option value="last_online">{{ copy.lastOnline }}</option>
          </select>
        </label>
        <label>
          <span>{{ copy.radius }}</span>
          <select v-model="selectedRadius">
            <option value="25">25 km</option>
            <option value="50">50 km</option>
            <option value="100">100 km</option>
          </select>
        </label>
      </div>
      <div class="v2-filter-chips">
        <button
          type="button"
          class="v2-chip"
          :class="{ active: selectedVerified }"
          @click="selectedVerified = !selectedVerified"
        >
          ✓ Vérifiés
        </button>
        <button
          type="button"
          class="v2-chip"
          :class="{ active: selectedVideo }"
          @click="selectedVideo = !selectedVideo"
        >
          ▶ Avec vidéo
        </button>
        <button type="submit" class="v2-chip">{{ copy.allListings }}</button>
      </div>
    </section>
    <section class="v2-wrap v2-listings" aria-labelledby="listings-title">
      <div class="v2-section-heading">
        <div>
          <p class="v2-eyebrow">{{ copy.eyebrow }}</p>
          <h2 id="listings-title">{{ copy.listings }}</h2>
        </div>
        <button type="button" class="v2-button" @click="submitSearch">
          {{ copy.allListings }}
        </button>
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
      <p v-if="store.error" class="v2-empty">{{ store.error }}</p>
      <nav v-if="store.pagination.pages > 1" class="v2-pagination" aria-label="Pagination">
        <button
          type="button"
          class="v2-chip"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          ←
        </button>
        <span>{{ currentPage }} / {{ store.pagination.pages }}</span>
        <button
          type="button"
          class="v2-chip"
          :disabled="currentPage === store.pagination.pages"
          @click="goToPage(currentPage + 1)"
        >
          →
        </button>
      </nav>
    </section>
  </main>
</template>
