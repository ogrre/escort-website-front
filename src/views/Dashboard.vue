<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { api } from '../lib/api';
import ListingPhotoManager, { type ListingPhoto } from '../components/ListingPhotoManager.vue';

const message = ref('');
const ageConfirmed = ref(
  Boolean(
    (JSON.parse(localStorage.getItem('user') || '{}') as { age_confirmed?: boolean }).age_confirmed,
  ),
);
const confirmingAge = ref(false);
const listingId = ref<string | null>(null);
const photos = ref<ListingPhoto[]>([]);
const subscription = ref<{ plan?: string; status?: string; ends_at?: string } | null>(null);
const subscribing = ref(false);
const form = reactive({
  name: '',
  description: '',
  age: 18,
  city: '',
  country: 'FR',
  services: [] as string[],
  status_text: '',
  contacts: {} as Record<string, { enabled: boolean; value: string }>,
});
const contactTypes = ['phone', 'whatsapp', 'snapchat', 'telegram', 'instagram', 'other'];
const labels: Record<string, string> = {
  phone: 'Téléphone',
  whatsapp: 'WhatsApp',
  snapchat: 'Snapchat',
  telegram: 'Telegram',
  instagram: 'Instagram',
  other: 'Autre',
};

function headers() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}
async function save() {
  if (listingId.value) {
    await api.put(`/listings/${listingId.value}`, { ...form }, { headers: headers() });
    message.value = 'Profile updated.';
  } else {
    const response = await api.post('/listings', { ...form }, { headers: headers() });
    listingId.value = response.data.data.id;
    photos.value = (response.data.data.photos ?? []) as ListingPhoto[];
    message.value = 'Profile created as a draft.';
  }
}
async function startWeeklySubscription() {
  subscribing.value = true;
  try {
    const response = await api.post('/subscription/weekly', {}, { headers: headers() });
    subscription.value = response.data.data;
    if (response.data.checkout_url) window.location.href = response.data.checkout_url;
    else message.value = 'Weekly subscription activated for local development.';
  } catch (reason: unknown) {
    const response = reason as { response?: { data?: { message?: string } } };
    message.value = response.response?.data?.message ?? 'Subscription could not be started.';
  } finally {
    subscribing.value = false;
  }
}
async function startAgeVerification() {
  confirmingAge.value = true;
  try {
    const response = await api.post(
      '/auth/age-verification/start',
      { return_url: `${window.location.origin}/dashboard` },
      { headers: headers() },
    );
    window.open(response.data.verification_url, '_blank', 'noopener,noreferrer');
    message.value = 'Vérification ouverte dans un nouvel onglet. Revenez ici une fois terminée.';
  } catch {
    message.value = 'La confirmation d’âge n’a pas pu être enregistrée.';
  } finally {
    confirmingAge.value = false;
  }
}
async function publish() {
  if (!listingId.value) return;
  try {
    await api.post(`/listings/${listingId.value}/publish`, {}, { headers: headers() });
    message.value = 'Annonce publiée.';
  } catch (reason: unknown) {
    const response = reason as { response?: { data?: { message?: string } } };
    message.value = response.response?.data?.message ?? 'Publication impossible.';
  }
}
onMounted(async () => {
  try {
    const userResponse = await api.get('/auth/me', { headers: headers() });
    ageConfirmed.value = Boolean(userResponse.data.age_confirmed);
    localStorage.setItem('user', JSON.stringify(userResponse.data));
    const data = (await api.get('/my/listings', { headers: headers() })).data.data[0];
    subscription.value = (await api.get('/subscription', { headers: headers() })).data.data;
    if (data) {
      listingId.value = data.id;
      Object.assign(form, data);
      photos.value = (data.photos ?? []) as ListingPhoto[];
    }

    for (const type of contactTypes) form.contacts[type] ??= { enabled: false, value: '' };
  } catch {
    message.value = 'Connectez-vous pour gérer vos annonces.';
  }
});
</script>

<template>
  <section class="dashboard-page mx-auto max-w-4xl px-6 py-14">
    <p class="eyebrow">Advertiser space</p>
    <h1 class="mt-3 text-4xl font-light md:text-5xl">Create your profile</h1>
    <p class="mt-4 max-w-2xl text-stone-600">
      Complete your profile, activate the weekly plan, then verify your age before publishing.
    </p>
    <p v-if="message" class="mt-4 text-dusty-dark">{{ message }}</p>
    <div
      class="soft-card mt-8 flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p class="eyebrow">Weekly subscription</p>
        <h2 class="mt-2 text-xl font-medium">Publish for one week</h2>
        <p class="mt-1 text-sm text-stone-500">
          Your profile remains active for 7 days after payment.
        </p>
      </div>
      <button
        v-if="subscription?.status !== 'active'"
        :disabled="subscribing"
        class="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
        @click="startWeeklySubscription"
      >
        {{ subscribing ? 'Opening…' : 'Choose weekly plan' }}
      </button>
      <span v-else class="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800"
        >Weekly plan active</span
      >
    </div>
    <div v-if="!ageConfirmed" class="mt-8 rounded-2xl border border-dusty/30 bg-dusty/10 p-5">
      <h2 class="font-medium">Confirmation d’âge obligatoire</h2>
      <p class="mt-2 text-sm text-zinc-700">
        Je confirme avoir 18 ans ou plus et être autorisé(e) à publier ce type de contenu.
      </p>
      <button
        :disabled="confirmingAge"
        class="mt-4 rounded-full bg-dusty px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
        @click="startAgeVerification"
      >
        {{ confirmingAge ? 'Ouverture…' : 'Start age verification' }}
      </button>
    </div>
    <form class="mt-10 space-y-6" @submit.prevent="save">
      <div class="soft-card space-y-5 p-6">
        <div>
          <p class="eyebrow">Profile details</p>
          <h2 class="mt-2 text-2xl font-light">Tell visitors about your profile</h2>
        </div>
        <label class="block text-sm font-medium"
          >Display name
          <input
            v-model="form.name"
            required
            maxlength="120"
            class="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3"
            placeholder="Your name or professional name"
          />
        </label>
        <label class="block text-sm font-medium"
          >Description
          <textarea
            v-model="form.description"
            required
            minlength="80"
            maxlength="5000"
            class="mt-2 min-h-36 w-full rounded-xl border border-zinc-300 bg-white p-3"
            placeholder="Introduce yourself and your availability..."
          ></textarea>
        </label>
        <div class="grid gap-4 md:grid-cols-3">
          <label class="block text-sm font-medium"
            >City
            <input
              v-model="form.city"
              required
              maxlength="100"
              class="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3"
              placeholder="Paris"
            />
          </label>
          <label class="block text-sm font-medium"
            >Country code
            <input
              v-model="form.country"
              required
              maxlength="2"
              class="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3 uppercase"
              placeholder="FR"
            />
          </label>
          <label class="block text-sm font-medium"
            >Age
            <input
              v-model.number="form.age"
              required
              type="number"
              min="18"
              max="80"
              class="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3"
            />
          </label>
        </div>
        <label class="block text-sm font-medium"
          >Services
          <input
            v-model="form.services[0]"
            required
            class="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3"
            placeholder="Dinner, companionship..."
          />
        </label>
      </div>
      <label class="block"
        >Statut visible<input
          v-model="form.status_text"
          maxlength="80"
          placeholder="Disponible ce soir"
          class="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3"
      /></label>
      <div class="grid gap-4 md:grid-cols-2">
        <label
          v-for="type in contactTypes"
          :key="type"
          class="rounded-xl border border-zinc-200 bg-white p-4"
          ><span class="flex items-center justify-between font-medium"
            >{{ labels[type]
            }}<input
              v-model="form.contacts[type].enabled"
              type="checkbox"
              class="h-5 w-5 accent-dusty" /></span
          ><input
            v-model="form.contacts[type].value"
            :disabled="!form.contacts[type].enabled"
            :placeholder="labels[type]"
            class="mt-3 w-full rounded-lg border border-zinc-300 p-2 disabled:bg-zinc-100"
        /></label>
      </div>
      <button class="rounded-full bg-dusty px-6 py-3 font-medium text-white">
        {{ listingId ? 'Save profile' : 'Create profile' }}
      </button>
      <button
        type="button"
        :disabled="!ageConfirmed"
        class="ml-3 rounded-full border border-dusty px-6 py-3 font-medium text-dusty-dark disabled:cursor-not-allowed disabled:opacity-40"
        @click="publish"
      >
        Publier l’annonce
      </button>
    </form>
    <ListingPhotoManager
      v-if="listingId"
      v-model:photos="photos"
      :listing-uuid="listingId"
      class="mt-8"
      @message="message = $event"
    />
  </section>
</template>
