<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ListingCard from '../components/ListingCard.vue';
import { api } from '../lib/api';
import { cityPath } from '../lib/city-links';
import { citySeoMetadata } from '../lib/city-seo';
import { normalizeLocations, type ApiLocation, type City } from '../lib/locations';
import { setSeo } from '../lib/seo';
import {
  GENDERS,
  isFilteredProfileUrl,
  profileApiParams,
  profileRouteQuery,
  readProfileFilters,
  type SearchFilters,
} from '../lib/profile-search';
import { useListingsStore } from '../stores/listings';

const props = defineProps<{ locale: 'fr' | 'en' }>();
const route = useRoute();
const router = useRouter();
const store = useListingsStore();
const city = ref<City | null>(null);
const majorCities = ref<City[]>([]);
const otherCities = ref<City[]>([]);
const loading = ref(true);
const loadingCities = ref(true);
const error = ref('');
const advancedOpen = ref(false);
const filters = ref<SearchFilters>({});
const english = computed(() => props.locale === 'en');
const citySlug = computed(() => (route.params.citySlug ? String(route.params.citySlug) : ''));
const selectedCity = computed(() => city.value?.slug ?? '');
const cityOptions = computed(() => [...majorCities.value, ...otherCities.value]);
const copy = computed(() =>
  english.value
    ? {
        eyebrow: city.value ? 'Local directory · 18+' : 'Directory France · 18+',
        title: city.value ? `Profiles in ${city.value.name}` : 'Explore profiles by city.',
        search: 'Apply filters',
        query: 'Username or keyword',
        city: 'City',
        allCities: 'All cities',
        gender: 'Gender',
        allGenders: 'All profiles',
        women: 'Women',
        men: 'Men',
        trans: 'TV / TS',
        couple: 'Couple',
        advanced: 'Advanced filters',
        reset: 'Reset filters',
        verified: 'Verified profiles',
        video: 'Profiles with video',
        phone: 'Phone available',
        around: 'Around me',
        radius: 'Radius (km)',
        ageMin: 'Minimum age',
        ageMax: 'Maximum age',
        nationality: 'Nationality',
        ethnicity: 'Ethnicity',
        language: 'Language',
        sort: 'Sort by',
        recommended: 'Recommended',
        newest: 'Newest',
        mostViewed: 'Most viewed',
        lastUpdate: 'Last update',
        lastOnline: 'Last online',
        boosted: 'Boosted',
        listings: 'Profiles to discover',
        empty: 'No published profile is available right now.',
        previous: 'Previous',
        next: 'Next',
        count: 'published profiles',
      }
    : {
        eyebrow: city.value ? 'Annuaire local · 18+' : 'Annuaire France · 18+',
        title: city.value ? `Profils à ${city.value.name}` : 'Explorez les profils par ville.',
        search: 'Appliquer les filtres',
        query: 'Pseudo ou mot-clé',
        city: 'Ville',
        allCities: 'Toutes les villes',
        gender: 'Genre',
        allGenders: 'Tous les profils',
        women: 'Femme',
        men: 'Homme',
        trans: 'TV / TS',
        couple: 'Couple',
        advanced: 'Filtres avancés',
        reset: 'Réinitialiser les filtres',
        verified: 'Profils vérifiés',
        video: 'Profils avec vidéo',
        phone: 'Téléphone disponible',
        around: 'Autour de moi',
        radius: 'Rayon (km)',
        ageMin: 'Âge minimum',
        ageMax: 'Âge maximum',
        nationality: 'Nationalité',
        ethnicity: 'Ethnie',
        language: 'Langue',
        sort: 'Trier par',
        recommended: 'Recommandés',
        newest: 'Nouveautés',
        mostViewed: 'Les plus vus',
        lastUpdate: 'Dernière mise à jour',
        lastOnline: 'Dernière connexion',
        boosted: 'Mis en avant',
        listings: 'Profils à découvrir',
        empty: 'Aucun profil publié disponible pour le moment.',
        previous: 'Précédent',
        next: 'Suivant',
        count: 'annonces disponibles',
      },
);

function readRouteFilters() {
  const next = readProfileFilters(route.query as Record<string, unknown>);
  if (citySlug.value) delete next.city;
  return next;
}
function routeQuery(next: SearchFilters) {
  const query = profileRouteQuery(next);
  delete query.city;
  return query;
}
async function loadCities() {
  try {
    const [major, listed] = await Promise.all([
      api.get('/locations', { params: { is_major: 1, has_listings: 1 } }),
      api.get('/locations', { params: { has_listings: 1 } }),
    ]);
    majorCities.value = normalizeLocations(major.data.data as ApiLocation[]);
    const majorSlugs = new Set(majorCities.value.map((item) => item.slug));
    otherCities.value = normalizeLocations(listed.data.data as ApiLocation[]).filter(
      (item) => !majorSlugs.has(item.slug),
    );
  } finally {
    loadingCities.value = false;
  }
}
async function loadDirectory() {
  loading.value = true;
  error.value = '';
  filters.value = readRouteFilters();
  try {
    city.value = citySlug.value
      ? ((await api.get(`/locations/${encodeURIComponent(citySlug.value)}`)).data.data as City)
      : null;
    await store.search(profileApiParams(filters.value, citySlug.value || undefined));
    if (city.value)
      setSeo({
        ...citySeoMetadata(props.locale, city.value, filters.value),
        robots: isFilteredProfileUrl(filters.value) ? 'noindex,follow' : 'index,follow',
      });
    else
      setSeo({
        title: english.value ? 'Profiles by city | Élégance' : 'Profils par ville | Élégance',
        description: english.value
          ? 'Explore published profiles by city.'
          : 'Explorez les profils publiés par ville.',
        canonical: `${window.location.origin}/`,
      });
  } catch {
    city.value = null;
    error.value = citySlug.value
      ? english.value
        ? 'This city could not be found.'
        : 'Cette ville est introuvable.'
      : english.value
        ? 'Listings could not be loaded.'
        : 'Les annonces ne peuvent pas être chargées.';
  } finally {
    loading.value = false;
  }
}
function applyFilters() {
  delete filters.value.page;
  void router.replace({ query: routeQuery(filters.value) });
}
function resetFilters() {
  filters.value = {};
  void router.replace({ query: {} });
}
function selectCity(slug: string) {
  void router.push(slug ? cityPath(props.locale, slug) : '/');
}
function useMyLocation() {
  if (!globalThis.navigator.geolocation) return;
  globalThis.navigator.geolocation.getCurrentPosition((position) => {
    filters.value.around_me = '1';
    filters.value.lat = String(position.coords.latitude);
    filters.value.lng = String(position.coords.longitude);
    applyFilters();
  });
}
function goToPage(url: string | null) {
  if (!url) return;
  const next = new globalThis.URL(url, window.location.origin);
  const nextFilters = readProfileFilters(next.searchParams);
  if (citySlug.value) delete nextFilters.city;
  void router.push({ query: routeQuery(nextFilters) });
}
watch(() => route.fullPath, loadDirectory);
onMounted(() => {
  void Promise.all([loadCities(), loadDirectory()]);
});
</script>

<template>
  <main class="v2-page v4-home">
    <section class="v2-wrap v4-home-intro">
      <p class="v2-eyebrow">{{ copy.eyebrow }}</p>
      <h1>{{ copy.title }}</h1>
      <p v-if="city" class="city-count">{{ city.listings_count }} {{ copy.count }}</p>
      <h2 v-if="!city">{{ english ? 'Major cities' : 'Les principales villes' }}</h2>
      <div v-if="!city && loadingCities" class="v2-city-grid">
        <span v-for="n in 8" :key="n" class="v2-skeleton"></span>
      </div>
      <div v-else-if="!city" class="v2-city-grid">
        <RouterLink
          v-for="item in majorCities"
          :key="item.slug"
          :to="cityPath(props.locale, item.slug)"
          class="v2-city-card"
          ><strong>{{ item.name }}</strong
          ><small>{{ item.listings_count }}</small></RouterLink
        >
      </div>
      <div v-if="!city && otherCities.length" class="v2-other-cities">
        <h3>{{ english ? 'Other cities with listings' : 'Autres villes avec annonces' }}</h3>
        <div class="v2-city-inline">
          <RouterLink
            v-for="item in otherCities"
            :key="item.slug"
            :to="cityPath(props.locale, item.slug)"
            >{{ item.name }} <small>{{ item.listings_count }}</small></RouterLink
          >
        </div>
      </div>
    </section>
    <section class="v2-wrap v2-search-panel directory-filter-panel" aria-labelledby="filters-title">
      <div class="v2-section-heading">
        <h2 id="filters-title">{{ english ? 'Search' : 'Recherche' }}</h2>
        <button class="v2-button ghost" type="button" @click="resetFilters">
          {{ copy.reset }}
        </button>
      </div>
      <form class="directory-filter-grid" @submit.prevent="applyFilters">
        <label class="v2-field"
          ><span>{{ copy.query }}</span
          ><input v-model="filters.q" type="search" autocomplete="off"
        /></label>
        <label class="v2-field"
          ><span>{{ copy.city }}</span
          ><select
            :value="selectedCity"
            @change="selectCity(($event.target as HTMLSelectElement).value)"
          >
            <option value="">{{ copy.allCities }}</option>
            <option v-for="item in cityOptions" :key="item.slug" :value="item.slug">
              {{ item.name }}
            </option>
          </select></label
        >
        <label class="v2-field"
          ><span>{{ copy.gender }}</span
          ><select v-model="filters.gender">
            <option value="">{{ copy.allGenders }}</option>
            <option v-for="gender in GENDERS" :key="gender" :value="gender">
              {{
                gender === 'femme'
                  ? copy.women
                  : gender === 'homme'
                    ? copy.men
                    : gender === 'tvts'
                      ? copy.trans
                      : copy.couple
              }}
            </option>
          </select></label
        >
        <button class="v2-button primary directory-apply" type="submit">{{ copy.search }}</button>
      </form>
      <button
        class="v2-button directory-advanced-toggle"
        type="button"
        :aria-expanded="advancedOpen"
        @click="advancedOpen = !advancedOpen"
      >
        {{ copy.advanced }}
      </button>
      <div v-if="advancedOpen" class="directory-advanced-grid">
        <label class="v2-field"
          ><span>{{ copy.ageMin }}</span
          ><input v-model="filters.age_min" type="number" min="18" /></label
        ><label class="v2-field"
          ><span>{{ copy.ageMax }}</span
          ><input v-model="filters.age_max" type="number" min="18" /></label
        ><label class="v2-field"
          ><span>{{ copy.nationality }}</span
          ><input v-model="filters.nationality" /></label
        ><label class="v2-field"
          ><span>{{ copy.ethnicity }}</span
          ><input v-model="filters.ethnicity" /></label
        ><label class="v2-field"
          ><span>{{ copy.language }}</span
          ><input v-model="filters.language" /></label
        ><label class="v2-field"
          ><span>{{ copy.radius }}</span
          ><input v-model="filters.radius" type="number" min="1"
        /></label>
        <label class="v2-field"
          ><span>{{ copy.sort }}</span
          ><select v-model="filters.sort">
            <option value="recommended">{{ copy.recommended }}</option>
            <option value="newest">{{ copy.newest }}</option>
            <option value="most_viewed">{{ copy.mostViewed }}</option>
            <option value="last_update">{{ copy.lastUpdate }}</option>
            <option value="last_online">{{ copy.lastOnline }}</option>
            <option value="boosted">{{ copy.boosted }}</option>
          </select></label
        >
        <div class="directory-checks">
          <label
            ><input v-model="filters.verified" type="checkbox" true-value="1" false-value="" />
            {{ copy.verified }}</label
          ><label
            ><input v-model="filters.has_video" type="checkbox" true-value="1" false-value="" />
            {{ copy.video }}</label
          ><label
            ><input v-model="filters.phone" type="checkbox" true-value="1" false-value="" />
            {{ copy.phone }}</label
          ><label
            ><input
              v-model="filters.around_me"
              type="checkbox"
              true-value="1"
              false-value=""
              @change="useMyLocation"
            />
            {{ copy.around }}</label
          >
        </div>
        <input v-model="filters.city_id" type="hidden" /><input
          v-model="filters.lat"
          type="hidden"
        /><input v-model="filters.lng" type="hidden" /><input
          v-model="filters.view"
          type="hidden"
        /><button class="v2-button primary" type="submit">{{ copy.search }}</button>
      </div>
    </section>
    <section v-if="loading || store.loading" class="v2-wrap v2-listings">
      <div class="v2-listing-grid">
        <span v-for="n in 8" :key="n" class="v2-listing-skeleton"></span>
      </div>
    </section>
    <section v-else-if="error" class="v2-wrap v2-empty" role="alert">{{ error }}</section>
    <section v-else class="v2-wrap v2-listings" aria-labelledby="listings-title">
      <div class="v2-section-heading">
        <div>
          <p class="v2-eyebrow">{{ copy.eyebrow }}</p>
          <h2 id="listings-title">{{ copy.listings }}</h2>
        </div>
        <span v-if="store.pagination" class="v2-muted"
          >{{ store.pagination.total }} {{ copy.count }}</span
        >
      </div>
      <div v-if="store.listings.length" class="v2-listing-grid">
        <ListingCard
          v-for="(listing, index) in store.listings"
          :key="listing.id"
          :listing="listing"
          :index="index"
        />
      </div>
      <p v-else class="v2-empty">{{ copy.empty }}</p>
      <nav
        v-if="store.links.next || store.links.prev"
        class="directory-pagination"
        aria-label="Pagination"
      >
        <button
          v-if="store.links.prev"
          class="v2-button"
          type="button"
          @click="goToPage(store.links.prev)"
        >
          {{ copy.previous }}</button
        ><button
          v-if="store.links.next"
          class="v2-button"
          type="button"
          @click="goToPage(store.links.next)"
        >
          {{ copy.next }}
        </button>
      </nav>
    </section>
  </main>
</template>
