<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { api } from '../lib/api';

export interface ListingPhoto {
  id: string;
  url: string;
  alt?: string | null;
  position?: number;
  is_main?: boolean;
}

const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const props = defineProps<{
  listingUuid: string;
  photos: ListingPhoto[];
}>();

const emit = defineEmits<{
  'update:photos': [photos: ListingPhoto[]];
  message: [message: string];
}>();

const managedPhotos = ref<ListingPhoto[]>([]);
const uploading = ref(false);
const deletingId = ref<string | null>(null);
const reordering = ref(false);
const draggedIndex = ref<number | null>(null);
const inputKey = ref(0);
const altText = ref('');

watch(
  () => props.photos,
  (value) => {
    managedPhotos.value = [...value].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  },
  { immediate: true, deep: true },
);

const remainingSlots = computed(() => MAX_PHOTOS - managedPhotos.value.length);

function headers() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

function sortPhotos(value: ListingPhoto[]) {
  return value.map((photo, position) => ({ ...photo, position, is_main: position === 0 }));
}

function publishPhotos(value: ListingPhoto[]) {
  const sorted = sortPhotos(value);
  managedPhotos.value = sorted;
  emit('update:photos', sorted);
}

function errorMessage(reason: unknown, fallback: string) {
  const response = reason as {
    response?: { data?: { message?: string; errors?: Record<string, string[]> } };
  };
  const errors = response.response?.data?.errors;
  return errors
    ? Object.values(errors).flat()[0] || fallback
    : (response.response?.data?.message ?? fallback);
}

async function upload(event: globalThis.Event) {
  const input = event.target as globalThis.HTMLInputElement;
  const files = Array.from(input.files ?? []);
  input.value = '';
  inputKey.value += 1;

  if (!files.length) return;
  if (files.length > remainingSlots.value) {
    emit('message', `Vous pouvez encore ajouter ${remainingSlots.value} photo(s) maximum.`);
    return;
  }

  const invalid = files.find((file) => !ACCEPTED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE);
  if (invalid) {
    emit('message', 'Chaque photo doit être au format JPG, PNG ou WEBP et peser 10 Mo maximum.');
    return;
  }

  const formData = new globalThis.FormData();
  files.forEach((file) => formData.append('photos[]', file));
  if (altText.value.trim()) formData.append('alt', altText.value.trim());

  uploading.value = true;
  try {
    const response = await api.post(`/listings/${props.listingUuid}/photos`, formData, {
      headers: headers(),
    });
    const uploaded = (response.data.data ?? []) as ListingPhoto[];
    publishPhotos([...managedPhotos.value, ...uploaded]);
    altText.value = '';
    emit('message', `${uploaded.length} photo(s) ajoutée(s).`);
  } catch (reason: unknown) {
    emit('message', errorMessage(reason, 'Les photos n’ont pas pu être ajoutées.'));
  } finally {
    uploading.value = false;
  }
}

async function remove(photo: ListingPhoto) {
  if (!window.confirm('Supprimer cette photo ?')) return;
  deletingId.value = photo.id;
  try {
    await api.delete(`/listings/${props.listingUuid}/photos/${photo.id}`, { headers: headers() });
    publishPhotos(managedPhotos.value.filter((item) => item.id !== photo.id));
    emit('message', 'Photo supprimée.');
  } catch (reason: unknown) {
    emit('message', errorMessage(reason, 'La photo n’a pas pu être supprimée.'));
  } finally {
    deletingId.value = null;
  }
}

function movePhoto(from: number, to: number) {
  if (to < 0 || to >= managedPhotos.value.length || from === to || reordering.value) return;
  const next = [...managedPhotos.value];
  const [photo] = next.splice(from, 1);
  next.splice(to, 0, photo);
  void reorder(next);
}

async function reorder(next: ListingPhoto[]) {
  const previous = managedPhotos.value;
  publishPhotos(next);
  reordering.value = true;
  try {
    const response = await api.patch(
      `/listings/${props.listingUuid}/photos/reorder`,
      { photo_ids: managedPhotos.value.map((photo) => photo.id) },
      { headers: headers() },
    );
    publishPhotos((response.data.data ?? managedPhotos.value) as ListingPhoto[]);
  } catch (reason: unknown) {
    publishPhotos(previous);
    emit('message', errorMessage(reason, 'L’ordre des photos n’a pas pu être enregistré.'));
  } finally {
    reordering.value = false;
  }
}

function startDrag(index: number) {
  draggedIndex.value = index;
}

function drop(index: number) {
  if (draggedIndex.value === null || draggedIndex.value === index) return;
  movePhoto(draggedIndex.value, index);
  draggedIndex.value = null;
}
</script>

<template>
  <section class="soft-card space-y-5 p-6" aria-labelledby="photos-title">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="eyebrow">Galerie</p>
        <h2 id="photos-title" class="mt-2 text-2xl font-light">Vos photos</h2>
        <p class="mt-2 text-sm text-stone-500">
          La première photo sera affichée comme photo principale. {{ photos.length }}/{{
            MAX_PHOTOS
          }}
          photos.
        </p>
      </div>
      <span class="rounded-full bg-dusty/10 px-3 py-1 text-xs font-medium text-dusty-dark">
        {{ remainingSlots }} place(s) restante(s)
      </span>
    </div>

    <div v-if="managedPhotos.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      <article
        v-for="(photo, index) in managedPhotos"
        :key="photo.id"
        draggable="true"
        class="group relative aspect-[3/4] overflow-hidden rounded-xl border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800"
        :class="{ 'opacity-50': draggedIndex === index }"
        @dragstart="startDrag(index)"
        @dragover.prevent
        @drop.prevent="drop(index)"
        @dragend="draggedIndex = null"
      >
        <img
          :src="photo.url"
          :alt="photo.alt || `Photo ${index + 1}`"
          class="h-full w-full object-cover"
        />
        <div class="absolute inset-x-0 top-0 flex items-center justify-between gap-1 p-2">
          <span
            v-if="index === 0"
            class="rounded-full bg-stone-950/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
          >
            Principale
          </span>
          <span v-else class="rounded-full bg-stone-950/65 px-2 py-1 text-[10px] text-white">
            {{ index + 1 }}
          </span>
          <button
            type="button"
            class="rounded-full bg-stone-950/75 px-2 py-1 text-xs text-white opacity-100 transition hover:bg-red-700 sm:opacity-0 sm:group-hover:opacity-100"
            :disabled="deletingId === photo.id"
            :aria-label="`Supprimer la photo ${index + 1}`"
            @click="remove(photo)"
          >
            {{ deletingId === photo.id ? '…' : 'Supprimer' }}
          </button>
        </div>
        <div
          class="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-stone-950/75 to-transparent p-2 pt-8"
        >
          <button
            type="button"
            class="rounded-full bg-white/90 px-2 py-1 text-xs text-stone-900 disabled:opacity-40"
            :disabled="index === 0 || reordering"
            :aria-label="`Déplacer la photo ${index + 1} vers la gauche`"
            @click="movePhoto(index, index - 1)"
          >
            ←
          </button>
          <span class="cursor-grab text-xs text-white" title="Glisser pour réordonner">↔</span>
          <button
            type="button"
            class="rounded-full bg-white/90 px-2 py-1 text-xs text-stone-900 disabled:opacity-40"
            :disabled="index === managedPhotos.length - 1 || reordering"
            :aria-label="`Déplacer la photo ${index + 1} vers la droite`"
            @click="movePhoto(index, index + 1)"
          >
            →
          </button>
        </div>
      </article>
    </div>

    <div
      v-else
      class="rounded-xl border border-dashed border-dusty/50 bg-dusty/10 p-5 text-sm text-stone-600 dark:text-stone-300"
    >
      Ajoutez au moins une photo pour présenter votre annonce.
    </div>

    <div class="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
      <label class="block text-sm font-medium">
        Texte alternatif (facultatif)
        <input
          v-model="altText"
          type="text"
          maxlength="255"
          placeholder="Décrivez brièvement la photo"
          class="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3 dark:border-stone-700 dark:bg-stone-900"
        />
      </label>
      <label
        class="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-dusty px-5 text-sm font-medium text-white transition hover:bg-dusty-dark has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
      >
        <span>{{ uploading ? 'Ajout…' : 'Ajouter des photos' }}</span>
        <input
          :key="inputKey"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          class="sr-only"
          :disabled="uploading || remainingSlots === 0"
          @change="upload"
        />
      </label>
    </div>
    <p class="text-xs text-stone-500">
      JPG, PNG ou WEBP · 10 Mo maximum par fichier · 10 photos maximum.
    </p>
  </section>
</template>
