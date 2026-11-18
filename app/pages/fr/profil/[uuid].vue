<script setup lang="ts">
import { ref } from 'vue';
import { normalizePublicProfile, canonicalSiteUrl, profilePath } from '../../../utils/public';
const route = useRoute();
const api = usePublicApi();
const uuid = String(route.params.uuid);
const { data, error } = await useAsyncData(`profile:${uuid}`, async () => {
  const [response, comments] = await Promise.all([
    api<any>(`/profiles/${encodeURIComponent(uuid)}`),
    api<any>(`/profiles/${encodeURIComponent(uuid)}/comments`),
  ]);
  const profile = normalizePublicProfile(response.data ?? response);
  profile.comments = comments.data ?? comments;
  return profile;
});
if (error.value || !data.value)
  throw createError({ statusCode: 404, statusMessage: 'Profile not found' });
const listing = data.value;
useSeoMeta({
  title: `${listing.name} | ÉLÉGANCE`,
  description: listing.description.slice(0, 155),
  robots: 'index,follow',
});
useHead({ link: [{ rel: 'canonical', href: canonicalSiteUrl(profilePath(uuid)) }] });
const commentBody = ref('');
const commentMessage = ref('');
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
</script>
<template>
  <main class="v2-wrap v2-profile-page">
    <div class="grid gap-12 md:grid-cols-2">
      <div class="grid grid-cols-2 gap-3">
        <img
          v-for="(photo, index) in listing.photos"
          :key="photo.id ?? photo.url"
          :src="photo.url"
          :alt="photo.alt || listing.name"
          :loading="index ? 'lazy' : 'eager'"
          class="aspect-[3/4] w-full rounded-xl object-cover"
        />
      </div>
      <div>
        <p class="text-dusty-dark">{{ listing.city }} · {{ listing.country }}</p>
        <h1 class="mt-3 text-5xl font-light">
          {{ listing.name }}<span v-if="listing.age">, {{ listing.age }}</span>
        </h1>
        <p class="mt-8 whitespace-pre-line leading-8 text-zinc-600">{{ listing.description }}</p>
        <div
          v-if="listing.contacts && Object.keys(listing.contacts).length"
          class="mt-10 rounded-2xl border border-zinc-200 bg-white p-5"
        >
          <h2 class="text-lg font-medium">Contact direct</h2>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              v-for="(contact, type) in listing.contacts"
              v-show="contact.enabled && contact.value"
              :key="type"
              :href="String(contact.value)"
              rel="nofollow noopener"
              class="rounded-xl bg-zinc-50 px-4 py-3 text-sm"
              >{{ type }}<span class="block font-medium">{{ contact.value }}</span></a
            >
          </div>
        </div>
      </div>
    </div>
    <section class="mt-20 border-t border-zinc-200 pt-10">
      <h2 class="text-3xl font-light">Commentaires</h2>
      <div class="mt-6 space-y-4">
        <article
          v-for="comment in data.comments"
          :key="comment.id"
          class="rounded-2xl border border-zinc-200 bg-white p-5"
        >
          <p class="text-sm text-zinc-500">{{ comment.author?.name || 'Visiteur' }}</p>
          <p class="mt-2 text-zinc-700">{{ comment.body }}</p>
        </article>
        <p v-if="!data.comments?.length" class="text-zinc-500">Aucun commentaire publié.</p>
      </div>
      <form class="mt-8 max-w-2xl" @submit.prevent="submitComment">
        <textarea
          v-model="commentBody"
          required
          minlength="10"
          maxlength="2000"
          class="min-h-28 w-full rounded-xl border border-zinc-300 bg-white p-4"
          placeholder="Votre commentaire (publication après modération)"
        ></textarea
        ><button class="mt-3 rounded-full bg-dusty px-6 py-3 font-medium text-white">
          Publier un commentaire
        </button>
        <p v-if="commentMessage" class="mt-3 text-sm text-dusty-dark">{{ commentMessage }}</p>
      </form>
    </section>
  </main>
</template>
