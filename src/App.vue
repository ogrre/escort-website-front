<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from './lib/api';
import { confirmAge, hasAgeConfirmation } from './lib/age-gate';
import { getInitialLocale, localeKey, localeNames, type Locale } from './lib/locale';

const router = useRouter();
const mobileMenuOpen = ref(false);
const ageConfirmed = ref(false);
const darkMode = ref(false);
const locale = ref<Locale>(getInitialLocale());
const isAuthenticated = computed(() => Boolean(localStorage.getItem('token')));
const copy = computed(() =>
  locale.value === 'fr'
    ? {
        post: 'Poster une annonce',
        login: 'Se connecter',
        logout: 'Se déconnecter',
        dashboard: 'Tableau de bord',
        themeDark: 'Passer au mode sombre',
        themeLight: 'Passer au mode clair',
        ageEyebrow: 'Accès réservé aux adultes',
        ageTitle: 'Avez-vous 18 ans ou plus ?',
        ageText: 'Vous devez confirmer être majeur(e) avant d’accéder au site.',
        leave: 'Non, quitter le site',
        legal: 'Mentions légales',
        privacy: 'Confidentialité',
        cookies: 'Cookies',
        terms: 'CGU',
      }
    : {
        post: 'Post an ad',
        login: 'Log in',
        logout: 'Log out',
        dashboard: 'Dashboard',
        themeDark: 'Switch to dark mode',
        themeLight: 'Switch to light mode',
        ageEyebrow: 'Adults only',
        ageTitle: 'Are you 18 or older?',
        ageText: 'You must confirm that you are an adult before entering the site.',
        leave: 'No, leave the site',
        legal: 'Legal notice',
        privacy: 'Privacy',
        cookies: 'Cookies',
        terms: 'Terms',
      },
);
provide(localeKey, locale);

onMounted(() => {
  document.documentElement.lang = locale.value;
  ageConfirmed.value = hasAgeConfirmation(localStorage);
  darkMode.value = localStorage.getItem('theme') === 'dark';
  document.documentElement.classList.toggle('dark', darkMode.value);
});

function changeLocale(nextLocale: Locale) {
  locale.value = nextLocale;
  localStorage.setItem('locale', nextLocale);
  document.documentElement.lang = nextLocale;
}

function toggleTheme() {
  darkMode.value = !darkMode.value;
  localStorage.setItem('theme', darkMode.value ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', darkMode.value);
}

const themeLabel = computed(() => (darkMode.value ? copy.value.themeLight : copy.value.themeDark));

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
  <div
    class="app-shell v2-app-shell flex min-h-screen flex-col overflow-x-hidden transition-colors"
  >
    <header class="sticky top-0 z-40 v2-header backdrop-blur">
      <nav class="v2-nav mx-auto flex w-full max-w-7xl items-center gap-4 px-5 py-4 lg:px-8">
        <RouterLink to="/" class="brand-mark" @click="mobileMenuOpen = false">ÉCLAT</RouterLink>
        <button
          type="button"
          class="theme-toggle touch-target"
          :aria-label="themeLabel"
          :title="themeLabel"
          :aria-pressed="darkMode"
          @click="toggleTheme"
        >
          <svg v-if="darkMode" aria-hidden="true" viewBox="0 0 24 24" class="size-5">
            <path
              fill="currentColor"
              d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-14a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm0 18a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1ZM4 13H2a1 1 0 1 1 0-2h2a1 1 0 1 1 0 2Zm18 0h-2a1 1 0 1 1 0-2h2a1 1 0 1 1 0 2ZM5.64 6.64 4.22 5.22a1 1 0 1 1 1.42-1.42l1.41 1.42a1 1 0 0 1-1.41 1.42Zm13.14 13.14-1.42-1.42a1 1 0 1 1 1.42-1.42l1.41 1.42a1 1 0 0 1-1.41 1.42ZM18.36 6.64a1 1 0 0 1 0-1.42l1.42-1.42a1 1 0 0 1 1.41 1.42l-1.41 1.42a1 1 0 0 1-1.42 0ZM5.22 20.78a1 1 0 0 1 0-1.42l1.42-1.42a1 1 0 1 1 1.41 1.42l-1.41 1.42a1 1 0 0 1-1.42 0Z"
            />
          </svg>
          <svg v-else aria-hidden="true" viewBox="0 0 24 24" class="size-5">
            <path
              fill="currentColor"
              d="M20.74 15.24A8.5 8.5 0 0 1 8.76 3.26 8.5 8.5 0 1 0 20.74 15.24Z"
            />
          </svg>
          <span class="sr-only">{{ themeLabel }}</span>
        </button>
        <div class="locale-switcher" aria-label="Language">
          <button
            v-for="option in ['fr', 'en'] as Locale[]"
            :key="option"
            type="button"
            class="locale-option touch-target"
            :class="{ 'locale-option-active': locale === option }"
            :aria-pressed="locale === option"
            @click="changeLocale(option)"
          >
            {{ localeNames[option] }}
          </button>
        </div>
        <button
          type="button"
          class="touch-target rounded-xl border border-stone-200 p-2 dark:border-stone-700 lg:hidden"
          aria-label="Toggle navigation"
          :aria-expanded="mobileMenuOpen"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <span class="sr-only">Menu</span><span class="block h-0.5 w-5 bg-current"></span
          ><span class="mt-1.5 block h-0.5 w-5 bg-current"></span>
        </button>
        <div
          class="header-menu absolute inset-x-0 top-full border-b border-stone-200 bg-stone-50 px-5 py-4 shadow-lg dark:border-stone-800 dark:bg-stone-950 lg:static lg:flex lg:items-center lg:gap-7 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
          :class="mobileMenuOpen ? 'block' : 'hidden lg:flex'"
        >
          <RouterLink
            v-if="isAuthenticated"
            to="/dashboard"
            class="nav-link"
            @click="mobileMenuOpen = false"
            >{{ copy.dashboard }}</RouterLink
          >
          <RouterLink v-else to="/login" class="nav-link" @click="mobileMenuOpen = false">{{
            copy.login
          }}</RouterLink>
          <RouterLink
            v-if="!isAuthenticated"
            to="/register"
            class="nav-cta touch-target"
            @click="mobileMenuOpen = false"
            >{{ copy.post }}</RouterLink
          >
          <button v-else type="button" class="nav-link text-left" @click="logout">
            {{ copy.logout }}
          </button>
        </div>
      </nav>
    </header>
    <div class="flex-1">
      <RouterView />
    </div>
    <div
      v-if="!ageConfirmed"
      class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <section class="max-w-lg rounded-3xl bg-white p-7 shadow-2xl dark:bg-stone-900 md:p-10">
        <p class="eyebrow">{{ copy.ageEyebrow }}</p>
        <h1 id="age-gate-title" class="mt-3 text-3xl font-light">{{ copy.ageTitle }}</h1>
        <p class="mt-5 leading-7 text-stone-600 dark:text-stone-300">
          {{ copy.ageText }} Cette confirmation est mémorisée uniquement dans le stockage local de
          votre navigateur.
        </p>
        <div class="mt-7 flex flex-col gap-3 sm:flex-row">
          <button type="button" class="button-primary" @click="acceptAge">
            Oui, j’ai 18 ans ou plus
          </button>
          <a href="https://www.google.com/" class="button-secondary"> {{ copy.leave }} </a>
        </div>
        <nav
          class="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-500"
          aria-label="Legal information"
        >
          <RouterLink to="/mentions-legales">{{ copy.legal }}</RouterLink>
          <RouterLink to="/confidentialite">{{ copy.privacy }}</RouterLink>
          <RouterLink to="/cookies">{{ copy.cookies }}</RouterLink>
        </nav>
      </section>
    </div>
    <footer
      class="mt-auto border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900"
    >
      <nav
        class="mx-auto flex max-w-7xl flex-wrap gap-x-5 gap-y-2 px-6 py-6 text-xs text-stone-500"
        aria-label="Legal links"
      >
        <RouterLink to="/mentions-legales">{{ copy.legal }}</RouterLink>
        <RouterLink to="/confidentialite">{{ copy.privacy }}</RouterLink>
        <RouterLink to="/cookies">{{ copy.cookies }}</RouterLink>
        <RouterLink to="/cgu">{{ copy.terms }}</RouterLink>
      </nav>
    </footer>
  </div>
</template>
