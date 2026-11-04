<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../lib/api';

const route = useRoute();
const listing = ref<any>(null);
const commentBody = ref('');
const commentMessage = ref('');
const contactLabels: Record<string, string> = {
  phone: 'Téléphone',
  whatsapp: 'WhatsApp',
  snapchat: 'Snapchat',
  telegram: 'Telegram',
  instagram: 'Instagram',
  other: 'Autre',
};
const visibleContacts = computed<[string, { enabled: boolean; value: string }][]>(() =>
  Object.entries(
    (listing.value?.contacts ?? {}) as Record<string, { enabled: boolean; value: string }>,
  ).filter(([, contact]) => contact.enabled && contact.value),
);

function contactHref(type: string, value: string): string {
  if (type === 'whatsapp') return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
  if (type === 'telegram') return value.startsWith('@') ? `https://t.me/${value.slice(1)}` : value;
  if (type === 'instagram' || type === 'snapchat')
    return value.startsWith('@') ? `https://${type}.com/${value.slice(1)}` : value;
  if (type === 'phone') return `tel:${value}`;
  return value;
}

async function submitComment() {
  try {
    await api.post(
      `/listings/${route.params.slug}/comments`,
      { body: commentBody.value },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    );
    commentBody.value = '';
    commentMessage.value = 'Merci. Votre commentaire sera publié après modération.';
  } catch {
    commentMessage.value = 'Connectez-vous pour laisser un commentaire.';
  }
}

onMounted(async () => {
  listing.value = (await api.get(`/listings/${route.params.slug}`)).data.data;
});
</script>

<template>
  <section v-if="listing" class="mx-auto max-w-6xl px-6 py-14">
    <div class="grid gap-12 md:grid-cols-2">
      <div class="grid grid-cols-2 gap-3">
        <img
          v-for="photo in listing.photos"
          :key="photo.id"
          :src="photo.url"
          :alt="photo.alt || listing.name"
          class="aspect-[3/4] w-full rounded-xl object-cover"
          loading="lazy"
        />
      </div>
      <div>
        <p class="text-dusty-dark">{{ listing.city }} · {{ listing.country }}</p>
        <h1 class="mt-3 text-5xl font-light">{{ listing.name }}, {{ listing.age }}</h1>
        <p
          v-if="listing.status_text"
          class="mt-4 inline-block rounded-full bg-dusty/15 px-4 py-2 text-sm font-medium text-dusty-dark"
        >
          {{ listing.status_text }}
        </p>
        <p class="mt-8 whitespace-pre-line leading-8 text-zinc-600">{{ listing.description }}</p>
        <div class="mt-8 flex flex-wrap gap-2">
          <span
            v-for="service in listing.services"
            :key="service"
            class="rounded-full border border-dusty/50 px-4 py-2 text-sm text-dusty-dark"
            >{{ service }}</span
          >
        </div>
        <div
          v-if="visibleContacts.length"
          class="mt-10 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <h2 class="text-lg font-medium">Contact direct</h2>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              v-for="[type, contact] in visibleContacts"
              :key="type"
              :href="contactHref(type, contact.value)"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-xl bg-zinc-50 px-4 py-3 text-sm transition hover:bg-dusty/10"
              ><span class="block text-xs uppercase tracking-wide text-zinc-500">{{
                contactLabels[type] || type
              }}</span
              ><span class="mt-1 block font-medium text-dusty-dark">{{ contact.value }}</span></a
            >
          </div>
        </div>
      </div>
    </div>
    <section class="mt-20 border-t border-zinc-200 pt-10">
      <h2 class="text-3xl font-light">Commentaires</h2>
      <div class="mt-6 space-y-4">
        <article
          v-for="comment in listing.comments"
          :key="comment.id"
          class="rounded-2xl border border-zinc-200 bg-white p-5"
        >
          <p class="text-sm text-zinc-500">{{ comment.author?.name || 'Visiteur' }}</p>
          <p class="mt-2 text-zinc-700">{{ comment.body }}</p>
        </article>
        <p v-if="!listing.comments?.length" class="text-zinc-500">Aucun commentaire publié.</p>
      </div>
      <form class="mt-8 max-w-2xl" @submit.prevent="submitComment">
        <textarea
          v-model="commentBody"
          required
          minlength="10"
          maxlength="2000"
          placeholder="Votre commentaire (publication après modération)"
          class="min-h-28 w-full rounded-xl border border-zinc-300 bg-white p-4 outline-none focus:border-dusty"
        ></textarea
        ><button class="mt-3 rounded-full bg-dusty px-6 py-3 font-medium text-white">
          Publier un commentaire
        </button>
        <p v-if="commentMessage" class="mt-3 text-sm text-dusty-dark">{{ commentMessage }}</p>
      </form>
    </section>
  </section>
</template>
