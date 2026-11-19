<script setup lang="ts">
import { computed, ref } from 'vue';
import PublicProfileCard from '../../../components/PublicProfileCard.vue';
import {
  canonicalSiteUrl,
  cityRouteSlug,
  normalizePublicProfile,
  profilePath,
  translateProfileValue,
} from '../../../utils/public';

const route = useRoute();
const api = usePublicApi();
const siteUrl = String(useRuntimeConfig().public.siteUrl);
const uuid = String(route.params.uuid);
const { user, refresh } = useAuth();
if (import.meta.client) await refresh();
const { data, error } = await useAsyncData(`profile:${uuid}`, async () => {
  let response: any;
  try {
    response = await api<any>(`/profiles/${encodeURIComponent(uuid)}`);
  } catch {
    response = await api<any>(`/listings/by-uuid/${encodeURIComponent(uuid)}`);
  }
  const comments = await api<any>(`/profiles/${encodeURIComponent(uuid)}/comments`).catch(() => ({
    data: [],
  }));
  const raw = response.data ?? response;
  if (raw.status && !['published', 'active'].includes(String(raw.status)))
    throw createError({ statusCode: 404, statusMessage: 'Profile not found' });
  const profile = normalizePublicProfile(raw);
  profile.comments = comments.data ?? comments;
  const similar = raw.city?.slug
    ? await api<any>('/profiles/search', {
        query: { city: raw.city.slug, limit: 8, sort: 'recommended', view: 'cards' },
      }).catch(() => ({ data: [] }))
    : { data: [] };
  (profile as any).similar_profiles = (similar.data ?? [])
    .filter((item: any) => String(item.id) !== String(raw.id))
    .map(normalizePublicProfile);
  return profile;
});
if (error.value || !data.value)
  throw createError({ statusCode: 404, statusMessage: 'Profile not found' });

const listing = data.value;
const similarProfiles = computed(() => (listing as any).similar_profiles ?? []);
const selectedPhoto = ref(0);
const commentBody = ref('');
const commentMessage = ref('');
const reference = uuid.slice(0, 8).toUpperCase();
const isOnline = computed(() => Boolean(listing.last_online));
const weekDays = [
  { key: '1', label: 'Lundi' },
  { key: '2', label: 'Mardi' },
  { key: '3', label: 'Mercredi' },
  { key: '4', label: 'Jeudi' },
  { key: '5', label: 'Vendredi' },
  { key: '6', label: 'Samedi' },
  { key: '0', label: 'Dimanche' },
];
function hoursLabel(value: any) {
  if (value?.all_day) return '24h/24';
  const ranges = Array.isArray(value) ? value : value ? [value] : [];
  return (
    ranges
      .map((range: any) => `${range.from ?? ''}–${range.to ?? ''}`.replace(/^–|–$/g, ''))
      .filter(Boolean)
      .join(', ') || 'Non renseigné'
  );
}
function hoursFor(day: string) {
  return hoursLabel((listing.weekly_hours as Record<string, unknown> | undefined)?.[day]);
}
function previousPhoto() {
  if (!listing.photos.length) return;
  selectedPhoto.value = (selectedPhoto.value - 1 + listing.photos.length) % listing.photos.length;
}
function nextPhoto() {
  if (!listing.photos.length) return;
  selectedPhoto.value = (selectedPhoto.value + 1) % listing.photos.length;
}
function contactHref(type: string, value: string) {
  if (type === 'phone') return `tel:${value}`;
  if (type === 'whatsapp') return `https://wa.me/${value.replace(/\D/g, '')}`;
  if (type === 'telegram') return value.startsWith('@') ? `https://t.me/${value.slice(1)}` : value;
  if (type === 'instagram' || type === 'snapchat')
    return value.startsWith('@') ? `https://${type}.com/${value.slice(1)}` : value;
  return value;
}
async function copyReference() {
  if (import.meta.client) await navigator.clipboard?.writeText(window.location.href);
}
async function shareProfile() {
  if (!import.meta.client) return;
  if (navigator.share) await navigator.share({ title: listing.name, url: window.location.href });
  else await copyReference();
}
async function submitComment() {
  if (!import.meta.client) return;
  try {
    await api(`/profiles/${encodeURIComponent(uuid)}/comments`, {
      method: 'POST',
      body: { body: commentBody.value },
      headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
    });
    commentBody.value = '';
    commentMessage.value = 'Merci. Votre commentaire sera publié après modération.';
  } catch {
    commentMessage.value = 'Connectez-vous pour laisser un commentaire.';
  }
}
useSeoMeta({
  title: `${listing.name} | ÉLÉGANCE`,
  description: listing.description.slice(0, 155),
  robots: 'index,follow',
});
useHead({
  link: [{ rel: 'canonical', href: canonicalSiteUrl(profilePath(uuid), siteUrl) }],
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
            name: `Escortes à ${listing.city}`,
            item: canonicalSiteUrl(`/fr/villes/${cityRouteSlug(listing.city)}`, siteUrl),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: listing.name,
            item: canonicalSiteUrl(profilePath(uuid), siteUrl),
          },
        ],
      }),
    },
  ],
});
</script>

<template>
  <main class="v8-profile v8-profile-detail v8-container">
    <div class="v8-profile-topline">
      <nav class="e-breadcrumb" aria-label="Fil d’Ariane">
        <NuxtLink to="/">Accueil</NuxtLink><span>/</span><NuxtLink to="/fr/villes">Villes</NuxtLink
        ><span>/</span><span>{{ listing.name }}</span>
      </nav>
      <div class="v8-profile-top-actions">
        <span class="v8-profile-online" :class="{ muted: !isOnline }"
          ><i></i>{{ isOnline ? 'Disponible maintenant' : 'Hors ligne' }}</span
        ><span class="v8-profile-reference">Réf. {{ reference }}</span
        ><button type="button" class="v8-profile-action" @click="copyReference">
          Copier le lien</button
        ><button type="button" class="v8-profile-action" @click="shareProfile">Partager</button>
      </div>
    </div>
    <div v-if="listing.status_text" class="v8-profile-alert" role="status">
      <strong>{{ listing.status_text }}</strong>
    </div>
    <header class="v8-profile-head">
      <div>
        <p class="e-kicker">Profil public</p>
        <h1>
          {{ listing.name }}<span v-if="listing.age"> ({{ listing.age }})</span>
        </h1>
        <p class="v8-profile-place">Escorte à {{ listing.city || 'France' }}</p>
        <span v-if="listing.verified" class="e-status">✓ Profil vérifié</span>
      </div>
      <div class="v8-profile-actions">
        <NuxtLink
          class="e-button primary"
          :to="{ path: '/login', query: { return_to: route.fullPath } }"
          >Message</NuxtLink
        ><NuxtLink
          class="e-button secondary"
          :to="{ path: '/login', query: { return_to: route.fullPath } }"
          >♡ Favoris</NuxtLink
        ><NuxtLink
          class="e-button secondary"
          :to="{ path: '/login', query: { return_to: route.fullPath } }"
          >Suivre</NuxtLink
        >
      </div>
    </header>
    <div class="v8-profile-body">
      <section class="v8-profile-gallery" aria-label="Galerie photos">
        <div v-if="listing.photos.length" class="v8-profile-gallery-main">
          <img
            :src="listing.photos[selectedPhoto]?.url"
            :alt="listing.photos[selectedPhoto]?.alt || listing.name"
            referrerpolicy="no-referrer"
            fetchpriority="high"
          /><span v-if="listing.has_video" class="v8-profile-media-badge">Vidéo</span>
          <button
            v-if="listing.photos.length > 1"
            type="button"
            class="v8-profile-gallery-arrow previous"
            aria-label="Photo précédente"
            @click="previousPhoto"
          >
            ‹
          </button>
          <button
            v-if="listing.photos.length > 1"
            type="button"
            class="v8-profile-gallery-arrow next"
            aria-label="Photo suivante"
            @click="nextPhoto"
          >
            ›
          </button>
        </div>
        <div v-else class="v8-profile-gallery-empty">Photo indisponible</div>
        <div v-if="listing.photos.length > 1" class="v8-profile-thumbnails">
          <button
            v-for="(photo, index) in listing.photos"
            :key="photo.id ?? photo.url"
            type="button"
            :class="{ active: selectedPhoto === index }"
            :aria-label="`Photo ${index + 1}`"
            @click="selectedPhoto = index"
          >
            <img
              :src="photo.url"
              :alt="photo.alt || listing.name"
              loading="lazy"
              referrerpolicy="no-referrer"
            />
          </button>
        </div>
      </section>
      <aside class="v8-profile-sidebar">
        <section
          v-if="listing.contacts && Object.keys(listing.contacts).length"
          class="v8-profile-panel v8-profile-contact-panel"
        >
          <h2>Contact direct</h2>
          <div class="e-contact-grid">
            <a
              v-for="(contact, type) in listing.contacts"
              v-show="contact.enabled && contact.value"
              :key="type"
              :href="contactHref(String(type), String(contact.value))"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ type }}<strong>{{ contact.value }}</strong>
            </a>
          </div>
        </section>
        <section class="v8-profile-panel">
          <h2>Informations personnelles</h2>
          <dl class="v8-profile-facts">
            <div>
              <dt>Genre</dt>
              <dd>{{ translateProfileValue(listing.gender) || '—' }}</dd>
            </div>
            <div>
              <dt>Âge</dt>
              <dd>{{ listing.age ? `${listing.age} ans` : '—' }}</dd>
            </div>
            <div v-if="listing.nationality">
              <dt>Nationalité</dt>
              <dd>{{ listing.nationality }}</dd>
            </div>
            <div v-if="listing.ethnicity">
              <dt>Origine</dt>
              <dd>{{ listing.ethnicity }}</dd>
            </div>
            <div v-if="listing.eye_color">
              <dt>Yeux</dt>
              <dd>{{ translateProfileValue(listing.eye_color) }}</dd>
            </div>
            <div v-if="listing.hair_color">
              <dt>Cheveux</dt>
              <dd>{{ translateProfileValue(listing.hair_color) }}</dd>
            </div>
            <div v-if="listing.height_cm">
              <dt>Taille</dt>
              <dd>{{ listing.height_cm }} cm</dd>
            </div>
            <div v-if="listing.weight_kg">
              <dt>Poids</dt>
              <dd>{{ listing.weight_kg }} kg</dd>
            </div>
            <div v-if="listing.cup_size">
              <dt>Poitrine</dt>
              <dd>{{ listing.cup_size }}</dd>
            </div>
            <div v-if="listing.intimate_grooming">
              <dt>Épilation</dt>
              <dd>{{ translateProfileValue(listing.intimate_grooming) }}</dd>
            </div>
            <div v-if="listing.smoking">
              <dt>Tabac</dt>
              <dd>{{ translateProfileValue(listing.smoking) }}</dd>
            </div>
            <div v-if="listing.alcohol">
              <dt>Alcool</dt>
              <dd>{{ translateProfileValue(listing.alcohol) }}</dd>
            </div>
          </dl>
        </section>
        <section class="v8-profile-panel">
          <h2>Détails</h2>
          <p v-if="listing.interested_in?.length">
            <span class="v8-profile-label">Intéressé par</span
            >{{ listing.interested_in.map((value) => translateProfileValue(value)).join(' · ') }}
          </p>
          <p v-if="listing.services?.length">
            <span class="v8-profile-label">Services</span
            >{{ listing.services.map((value) => translateProfileValue(value)).join(' · ') }}
          </p>
          <p v-if="listing.styles?.length">
            <span class="v8-profile-label">Styles</span
            >{{ listing.styles.map((value) => translateProfileValue(value)).join(' · ') }}
          </p>
        </section>
      </aside>
    </div>
    <div class="v8-profile-columns">
      <section class="v8-profile-panel">
        <h2>Coordonnées et villes</h2>
        <p><span class="v8-profile-label">Ville de base</span>{{ listing.city || '—' }}</p>
        <p v-if="listing.working_cities?.length">
          <span class="v8-profile-label">Disponible à</span
          >{{ listing.working_cities.map((city) => city.name).join(' · ') }}
        </p>
      </section>
      <section v-if="listing.weekly_hours" class="v8-profile-panel">
        <h2>Disponibilités</h2>
        <dl class="v8-profile-hours">
          <div v-for="day in weekDays" :key="day.key">
            <dt>{{ day.label }}</dt>
            <dd>{{ hoursFor(day.key) }}</dd>
          </div>
        </dl>
      </section>
    </div>
    <section class="v8-profile-panel v8-profile-about">
      <h2>Présentation</h2>
      <p class="v8-profile-description">
        {{ listing.description || 'Aucune présentation renseignée.' }}
      </p>
    </section>
    <section class="v8-profile-panel v8-profile-comments" aria-labelledby="comments-title">
      <div class="v8-profile-section-heading">
        <h2 id="comments-title">Commentaires</h2>
        <span>{{ data.comments?.length ? `${data.comments.length} avis` : 'Aucun avis' }}</span>
      </div>
      <article v-for="comment in data.comments" :key="comment.id" class="v8-profile-comment">
        <strong>{{ comment.author?.name || 'Visiteur' }}</strong>
        <p>{{ comment.body }}</p>
      </article>
      <p v-if="!data.comments?.length" class="v8-profile-muted">Aucun avis pour le moment.</p>
      <form v-if="user" class="v8-profile-comment-form" @submit.prevent="submitComment">
        <textarea
          v-model="commentBody"
          required
          minlength="10"
          maxlength="2000"
          placeholder="Votre commentaire"
        ></textarea
        ><button class="e-button primary">Publier un commentaire</button>
        <p v-if="commentMessage">{{ commentMessage }}</p>
      </form>
      <div v-else class="e-comment-login">
        <p>Connectez-vous pour participer à la conversation.</p>
        <NuxtLink
          class="e-button primary"
          :to="{ path: '/login', query: { return_to: route.fullPath } }"
          >Se connecter</NuxtLink
        >
      </div>
    </section>
    <section v-if="similarProfiles.length" class="v8-profile-similar">
      <div class="v8-profile-section-heading">
        <div>
          <h2>D’autres profils près de {{ listing.city }}</h2>
          <p class="v8-profile-muted">Même catégorie, dans la même ville.</p>
        </div>
        <NuxtLink class="e-button secondary" :to="`/fr/villes/${cityRouteSlug(listing.city)}`"
          >Toutes les annonces</NuxtLink
        >
      </div>
      <div class="v8-profile-similar-grid">
        <PublicProfileCard
          v-for="(profile, index) in similarProfiles"
          :key="profile.id"
          :listing="profile"
          :index="index"
        />
      </div>
    </section>
  </main>
</template>
