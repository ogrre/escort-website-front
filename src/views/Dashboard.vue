<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { api } from '../lib/api';
import ListingPhotoManager, { type ListingPhoto } from '../components/ListingPhotoManager.vue';
import { useCopy } from '../lib/i18n';
import { normalizeLocations, type City } from '../lib/locations';

const { locale } = useCopy({ fr: 'fr', en: 'en' });
const english = computed(() => locale.value === 'en');
const copy = computed(() =>
  english.value
    ? {
        eyebrow: 'Advertiser space',
        title: 'Create your profile',
        intro:
          'Complete your profile. Payment and age verification are required when you publish.',
        subscription: 'Weekly subscription',
        publishWeek: 'Publish for one week',
        activeHint: 'Your profile remains active for 7 days after payment.',
        active: 'Weekly plan active',
        choose: 'Choose weekly plan',
        ageTitle: 'Age confirmation required',
        ageText: 'I confirm that I am 18 or older and authorised to publish this type of content.',
        ageStart: 'Start age verification',
        verifyBeforePublish: 'Verify your age before publishing',
        details: 'Profile details',
        about: 'Tell visitors about your profile',
        display: 'Display name',
        description: 'Description',
        city: 'City',
        country: 'Country code',
        age: 'Age',
        services: 'Services',
        status: 'Visible status',
        save: 'Save profile',
        create: 'Create profile',
        saving: 'Saving…',
        createDraftHint: 'Create the draft first, then add your photos below.',
        photosHint: 'Photos are added immediately. Reordering is saved automatically.',
        ageStarted: 'Age verification opened in a new tab. Return here when it is complete.',
        ageStartFailed: 'Age verification could not be started.',
        ageConfirmed: 'Age verified. You can now publish your listing.',
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
          'Complétez votre profil. Le paiement et la vérification d’âge sont demandés lors de la publication.',
        subscription: 'Abonnement hebdomadaire',
        publishWeek: 'Publier pendant une semaine',
        activeHint: 'Votre profil reste actif pendant 7 jours après le paiement.',
        active: 'Forfait hebdomadaire actif',
        choose: 'Choisir le forfait hebdomadaire',
        ageTitle: 'Confirmation d’âge obligatoire',
        ageText:
          'Je confirme avoir 18 ans ou plus et être autorisé(e) à publier ce type de contenu.',
        ageStart: 'Démarrer la vérification d’âge',
        verifyBeforePublish: 'Vérifier votre âge avant de publier',
        details: 'Détails du profil',
        about: 'Présentez votre profil aux visiteurs',
        display: 'Nom affiché',
        description: 'Description',
        city: 'Ville',
        country: 'Code pays',
        age: 'Âge',
        services: 'Services',
        status: 'Statut visible',
        save: 'Enregistrer le profil',
        create: 'Créer le profil',
        saving: 'Enregistrement…',
        createDraftHint: 'Créez d’abord le brouillon, puis ajoutez vos photos ci-dessous.',
        photosHint: 'Les photos sont ajoutées immédiatement. Leur ordre est enregistré automatiquement.',
        ageStarted: 'La vérification d’âge est ouverte dans un nouvel onglet. Revenez ici une fois terminée.',
        ageStartFailed: 'La vérification d’âge n’a pas pu démarrer.',
        ageConfirmed: 'Âge vérifié. Vous pouvez maintenant publier votre annonce.',
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
const saving = ref(false);
const listingId = ref<string | null>(null);
const photos = ref<ListingPhoto[]>([]);
const locations = ref<City[]>([]);
const locationId = ref('');
const subscription = ref<{ plan?: string; status?: string; ends_at?: string } | null>(null);
const subscribing = ref(false);
const contactTypes = ['phone', 'whatsapp', 'snapchat', 'telegram', 'instagram', 'other'];
const form = reactive({
  name: '',
  description: '',
  age: 18,
  city: '',
  country: 'FR',
  services: [] as string[],
  status_text: '',
  contacts: Object.fromEntries(
    contactTypes.map((type) => [type, { enabled: false, value: '' }]),
  ) as Record<string, { enabled: boolean; value: string }>,
});
const labels: Record<string, string> = {
  phone: 'Téléphone',
  whatsapp: 'WhatsApp',
  snapchat: 'Snapchat',
  telegram: 'Telegram',
  instagram: 'Instagram',
  other: 'Autre',
};

function normalizeContacts(value: unknown): Record<string, { enabled: boolean; value: string }> {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

  return Object.fromEntries(
    contactTypes.map((type) => {
      const contact = source[type];
      const record = contact && typeof contact === 'object'
        ? (contact as Record<string, unknown>)
        : {};

      return [
        type,
        {
          enabled: Boolean(record.enabled),
          value: typeof record.value === 'string' ? record.value : '',
        },
      ];
    }),
  );
}

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
function syncLocation() {
  const location = locations.value.find((item) => item.id === locationId.value);
  if (!location) return;
  form.city = location.name;
  form.country = location.country.code;
}
function saveError(reason: unknown) {
  const response = reason as {
    response?: { data?: { message?: string; errors?: Record<string, string[]> } };
  };
  const errors = Object.values(response.response?.data?.errors ?? {}).flat();
  return errors.join(' ') || response.response?.data?.message || 'Impossible d’enregistrer le profil.';
}
function validateForm() {
  if (!form.name.trim()) return english.value ? 'Enter a display name.' : 'Indiquez un nom affiché.';
  if (form.description.trim().length < 80) {
    return english.value
      ? 'The description must contain at least 80 characters.'
      : 'La description doit contenir au moins 80 caractères.';
  }
  if (!locationId.value) return english.value ? 'Choose a city.' : 'Choisissez une ville.';
  if (!form.country.trim()) return english.value ? 'Enter a country code.' : 'Indiquez un code pays.';
  if (!Number.isInteger(form.age) || form.age < 18 || form.age > 80) {
    return english.value ? 'Enter an age between 18 and 80.' : 'Indiquez un âge entre 18 et 80 ans.';
  }
  if (!form.services.some((service) => service.trim())) {
    return english.value ? 'Enter at least one service.' : 'Indiquez au moins un service.';
  }
  return '';
}
async function save() {
  if (saving.value) return;
  message.value = '';
  const validationError = validateForm();
  if (validationError) {
    message.value = validationError;
    return;
  }
  saving.value = true;
  try {
    const payload = { ...form, location_id: locationId.value };
    if (listingId.value) {
      await api.put(`/listings/${listingId.value}`, payload, { headers: headers() });
      message.value = english.value ? 'Profile updated.' : 'Profil mis à jour.';
    } else {
      const response = await api.post('/listings', payload, { headers: headers() });
      listingId.value = response.data.data.id;
      photos.value = (response.data.data.photos ?? []) as ListingPhoto[];
      message.value = english.value ? 'Profile created as a draft.' : 'Profil créé en brouillon.';
    }
  } catch (reason: unknown) {
    message.value = saveError(reason);
  } finally {
    saving.value = false;
  }
}
async function startWeeklySubscription(): Promise<boolean> {
  subscribing.value = true;
  try {
    const response = await api.post('/subscription/weekly', {}, { headers: headers() });
    subscription.value = response.data.data;
    if (response.data.checkout_url) {
      window.location.href = response.data.checkout_url;
      return false;
    }
    message.value = english.value
      ? 'Weekly subscription activated.'
      : 'Forfait hebdomadaire activé.';
    return subscription.value?.status === 'active';
  } catch (reason: unknown) {
    const response = reason as { response?: { data?: { message?: string } } };
    message.value =
      response.response?.data?.message ??
      (english.value ? 'Subscription could not be started.' : 'Le paiement n’a pas pu être démarré.');
    return false;
  } finally {
    subscribing.value = false;
  }
}
async function startAgeVerification() {
  confirmingAge.value = true;
  const verificationWindow = window.open('', '_blank', 'noopener,noreferrer');
  try {
    const response = await api.post(
      '/auth/age-verification/start',
      { return_url: `${window.location.origin}/dashboard` },
      { headers: headers() },
    );
    const verificationUrl = response.data?.verification_url;
    if (typeof verificationUrl !== 'string' || !/^https:\/\//.test(verificationUrl)) {
      throw new Error('Missing Yoti verification URL');
    }
    if (verificationWindow && !verificationWindow.closed) {
      verificationWindow.location.replace(verificationUrl);
    } else {
      window.location.assign(verificationUrl);
    }
    message.value = copy.value.ageStarted;
  } catch (reason: unknown) {
    verificationWindow?.close();
    const response = reason as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
    const errors = Object.values(response.response?.data?.errors ?? {}).flat();
    message.value = errors.join(' ') || response.response?.data?.message || copy.value.ageStartFailed;
  } finally {
    confirmingAge.value = false;
  }
}
async function publish() {
  if (!listingId.value) return;
  if (subscription.value?.status !== 'active') {
    const paid = await startWeeklySubscription();
    if (!paid) return;
  }
  if (!ageConfirmed.value) {
    await startAgeVerification();
    return;
  }
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
    const locationsResponse = await api.get('/locations', { params: { per_page: 100, page: 1 } });
    locations.value = normalizeLocations(locationsResponse.data.data ?? [], true);
    const userResponse = await api.get('/auth/me', { headers: headers() });
    ageConfirmed.value = Boolean(userResponse.data.age_confirmed);
    localStorage.setItem('user', JSON.stringify(userResponse.data));
    if (new URLSearchParams(window.location.search).get('age_verification') === 'success') {
      message.value = copy.value.ageConfirmed;
    }
    const data = (await api.get('/my/listings', { headers: headers() })).data.data[0];
    subscription.value = (await api.get('/subscription', { headers: headers() })).data.data;
    if (data) {
      listingId.value = data.id;
      locationId.value = data.location?.id ?? '';
      Object.assign(form, data);
      form.contacts = normalizeContacts(data.contacts);
      syncLocation();
      photos.value = (data.photos ?? []) as ListingPhoto[];
    }

    form.contacts = normalizeContacts(form.contacts);
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
        <p class="mt-1 text-sm text-stone-500">{{ copy.activeHint }}</p>
      </div>
      <span
        v-if="subscription?.status === 'active'"
        class="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800"
        >{{ copy.active }}</span
      >
      <span
        v-if="subscription?.status !== 'active'"
        class="text-sm text-stone-500"
      >
        {{ english ? 'Payment is requested when you publish.' : 'Le paiement est demandé lors de la publication.' }}
      </span>
    </div>
    <form class="mt-10 space-y-6" novalidate @submit.prevent="save">
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
        <div class="grid gap-4 md:grid-cols-3">
          <label class="block text-sm font-medium"
            >{{ copy.city }}
            <select
              v-model="locationId"
              required
              class="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3"
              @change="syncLocation"
            >
              <option value="">Choisir une ville</option>
              <option v-for="location in locations" :key="location.id" :value="location.id">
                {{ location.name }} ({{ location.country.code }})
              </option>
            </select>
          </label>
          <label class="block text-sm font-medium"
            >{{ copy.country }}
            <input
              v-model="form.country"
              required
              maxlength="2"
              class="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3 uppercase"
              placeholder="FR"
            />
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
      <div v-if="!listingId" class="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          :disabled="saving"
          class="rounded-full bg-dusty px-6 py-3 font-medium text-white disabled:cursor-wait disabled:opacity-60"
        >
          {{ saving ? copy.saving : copy.create }}
        </button>
        <p class="text-sm text-stone-500">{{ copy.createDraftHint }}</p>
      </div>
    </form>
    <ListingPhotoManager
      v-if="listingId"
      v-model:photos="photos"
      :listing-uuid="listingId"
      class="mt-8"
      @message="message = $event"
    />
    <p v-if="listingId" class="mt-3 text-sm text-stone-500">{{ copy.photosHint }}</p>
    <div v-if="listingId" class="mt-6 flex flex-wrap gap-3">
      <button
        type="button"
        :disabled="saving"
        class="rounded-full bg-dusty px-6 py-3 font-medium text-white disabled:cursor-wait disabled:opacity-60"
        @click="save"
      >
        {{ saving ? copy.saving : copy.save }}
      </button>
      <button
        type="button"
        :disabled="confirmingAge || subscribing"
        class="rounded-full border border-dusty px-6 py-3 font-medium text-dusty-dark disabled:cursor-not-allowed disabled:opacity-40"
        @click="publish"
      >
        {{
          subscribing
            ? english
              ? 'Opening payment…'
              : 'Ouverture du paiement…'
            : confirmingAge
              ? english
                ? 'Opening verification…'
                : 'Ouverture de la vérification…'
              : subscription?.status !== 'active'
                ? english
                  ? 'Pay and publish'
                  : 'Payer et publier'
                : ageConfirmed
                  ? copy.publish
                  : copy.verifyBeforePublish
        }}
      </button>
    </div>
  </section>
</template>
