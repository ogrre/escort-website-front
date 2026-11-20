<script setup lang="ts">
import { useState } from '#imports';
import {
  cityRouteSlug,
  normalizePublicProfile,
  canonicalSiteUrl,
  cityPath,
} from '../../../utils/public';
import { fetchAllLocations } from '../../../composables/useLocations';
const route = useRoute();
const router = useRouter();
const api = usePublicApi();
const siteUrl = String(useRuntimeConfig().public.siteUrl);
const locationCache = useState<any[]>('public-location-directory', () => []);
const slug = computed(() => String(route.params.citySlug));
const filters = computed(() => ({
  ...route.query,
  city: slug.value,
  limit: route.query.limit ?? '24',
  sort: route.query.sort ?? 'recommended',
}));
const { data, error } = await useAsyncData(
  () => `city:${slug.value}:${JSON.stringify(route.query)}`,
  async () => {
    const locations = locationCache.value.length
      ? locationCache.value
      : await fetchAllLocations(api, { country: 'FR', has_listings: 1, per_page: 100 });
    locationCache.value = locations;
    const requested = decodeURIComponent(slug.value)
      .toLocaleLowerCase('fr')
      .replace(/[^a-z0-9]+/g, '-');
    const resolvedCity = locations.find(
      (candidate: any) => cityRouteSlug(String(candidate.name ?? '')) === requested,
    );
    if (!resolvedCity) throw createError({ statusCode: 404, statusMessage: 'City not found' });
    const apiCitySlug = resolvedCity.slug;
    let profiles: any;
    try {
      profiles = await api<any>('/profiles/search', {
        query: { ...filters.value, city: apiCitySlug },
      });
    } catch (cause) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Unable to load city profiles',
        cause,
      });
    }
    return {
      city: resolvedCity,
      profiles: profiles.data ?? [],
      meta: profiles.meta,
      links: profiles.links,
    };
  },
);
if (error.value) throw error.value;
if (!data.value?.city) throw createError({ statusCode: 404, statusMessage: 'City not found' });
const city = computed(() => data.value!.city);
const filtered = computed(() =>
  Object.keys(route.query).some((key) => !['page', 'limit', 'sort'].includes(key)),
);
useSeoMeta(() => ({
  title: `Escortes et modèles à ${city.value.name} — Profils disponibles | ÉLÉGANCE`,
  description: `Découvrez les profils et annonces disponibles à ${city.value.name}, ${city.value.region?.name ?? 'France'}.`,
  robots: filtered.value ? 'noindex,follow' : 'index,follow',
  ogTitle: `Profils à ${city.value.name} | ÉLÉGANCE`,
}));
useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalSiteUrl(cityPath(slug.value), siteUrl) }],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Accueil',
            item: canonicalSiteUrl('/', siteUrl),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Villes',
            item: canonicalSiteUrl('/fr/villes', siteUrl),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: city.value.name,
            item: canonicalSiteUrl(cityPath(slug.value), siteUrl),
          },
        ],
      }),
    },
  ],
}));
const listings = computed(() => data.value?.profiles?.map(normalizePublicProfile) ?? []);
const drawerOpen = ref(false);
const filtersForUi = computed(() =>
  Object.fromEntries(
    Object.entries(route.query).map(([key, value]) => [
      key,
      Array.isArray(value) ? String(value[0]) : String(value ?? ''),
    ]),
  ),
);
const totalResults = computed(() => Number(data.value?.meta?.total ?? listings.value.length));
const currentPage = computed(() =>
  Number(data.value?.meta?.page ?? data.value?.meta?.current_page ?? route.query.page ?? 1),
);
const totalPages = computed(() =>
  Number(data.value?.meta?.pages ?? data.value?.meta?.last_page ?? 1),
);
function updateQuery(values: Record<string, string | undefined>) {
  const query = { ...route.query, ...values } as Record<string, string | undefined>;
  Object.keys(query).forEach((key) => {
    if (!query[key]) delete query[key];
  });
  void router.push({ path: route.path, query });
}
function toggleFilter(key: string) {
  updateQuery({ [key]: route.query[key] ? undefined : '1', page: undefined });
}
function removeFilter(key: string) {
  updateQuery({ [key]: undefined, page: undefined });
}
function applyAdvanced(values: Record<string, string | undefined>) {
  drawerOpen.value = false;
  updateQuery({ ...values, page: undefined });
}
function toggleAdvanced() {
  drawerOpen.value = !drawerOpen.value;
}
function resetFilters() {
  drawerOpen.value = false;
  void router.push({ path: route.path });
}
function setSort(event: Event) {
  updateQuery({ sort: (event.target as HTMLSelectElement).value, page: undefined });
}
function requestLocation() {
  if (!import.meta.client || !navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (position) =>
      updateQuery({
        around_me: '1',
        lat: String(position.coords.latitude),
        lng: String(position.coords.longitude),
        radius: String(route.query.radius ?? '25'),
        page: undefined,
      }),
    () => undefined,
    { enableHighAccuracy: false, timeout: 8000 },
  );
}
</script>
<template>
  <main class="v8-city-page">
    <nav class="v2-wrap text-sm v8-city-breadcrumb" aria-label="Fil d’Ariane">
      <NuxtLink to="/">Accueil</NuxtLink> / <NuxtLink to="/fr/villes">Villes</NuxtLink> /
      {{ city.name }}
    </nav>
    <section class="v2-wrap city-seo-header v8-city-heading">
      <h1>Escortes et modèles à {{ city.name }}</h1>
    </section>
    <section class="v8-city-layout v8-container v8-city-layout--top">
      <section class="v8-city-results">
        <ProfileSearchBar
          :city-slug="slug"
          :values="filtersForUi"
          :advanced-open="drawerOpen"
          @advanced="toggleAdvanced"
        />
        <ProfileFiltersDrawer
          id="advanced-filters"
          :open="drawerOpen"
          :values="filtersForUi"
          @close="drawerOpen = false"
          @apply="applyAdvanced"
          @reset="resetFilters"
        />
        <div class="e-quick-filters" aria-label="Filtres rapides">
          <button
            type="button"
            :class="{ active: route.query.verified }"
            @click="toggleFilter('verified')"
          >
            ✓ Vérifiés
          </button>
          <button
            type="button"
            :class="{ active: route.query.has_video }"
            @click="toggleFilter('has_video')"
          >
            Avec vidéo
          </button>
          <button
            type="button"
            :class="{ active: route.query.phone }"
            @click="toggleFilter('phone')"
          >
            Téléphone visible
          </button>
          <button type="button" :class="{ active: route.query.around_me }" @click="requestLocation">
            Autour de moi
          </button>
          <button type="button" @click="drawerOpen = true">
            Tous les filtres <span aria-hidden="true">＋</span>
          </button>
        </div>
        <div class="e-results-bar">
          <div>
            <span class="e-kicker">Résultats publics</span>
            <h2 id="listings-title">{{ totalResults }} profils à {{ city.name }}</h2>
          </div>
          <label class="e-sort"
            ><span>Trier</span
            ><select :value="route.query.sort || 'recommended'" @change="setSort">
              <option value="recommended">Recommandés</option>
              <option value="newest">Nouveaux</option>
              <option value="most_viewed">Plus consultés</option>
              <option value="last_update">Mis à jour</option>
              <option value="last_online">Récents en ligne</option>
              <option value="boosted">Mis en avant</option>
            </select></label
          >
        </div>
        <div v-if="Object.keys(route.query).length" class="e-active-filters">
          <span v-for="(value, key) in filtersForUi" :key="key" class="e-active-filter"
            >{{ key }} : {{ value }}
            <button type="button" :aria-label="`Retirer ${key}`" @click="removeFilter(String(key))">
              ×
            </button></span
          ><button type="button" class="e-reset" @click="resetFilters">Réinitialiser</button>
        </div>
        <div class="v2-listing-grid">
          <PublicProfileCard
            v-for="(listing, index) in listings"
            :key="listing.id"
            :listing="listing"
            :index="index"
          />
        </div>
        <p v-if="!listings.length" class="v2-empty">
          Aucun profil publié n’est disponible dans cette ville pour le moment.
        </p>
        <nav v-if="totalPages > 1" class="e-pagination" aria-label="Pagination">
          <NuxtLink
            v-if="currentPage > 1"
            class="e-button secondary"
            :to="{ path: route.path, query: { ...route.query, page: currentPage - 1 } }"
            >Précédent</NuxtLink
          ><span>Page {{ currentPage }} / {{ totalPages }}</span
          ><NuxtLink
            v-if="currentPage < totalPages"
            class="e-button secondary"
            :to="{ path: route.path, query: { ...route.query, page: currentPage + 1 } }"
            >Suivant</NuxtLink
          >
        </nav>
      </section>
    </section>
  </main>
</template>
