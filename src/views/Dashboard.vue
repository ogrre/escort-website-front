<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { api } from '../lib/api';
import ListingPhotoManager, { type ListingPhoto } from '../components/ListingPhotoManager.vue';
import { useCopy } from '../lib/i18n';

const { locale } = useCopy({ fr: 'fr', en: 'en' });
const english = computed(() => locale.value === 'en');
const copy = computed(() =>
  english.value
    ? {
        eyebrow: 'Advertiser space',
        title: 'Create your profile',
        intro:
          'Complete your profile, activate the weekly plan, then verify your age before publishing.',
        subscription: 'Weekly subscription',
        publishWeek: 'Publish for one week',
        active: 'Weekly plan active',
        choose: 'Choose weekly plan',
        ageTitle: 'Age confirmation required',
        ageText: 'I confirm that I am 18 or older and authorised to publish this type of content.',
        ageStart: 'Start age verification',
        details: 'Profile details',
        about: 'Tell visitors about your profile',
        display: 'Display name',
        description: 'Description',
        city: 'City',
        location: 'Publishing city',
        country: 'Country code',
        age: 'Age',
        services: 'Services',
        status: 'Visible status',
        save: 'Save profile',
        create: 'Create profile',
        publish: 'Publish listing',
        placeholders: {
          name: 'Your name or professional name',
          description: 'Introduce yourself and your availability...',
          services: 'Dinner, companionship...',
          status: 'Available tonight',
        },
      }
    : {
        eyebrow: 'Espace annonceur',
        title: 'Créez votre profil',
        intro:
          'Complétez votre profil, activez le forfait hebdomadaire, puis vérifiez votre âge avant de publier.',
        subscription: 'Abonnement hebdomadaire',
        publishWeek: 'Publier pendant une semaine',
        active: 'Forfait hebdomadaire actif',
        choose: 'Choisir le forfait hebdomadaire',
        ageTitle: 'Confirmation d’âge obligatoire',
        ageText:
          'Je confirme avoir 18 ans ou plus et être autorisé(e) à publier ce type de contenu.',
        ageStart: 'Démarrer la vérification d’âge',
        details: 'Détails du profil',
        about: 'Présentez votre profil aux visiteurs',
        display: 'Nom affiché',
        description: 'Description',
        city: 'Ville',
        location: 'Ville de publication',
        country: 'Code pays',
        age: 'Âge',
        services: 'Services',
        status: 'Statut visible',
        save: 'Enregistrer le profil',
        create: 'Créer le profil',
        publish: 'Publier l’annonce',
        placeholders: {
          name: 'Votre nom ou nom professionnel',
          description: 'Présentez-vous et indiquez vos disponibilités…',
          services: 'Dîner, accompagnement…',
          status: 'Disponible ce soir',
        },
      },
);

const message = ref('');
const ageConfirmed = ref(
  Boolean(
    (JSON.parse(localStorage.getItem('user') || '{}') as { age_confirmed?: boolean }).age_confirmed,
  ),
);
const confirmingAge = ref(false);
const listingId = ref<string | null>(null);
const photos = ref<ListingPhoto[]>([]);
const locations = ref<Array<{ id: string; name: string; country?: string }>>([]);
const subscription = ref<{ plan?: string; status?: string; ends_at?: string } | null>(null);
const subscribing = ref(false);
const form = reactive({
  name: '',
  description: '',
  age: 18,
  city: '',
  location_id: '',
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

function contactLabel(type: string) {
  if (english.value)
    return (
      {
        phone: 'Phone',
        whatsapp: 'WhatsApp',
        snapchat: 'Snapchat',
        telegram: 'Telegram',
        instagram: 'Instagram',
        other: 'Other',
      }[type] ?? type
    );
  return labels[type] ?? type;
}

function headers() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}
async function save() {
  if (!form.location_id) {
    message.value = english.value
      ? 'Choose a publishing city before saving your profile.'
      : 'Choisissez une ville de publication avant d’enregistrer votre profil.';
    return;
  }
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
    const [locationsResponse, listingsResponse] = await Promise.all([
      api.get('/locations', { params: { is_major: 1 }, headers: headers() }),
      api.get('/my/listings', { headers: headers() }),
    ]);
    locations.value = (locationsResponse.data.data ?? []).map(
      (location: {
        id: string;
        name?: string;
        city?: string;
        country?: { name?: string } | string;
      }) => ({
        id: location.id,
        name: location.name ?? location.city ?? '',
        country: typeof location.country === 'string' ? location.country : location.country?.name,
      }),
    );
    const data = listingsResponse.data.data?.[0];
    try {
      subscription.value = (await api.get('/subscription', { headers: headers() })).data.data;
    } catch {
      subscription.value = null;
    }
    if (data) {
      listingId.value = data.id;
      Object.assign(form, data);
      form.location_id = data.location?.id ?? data.location_id ?? '';
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
    <p class="eyebrow">{{ copy.eyebrow }}</p>
    <h1 class="mt-3 text-4xl font-light md:text-5xl">{{ copy.title }}</h1>
    <p class="mt-4 max-w-2xl text-stone-600">
      {{ copy.intro }}
    </p>
    <p v-if="message" class="mt-4 text-dusty-dark">{{ message }}</p>
    <div
      class="soft-card mt-8 flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p class="eyebrow">{{ copy.subscription }}</p>
        <h2 class="mt-2 text-xl font-medium">{{ copy.publishWeek }}</h2>
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
        {{ subscribing ? 'Opening…' : copy.choose }}
      </button>
      <span
        v-else
        class="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800"
        >{{ copy.active }}</span
      >
    </div>
    <div v-if="!ageConfirmed" class="mt-8 rounded-2xl border border-dusty/30 bg-dusty/10 p-5">
      <h2 class="font-medium">{{ copy.ageTitle }}</h2>
      <p class="mt-2 text-sm text-zinc-700">
        {{ copy.ageText }}
      </p>
      <button
        :disabled="confirmingAge"
        class="mt-4 rounded-full bg-dusty px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
        @click="startAgeVerification"
      >
        {{ confirmingAge ? (english ? 'Opening…' : 'Ouverture…') : copy.ageStart }}
      </button>
    </div>
    <form class="mt-10 space-y-6" @submit.prevent="save">
      <div class="soft-card space-y-5 p-6">
        <div>
          <p class="eyebrow">{{ copy.details }}</p>
          <h2 class="mt-2 text-2xl font-light">{{ copy.about }}</h2>
        </div>
        <label class="block text-sm font-medium"
          >{{ copy.display }}
          <input
            v-model="form.name"
            required
            maxlength="120"
            class="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3"
            :placeholder="copy.placeholders.name"
          />
        </label>
        <label class="block text-sm font-medium"
          >{{ copy.description }}
          <textarea
            v-model="form.description"
            required
            minlength="80"
            maxlength="5000"
            class="mt-2 min-h-36 w-full rounded-xl border border-zinc-300 bg-white p-3"
            :placeholder="copy.placeholders.description"
          ></textarea>
        </label>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="block text-sm font-medium"
            >{{ copy.location }}
            <select
              v-model="form.location_id"
              required
              class="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3"
            >
              <option value="">{{ english ? 'Choose a city' : 'Choisir une ville' }}</option>
              <option v-for="location in locations" :key="location.id" :value="location.id">
                {{ location.name }}{{ location.country ? ` · ${location.country}` : '' }}
              </option>
            </select>
          </label>
          <label class="block text-sm font-medium"
            >{{ copy.age }}
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
          >{{ copy.services }}
          <input
            v-model="form.services[0]"
            required
            class="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3"
            :placeholder="copy.placeholders.services"
          />
        </label>
      </div>
      <label class="block"
        >{{ copy.status
        }}<input
          v-model="form.status_text"
          maxlength="80"
          :placeholder="copy.placeholders.status"
          class="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3"
      /></label>
      <div class="grid gap-4 md:grid-cols-2">
        <label
          v-for="type in contactTypes"
          :key="type"
          class="rounded-xl border border-zinc-200 bg-white p-4"
          ><span class="flex items-center justify-between font-medium"
            >{{ contactLabel(type)
            }}<input
              v-model="form.contacts[type].enabled"
              type="checkbox"
              class="h-5 w-5 accent-dusty" /></span
          ><input
            v-model="form.contacts[type].value"
            :disabled="!form.contacts[type].enabled"
            :placeholder="contactLabel(type)"
            class="mt-3 w-full rounded-lg border border-zinc-300 p-2 disabled:bg-zinc-100"
        /></label>
      </div>
      <button class="rounded-full bg-dusty px-6 py-3 font-medium text-white">
        {{ listingId ? copy.save : copy.create }}
      </button>
      <button
        type="button"
        :disabled="!ageConfirmed"
        class="ml-3 rounded-full border border-dusty px-6 py-3 font-medium text-dusty-dark disabled:cursor-not-allowed disabled:opacity-40"
        @click="publish"
      >
        {{ copy.publish }}
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
