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
const { data, error } = await useAsyncData(`profile-en:${uuid}`, async () => {
  let response: any;
  try {
    response = await api<any>(`/profiles/${encodeURIComponent(uuid)}`);
  } catch {
    response = await api<any>(`/listings/by-uuid/${encodeURIComponent(uuid)}`);
  }
  const raw = response.data ?? response;
  if (raw.status && !['published', 'active'].includes(String(raw.status)))
    throw createError({ statusCode: 404, statusMessage: 'Profile not found' });
  const comments = await api<any>(`/profiles/${encodeURIComponent(uuid)}/comments`).catch(() => ({
    data: [],
  }));
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
const isOnline = computed(() => Boolean(listing.last_online));
const weekDays = [
  { key: '1', label: 'Monday' },
  { key: '2', label: 'Tuesday' },
  { key: '3', label: 'Wednesday' },
  { key: '4', label: 'Thursday' },
  { key: '5', label: 'Friday' },
  { key: '6', label: 'Saturday' },
  { key: '0', label: 'Sunday' },
];
function hoursLabel(value: any) {
  if (value?.all_day) return '24/7';
  const ranges = Array.isArray(value) ? value : value ? [value] : [];
  return (
    ranges
      .map((range: any) => `${range.from ?? ''}–${range.to ?? ''}`.replace(/^–|–$/g, ''))
      .filter(Boolean)
      .join(', ') || 'Not provided'
  );
}
function hoursFor(day: string) {
  return hoursLabel((listing.weekly_hours as Record<string, unknown> | undefined)?.[day]);
}
function contactHref(type: string, value: string) {
  if (type === 'phone') return `tel:${value}`;
  if (type === 'whatsapp') return `https://wa.me/${value.replace(/\D/g, '')}`;
  if (type === 'telegram') return value.startsWith('@') ? `https://t.me/${value.slice(1)}` : value;
  if (type === 'instagram' || type === 'snapchat')
    return value.startsWith('@') ? `https://${type}.com/${value.slice(1)}` : value;
  return value;
}
function previousPhoto() {
  if (listing.photos.length)
    selectedPhoto.value = (selectedPhoto.value - 1 + listing.photos.length) % listing.photos.length;
}
function nextPhoto() {
  if (listing.photos.length)
    selectedPhoto.value = (selectedPhoto.value + 1) % listing.photos.length;
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
    commentMessage.value = 'Thank you. Your comment will be published after moderation.';
  } catch {
    commentMessage.value = 'Please sign in to leave a comment.';
  }
}
useSeoMeta({
  title: `${listing.name} | ÉLÉGANCE`,
  description: listing.description.slice(0, 155),
  robots: 'index,follow',
});
useHead({ link: [{ rel: 'canonical', href: canonicalSiteUrl(profilePath(uuid, 'en'), siteUrl) }] });
</script>

<template>
  <main class="v8-profile v8-profile-detail v8-container">
    <div class="v8-profile-topline">
      <nav class="e-breadcrumb" aria-label="Breadcrumb">
        <NuxtLink to="/">Home</NuxtLink><span>/</span><NuxtLink to="/en/cities">Cities</NuxtLink
        ><span>/</span><span>{{ listing.name }}</span>
      </nav>
      <span class="v8-profile-online" :class="{ muted: !isOnline }"
        ><i></i>{{ isOnline ? 'Available now' : 'Offline' }}</span
      >
    </div>
    <header class="v8-profile-head">
      <div>
        <p class="e-kicker">Public profile</p>
        <h1>
          {{ listing.name }}<span v-if="listing.age"> ({{ listing.age }})</span>
        </h1>
        <p class="v8-profile-place">Profile in {{ listing.city || 'France' }}</p>
        <span v-if="listing.verified" class="e-status">✓ Verified profile</span>
      </div>
      <div class="v8-profile-actions">
        <NuxtLink
          class="e-button primary"
          :to="{ path: '/login', query: { return_to: route.fullPath } }"
          >Message</NuxtLink
        ><NuxtLink
          class="e-button secondary"
          :to="{ path: '/login', query: { return_to: route.fullPath } }"
          >♡ Favorites</NuxtLink
        >
      </div>
    </header>
    <div class="v8-profile-body">
      <section class="v8-profile-gallery" aria-label="Photo gallery">
        <div v-if="listing.photos.length" class="v8-profile-gallery-main">
          <img
            :src="listing.photos[selectedPhoto]?.url"
            :alt="listing.photos[selectedPhoto]?.alt || listing.name"
            referrerpolicy="no-referrer"
            fetchpriority="high"
          /><span v-if="listing.has_video" class="v8-profile-media-badge">Video</span
          ><button
            v-if="listing.photos.length > 1"
            type="button"
            class="v8-profile-gallery-arrow previous"
            aria-label="Previous photo"
            @click="previousPhoto"
          >
            ‹</button
          ><button
            v-if="listing.photos.length > 1"
            type="button"
            class="v8-profile-gallery-arrow next"
            aria-label="Next photo"
            @click="nextPhoto"
          >
            ›
          </button>
        </div>
        <div v-else class="v8-profile-gallery-empty">Photo unavailable</div>
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
          <h2>Direct contact</h2>
          <div class="e-contact-grid">
            <a
              v-for="(contact, type) in listing.contacts"
              v-show="contact.enabled && contact.value"
              :key="type"
              :href="contactHref(String(type), String(contact.value))"
              target="_blank"
              rel="noopener noreferrer"
              >{{ type }}<strong>{{ contact.value }}</strong></a
            >
          </div>
        </section>
        <section class="v8-profile-panel">
          <h2>Personal information</h2>
          <dl class="v8-profile-facts">
            <div>
              <dt>Gender</dt>
              <dd>{{ translateProfileValue(listing.gender, 'en') || '—' }}</dd>
            </div>
            <div>
              <dt>Age</dt>
              <dd>{{ listing.age ? `${listing.age} years` : '—' }}</dd>
            </div>
            <div v-if="listing.nationality">
              <dt>Nationality</dt>
              <dd>{{ listing.nationality }}</dd>
            </div>
            <div v-if="listing.ethnicity">
              <dt>Ethnicity</dt>
              <dd>{{ listing.ethnicity }}</dd>
            </div>
            <div v-if="listing.eye_color">
              <dt>Eyes</dt>
              <dd>{{ translateProfileValue(listing.eye_color, 'en') }}</dd>
            </div>
            <div v-if="listing.hair_color">
              <dt>Hair</dt>
              <dd>{{ translateProfileValue(listing.hair_color, 'en') }}</dd>
            </div>
            <div v-if="listing.height_cm">
              <dt>Height</dt>
              <dd>{{ listing.height_cm }} cm</dd>
            </div>
            <div v-if="listing.weight_kg">
              <dt>Weight</dt>
              <dd>{{ listing.weight_kg }} kg</dd>
            </div>
            <div v-if="listing.cup_size">
              <dt>Cup size</dt>
              <dd>{{ listing.cup_size }}</dd>
            </div>
            <div v-if="listing.intimate_grooming">
              <dt>Grooming</dt>
              <dd>{{ translateProfileValue(listing.intimate_grooming, 'en') }}</dd>
            </div>
            <div v-if="listing.smoking">
              <dt>Smoking</dt>
              <dd>{{ translateProfileValue(listing.smoking, 'en') }}</dd>
            </div>
            <div v-if="listing.alcohol">
              <dt>Alcohol</dt>
              <dd>{{ translateProfileValue(listing.alcohol, 'en') }}</dd>
            </div>
          </dl>
        </section>
        <section class="v8-profile-panel">
          <h2>Details</h2>
          <p v-if="listing.interested_in?.length">
            <span class="v8-profile-label">Interested in</span
            >{{
              listing.interested_in.map((value) => translateProfileValue(value, 'en')).join(' · ')
            }}
          </p>
          <p v-if="listing.services?.length">
            <span class="v8-profile-label">Services</span
            >{{ listing.services.map((value) => translateProfileValue(value, 'en')).join(' · ') }}
          </p>
          <p v-if="listing.styles?.length">
            <span class="v8-profile-label">Styles</span
            >{{ listing.styles.map((value) => translateProfileValue(value, 'en')).join(' · ') }}
          </p>
        </section>
      </aside>
    </div>
    <div class="v8-profile-columns">
      <section class="v8-profile-panel">
        <h2>Locations</h2>
        <p><span class="v8-profile-label">Base city</span>{{ listing.city || '—' }}</p>
        <p v-if="listing.working_cities?.length">
          <span class="v8-profile-label">Available in</span
          >{{ listing.working_cities.map((city) => city.name).join(' · ') }}
        </p>
      </section>
      <section v-if="listing.weekly_hours" class="v8-profile-panel">
        <h2>Availability</h2>
        <dl class="v8-profile-hours">
          <div v-for="day in weekDays" :key="day.key">
            <dt>{{ day.label }}</dt>
            <dd>{{ hoursFor(day.key) }}</dd>
          </div>
        </dl>
      </section>
    </div>
    <section class="v8-profile-panel v8-profile-about">
      <h2>About</h2>
      <p class="v8-profile-description">{{ listing.description || 'No description provided.' }}</p>
    </section>
    <section class="v8-profile-panel v8-profile-comments" aria-labelledby="comments-title">
      <div class="v8-profile-section-heading">
        <h2 id="comments-title">Comments</h2>
        <span>{{
          listing.comments?.length ? `${listing.comments.length} reviews` : 'No reviews'
        }}</span>
      </div>
      <article v-for="comment in listing.comments" :key="comment.id" class="v8-profile-comment">
        <strong>{{ comment.author?.name || 'Visitor' }}</strong>
        <p>{{ comment.body }}</p>
      </article>
      <p v-if="!listing.comments?.length" class="v8-profile-muted">No reviews yet.</p>
      <form v-if="user" class="v8-profile-comment-form" @submit.prevent="submitComment">
        <textarea
          v-model="commentBody"
          required
          minlength="10"
          maxlength="2000"
          placeholder="Your comment"
        ></textarea
        ><button class="e-button primary">Post comment</button>
        <p v-if="commentMessage">{{ commentMessage }}</p>
      </form>
      <div v-else class="e-comment-login">
        <p>Sign in to join the conversation.</p>
        <NuxtLink
          class="e-button primary"
          :to="{ path: '/login', query: { return_to: route.fullPath } }"
          >Sign in</NuxtLink
        >
      </div>
    </section>
    <section v-if="similarProfiles.length" class="v8-profile-similar">
      <div class="v8-profile-section-heading">
        <div>
          <h2>Other profiles near {{ listing.city }}</h2>
          <p class="v8-profile-muted">Same category, same city.</p>
        </div>
        <NuxtLink class="e-button secondary" :to="`/en/cities/${cityRouteSlug(listing.city)}`"
          >All listings</NuxtLink
        >
      </div>
      <div class="v8-profile-similar-grid">
        <PublicProfileCard
          v-for="(profile, index) in similarProfiles"
          :key="profile.id"
          :listing="profile"
          :index="index"
          locale="en"
        />
      </div>
    </section>
  </main>
</template>
