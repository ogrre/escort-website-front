<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { api } from '../lib/api';
import { getAuthNotice } from '../lib/auth-feedback';
import { useCopy } from '../lib/i18n';

const props = defineProps<{ mode: 'register' | 'login' }>();
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const error = ref('');
const errors = ref<Record<string, string[]>>({});
const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: route.query.role === 'advertiser' ? 'advertiser' : 'visitor',
});

const isRegister = computed(() => props.mode === 'register');
const isAdvertiser = computed(() => form.role === 'advertiser');
const { locale } = useCopy({ fr: 'fr', en: 'en' });
const english = computed(() => locale.value === 'en');
const notice = computed(() =>
  props.mode === 'login'
    ? getAuthNotice(
        {
          registered: Boolean(route.query.registered),
          verified: Boolean(route.query.verified),
        },
        locale.value,
      )
    : '',
);
const title = computed(() => {
  if (!isRegister.value) return english.value ? 'Log in' : 'Se connecter';
  return isAdvertiser.value
    ? english.value
      ? 'Create your advertiser account'
      : 'Créer votre compte annonceur'
    : english.value
      ? 'Create your visitor account'
      : 'Créer votre compte visiteur';
});

function messageFor(field: string) {
  return errors.value[field]?.[0] ?? '';
}

function apiErrorMessage(value: unknown) {
  if (axios.isAxiosError(value)) {
    const data = value.response?.data as
      { message?: string; errors?: Record<string, string[]> } | undefined;
    errors.value = data?.errors ?? {};
    return (
      data?.message ??
      (english.value ? 'The request could not be completed.' : 'Impossible de traiter la demande.')
    );
  }
  return english.value ? 'An unexpected error occurred.' : 'Une erreur inattendue est survenue.';
}

async function submit() {
  loading.value = true;
  error.value = '';
  errors.value = {};
  try {
    const endpoint = isRegister.value ? '/auth/register' : '/auth/login';
    const payload = isRegister.value ? { ...form } : { email: form.email, password: form.password };
    const response = await api.post(endpoint, payload);
    if (isRegister.value) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      await router.push('/login?registered=1');
      return;
    }
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    await router.push(response.data.user.role === 'advertiser' ? '/dashboard' : '/');
  } catch (reason: unknown) {
    error.value = apiErrorMessage(reason);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="v2-wrap v2-auth-page">
    <div>
      <p class="v2-eyebrow">{{ english ? 'Private space' : 'Espace privé' }}</p>
      <h1>{{ title }}</h1>
      <p class="v2-lead">
        {{
          english
            ? 'Save your preferences and enjoy a discreet, personalised experience.'
            : 'Enregistrez vos préférences et profitez d’une expérience discrète et personnalisée.'
        }}
      </p>
    </div>

    <section class="v2-search-panel">
      <form class="space-y-5" @submit.prevent="submit">
        <p v-if="notice" class="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
          {{ notice }}
        </p>
        <label v-if="isRegister" class="block text-sm font-medium">
          {{ english ? 'Name or username' : 'Nom ou pseudonyme' }}
          <input
            v-model="form.name"
            required
            maxlength="120"
            class="mt-2 w-full rounded-xl border border-zinc-300 p-3"
            autocomplete="name"
            :placeholder="english ? 'Your name or username' : 'Votre nom ou pseudonyme'"
          />
          <span v-if="messageFor('name')" class="mt-1 block text-xs text-red-600">{{
            messageFor('name')
          }}</span>
        </label>

        <label class="block text-sm font-medium">
          {{ english ? 'Email address' : 'Adresse e-mail' }}
          <input
            v-model="form.email"
            required
            type="email"
            class="mt-2 w-full rounded-xl border border-zinc-300 p-3"
            autocomplete="email"
            :placeholder="english ? 'you@example.com' : 'vous@exemple.fr'"
          />
          <span v-if="messageFor('email')" class="mt-1 block text-xs text-red-600">{{
            messageFor('email')
          }}</span>
        </label>

        <p v-if="isRegister" class="v2-role-summary">
          {{
            isAdvertiser
              ? english
                ? 'Advertiser account · profile publishing'
                : 'Compte annonceur · publication de profils'
              : english
                ? 'Visitor account · favourites, search and messages'
                : 'Compte visiteur · favoris, recherche et échanges'
          }}
          <RouterLink to="/register">Changer de type de compte</RouterLink>
        </p>

        <label class="block text-sm font-medium">
          {{ english ? 'Password' : 'Mot de passe' }}
          <input
            v-model="form.password"
            required
            type="password"
            minlength="8"
            class="mt-2 w-full rounded-xl border border-zinc-300 p-3"
            :autocomplete="isRegister ? 'new-password' : 'current-password'"
            placeholder="••••••••"
          />
          <span v-if="messageFor('password')" class="mt-1 block text-xs text-red-600">{{
            messageFor('password')
          }}</span>
        </label>

        <label v-if="isRegister" class="block text-sm font-medium">
          {{ english ? 'Confirm password' : 'Confirmer le mot de passe' }}
          <input
            v-model="form.password_confirmation"
            required
            type="password"
            minlength="8"
            class="mt-2 w-full rounded-xl border border-zinc-300 p-3"
            autocomplete="new-password"
            placeholder="••••••••"
          />
          <span
            v-if="messageFor('password_confirmation')"
            class="mt-1 block text-xs text-red-600"
            >{{ messageFor('password_confirmation') }}</span
          >
        </label>

        <p v-if="error" class="rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>
        <button type="submit" :disabled="loading" class="v2-button primary wide">
          {{
            loading
              ? english
                ? 'Loading…'
                : 'Chargement…'
              : isRegister
                ? isAdvertiser
                  ? english
                    ? 'Register as advertiser'
                    : 'S’inscrire comme annonceur'
                  : english
                    ? 'Register as member'
                    : 'S’inscrire comme membre'
                : english
                  ? 'Log in'
                  : 'Se connecter'
          }}
        </button>
      </form>
    </section>
  </main>
</template>
