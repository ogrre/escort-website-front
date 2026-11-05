<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { api } from '../lib/api';

const props = defineProps<{ mode: 'register' | 'login' }>();
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const error = ref('');
const notice = ref(
  props.mode === 'login' && route.query.registered
    ? 'Compte créé. Vérifiez votre e-mail, puis connectez-vous.'
    : '',
);
const errors = ref<Record<string, string[]>>({});
const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'visitor',
});

const isRegister = computed(() => props.mode === 'register');
const title = computed(() => (isRegister.value ? 'Créer votre compte' : 'Se connecter'));

function messageFor(field: string) {
  return errors.value[field]?.[0] ?? '';
}

function apiErrorMessage(value: unknown) {
  if (axios.isAxiosError(value)) {
    const data = value.response?.data as
      { message?: string; errors?: Record<string, string[]> } | undefined;
    errors.value = data?.errors ?? {};
    return data?.message ?? 'Impossible de traiter la demande.';
  }
  return 'Une erreur inattendue est survenue.';
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
      <p class="v2-eyebrow">Espace privé</p>
      <h1>{{ title }}</h1>
      <p class="v2-lead">
        Enregistrez vos préférences et profitez d’une expérience discrète et personnalisée.
      </p>
    </div>

    <section class="v2-search-panel">
      <form class="space-y-5" @submit.prevent="submit">
        <p v-if="notice" class="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
          {{ notice }}
        </p>
        <label v-if="isRegister" class="block text-sm font-medium">
          Nom ou pseudonyme
          <input
            v-model="form.name"
            required
            maxlength="120"
            class="mt-2 w-full rounded-xl border border-zinc-300 p-3"
            autocomplete="name"
          />
          <span v-if="messageFor('name')" class="mt-1 block text-xs text-red-600">{{
            messageFor('name')
          }}</span>
        </label>

        <label class="block text-sm font-medium">
          Adresse e-mail
          <input
            v-model="form.email"
            required
            type="email"
            class="mt-2 w-full rounded-xl border border-zinc-300 p-3"
            autocomplete="email"
          />
          <span v-if="messageFor('email')" class="mt-1 block text-xs text-red-600">{{
            messageFor('email')
          }}</span>
        </label>

        <label v-if="isRegister" class="block text-sm font-medium">
          Je souhaite créer un compte
          <select
            v-model="form.role"
            class="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3"
          >
            <option value="visitor">Visiteur</option>
            <option value="advertiser">Annonceur / modèle</option>
          </select>
        </label>

        <label class="block text-sm font-medium">
          Mot de passe
          <input
            v-model="form.password"
            required
            type="password"
            minlength="8"
            class="mt-2 w-full rounded-xl border border-zinc-300 p-3"
            :autocomplete="isRegister ? 'new-password' : 'current-password'"
          />
          <span v-if="messageFor('password')" class="mt-1 block text-xs text-red-600">{{
            messageFor('password')
          }}</span>
        </label>

        <label v-if="isRegister" class="block text-sm font-medium">
          Confirmer le mot de passe
          <input
            v-model="form.password_confirmation"
            required
            type="password"
            minlength="8"
            class="mt-2 w-full rounded-xl border border-zinc-300 p-3"
            autocomplete="new-password"
          />
          <span
            v-if="messageFor('password_confirmation')"
            class="mt-1 block text-xs text-red-600"
            >{{ messageFor('password_confirmation') }}</span
          >
        </label>

        <p v-if="error" class="rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>
        <button type="submit" :disabled="loading" class="v2-button primary wide">
          {{ loading ? 'Chargement…' : isRegister ? 'Créer mon compte' : 'Se connecter' }}
        </button>
      </form>
    </section>
  </main>
</template>
