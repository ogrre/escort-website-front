<script setup lang="ts">
import { normalizePublicProfile, canonicalSiteUrl, profilePath } from '../../../utils/public';
const route = useRoute();
const api = usePublicApi();
const uuid = String(route.params.uuid);
const { data, error } = await useAsyncData(`profile-en:${uuid}`, async () => {
  const response = await api<any>(`/profiles/${encodeURIComponent(uuid)}`);
  return normalizePublicProfile(response.data ?? response);
});
if (error.value || !data.value)
  throw createError({ statusCode: 404, statusMessage: 'Profile not found' });
useSeoMeta({
  title: `${data.value.name} | ÉLÉGANCE`,
  description: data.value.description.slice(0, 155),
  robots: 'index,follow',
});
useHead({ link: [{ rel: 'canonical', href: canonicalSiteUrl(profilePath(uuid, 'en')) }] });
</script>
<template>
  <main class="v2-wrap v2-profile-page">
    <h1>
      {{ data.name }}<span v-if="data.age">, {{ data.age }}</span>
    </h1>
    <p class="mt-8 whitespace-pre-line leading-8 text-zinc-600">{{ data.description }}</p>
    <div class="mt-8 grid grid-cols-2 gap-3">
      <img
        v-for="photo in data.photos"
        :key="photo.id ?? photo.url"
        :src="photo.url"
        :alt="photo.alt || data.name"
        loading="lazy"
        class="aspect-[3/4] w-full rounded-xl object-cover"
      />
    </div>
  </main>
</template>
