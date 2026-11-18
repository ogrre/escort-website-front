<script setup lang="ts">
import ListingCard from '../../../../src/components/ListingCard.vue';
import { normalizePublicProfile, canonicalSiteUrl, cityPath } from '../../../utils/public';
const route = useRoute();
const api = usePublicApi();
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
    const city = await api<any>(`/locations/${encodeURIComponent(slug.value)}`);
    const profiles = await api<any>('/profiles/search', { query: filters.value });
    return {
      city: city.data ?? city,
      profiles: profiles.data ?? [],
      meta: profiles.meta,
      links: profiles.links,
    };
  },
);
if (error.value || !data.value?.city)
  throw createError({ statusCode: 404, statusMessage: 'City not found' });
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
  link: [{ rel: 'canonical', href: canonicalSiteUrl(cityPath(slug.value)) }],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: canonicalSiteUrl('/') },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Villes',
            item: canonicalSiteUrl('/fr/villes'),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: city.value.name,
            item: canonicalSiteUrl(cityPath(slug.value)),
          },
        ],
      }),
    },
  ],
}));
const listings = computed(() => data.value!.profiles.map(normalizePublicProfile));
</script>
<template>
  <main class="v2-page v4-home">
    <nav class="v2-wrap text-sm" aria-label="Fil d’Ariane">
      <NuxtLink to="/">Accueil</NuxtLink> / <NuxtLink to="/fr/villes">Villes</NuxtLink> /
      {{ city.name }}
    </nav>
    <section class="v2-wrap v4-home-intro city-seo-header">
      <p class="v2-eyebrow">Annuaire local · 18+</p>
      <h1>Escortes et modèles à {{ city.name }}</h1>
      <p class="v2-lead">Découvrez les profils disponibles à {{ city.name }}.</p>
      <p class="city-count">{{ city.listings_count }} annonces disponibles</p>
    </section>
    <section class="v2-wrap v2-listings">
      <h2>Profils à découvrir</h2>
      <div class="v2-listing-grid">
        <ListingCard
          v-for="(listing, index) in listings"
          :key="listing.id"
          :listing="listing"
          :index="index"
        />
      </div>
      <p v-if="!listings.length" class="v2-empty">
        Aucun profil publié n’est disponible dans cette ville pour le moment.
      </p>
      <nav
        v-if="data.links?.next || data.links?.prev"
        aria-label="Pagination"
        class="mt-8 flex justify-center gap-3"
      >
        <NuxtLink v-if="data.links?.prev" class="v2-button" :to="data.links.prev"
          >Précédent</NuxtLink
        ><NuxtLink v-if="data.links?.next" class="v2-button" :to="data.links.next"
          >Suivant</NuxtLink
        >
      </nav>
    </section>
  </main>
</template>
