<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from './lib/api';
import { confirmAge, hasAgeConfirmation } from './lib/age-gate';
import { getInitialLocale, localeKey, localeNames, type Locale } from './lib/locale';

const router = useRouter();
const mobileMenuOpen = ref(false);
const ageConfirmed = ref(false);
const locale = ref<Locale>(getInitialLocale());
const isAuthenticated = computed(() => Boolean(localStorage.getItem('token')));
const copy = computed(() =>
  locale.value === 'fr'
    ? {
        post: 'Poster une annonce',
        login: 'Se connecter',
        logout: 'Se déconnecter',
        dashboard: 'Mon annonce',
        legal: 'Mentions légales',
        privacy: 'Confidentialité',
        cookies: 'Cookies',
        terms: 'CGU',
        ageEyebrow: 'Accès réservé aux adultes',
        ageTitle: 'Avez-vous 18 ans ou plus ?',
        ageText: 'Vous devez confirmer être majeur(e) avant d’accéder au site.',
        leave: 'Non, quitter le site',
        ageStorage:
          'Cette confirmation est mémorisée uniquement dans le stockage local de votre navigateur.',
      }
    : {
        post: 'Post an ad',
        login: 'Log in',
        logout: 'Log out',
        dashboard: 'My listing',
        legal: 'Legal notice',
        privacy: 'Privacy',
        cookies: 'Cookies',
        terms: 'Terms',
        ageEyebrow: 'Adults only',
        ageTitle: 'Are you 18 or older?',
        ageText: 'You must confirm that you are an adult before entering the site.',
        leave: 'No, leave the site',
        ageStorage: 'This confirmation is stored only in your browser’s local storage.',
      },
);
provide(localeKey, locale);
onMounted(() => {
  document.documentElement.lang = locale.value;
  ageConfirmed.value = hasAgeConfirmation(localStorage);
  document.documentElement.classList.remove('dark');
});
function changeLocale(nextLocale: Locale) {
  locale.value = nextLocale;
  localStorage.setItem('locale', nextLocale);
  document.documentElement.lang = nextLocale;
}
function acceptAge() {
  confirmAge(localStorage);
  ageConfirmed.value = true;
}
async function logout() {
  try {
    await api.post(
      '/auth/logout',
      {},
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    );
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    mobileMenuOpen.value = false;
    await router.push('/login');
  }
}
</script>

<template>
  <div class="app-shell v2-app-shell flex min-h-screen flex-col overflow-x-hidden">
    <header class="sticky top-0 z-40 v2-header">
      <nav class="v2-nav mx-auto flex w-full max-w-7xl items-center gap-4 px-5 py-4 lg:px-8">
        <RouterLink to="/" class="brand-mark" @click="mobileMenuOpen = false">ÉLÉGANCE</RouterLink>
        <div class="v2-header-actions" :class="{ open: mobileMenuOpen }">
          <RouterLink to="/search" class="v2-header-link" @click="mobileMenuOpen = false"
            >Annonces</RouterLink
          >
          <RouterLink
            v-if="isAuthenticated"
            to="/dashboard"
            class="v2-header-link"
            @click="mobileMenuOpen = false"
            >{{ copy.dashboard }}</RouterLink
          >
          <RouterLink v-else to="/login" class="v2-header-link" @click="mobileMenuOpen = false">{{
            copy.login
          }}</RouterLink>
          <RouterLink
            v-if="!isAuthenticated"
            to="/register"
            class="v2-header-button"
            @click="mobileMenuOpen = false"
            >{{ copy.post }}</RouterLink
          >
          <button v-else type="button" class="v2-header-link" @click="logout">
            {{ copy.logout }}
          </button>
          <div class="locale-switcher" aria-label="Language">
            <button
              v-for="option in ['fr', 'en'] as Locale[]"
              :key="option"
              type="button"
              class="locale-option"
              :class="{ 'locale-option-active': locale === option }"
              :aria-pressed="locale === option"
              @click="changeLocale(option)"
            >
              {{ localeNames[option] }}
            </button>
          </div>
        </div>
        <button
          type="button"
          class="v2-menu-toggle"
          aria-label="Menu"
          :aria-expanded="mobileMenuOpen"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <span></span><span></span>
        </button>
      </nav>
    </header>
    <div class="flex-1"><RouterView /></div>
    <div
      v-if="!ageConfirmed"
      class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <section class="max-w-lg rounded-3xl bg-white p-7 shadow-2xl md:p-10">
        <p class="eyebrow">{{ copy.ageEyebrow }}</p>
        <h1 id="age-gate-title" class="mt-3 text-3xl font-light">{{ copy.ageTitle }}</h1>
        <p class="mt-5 leading-7 text-stone-600">{{ copy.ageText }} {{ copy.ageStorage }}</p>
        <div class="mt-7 flex flex-col gap-3 sm:flex-row">
          <button type="button" class="button-primary" @click="acceptAge">
            Oui, j’ai 18 ans ou plus</button
          ><a href="https://www.google.com/" class="button-secondary">{{ copy.leave }}</a>
        </div>
        <nav
          class="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-500"
          aria-label="Legal information"
        >
          <RouterLink to="/mentions-legales">{{ copy.legal }}</RouterLink
          ><RouterLink to="/confidentialite">{{ copy.privacy }}</RouterLink
          ><RouterLink to="/cookies">{{ copy.cookies }}</RouterLink>
        </nav>
      </section>
    </div>
    <footer class="v2-footer">
      <nav
        class="mx-auto flex max-w-7xl flex-wrap gap-x-5 gap-y-2 px-6 py-6 text-xs"
        aria-label="Legal links"
      >
        <RouterLink to="/mentions-legales">{{ copy.legal }}</RouterLink
        ><RouterLink to="/confidentialite">{{ copy.privacy }}</RouterLink
        ><RouterLink to="/cookies">{{ copy.cookies }}</RouterLink
        ><RouterLink to="/cgu">{{ copy.terms }}</RouterLink>
      </nav>
    </footer>
  </div>
</template>
