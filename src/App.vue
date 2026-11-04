<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from './lib/api';
import { confirmAge, hasAgeConfirmation } from './lib/age-gate';

const router = useRouter();
const mobileMenuOpen = ref(false);
const ageConfirmed = ref(false);
const isAuthenticated = computed(() => Boolean(localStorage.getItem('token')));

onMounted(() => {
  ageConfirmed.value = hasAgeConfirmation(localStorage);
});

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
  <div class="min-h-screen bg-stone-50">
    <header class="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/95 backdrop-blur">
      <nav class="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <RouterLink to="/" class="brand-mark" @click="mobileMenuOpen = false">ÉLÉGANCE</RouterLink>
        <button
          type="button"
          class="rounded-xl border border-stone-200 p-2 lg:hidden"
          aria-label="Toggle navigation"
          :aria-expanded="mobileMenuOpen"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <span class="sr-only">Menu</span><span class="block h-0.5 w-5 bg-current"></span
          ><span class="mt-1.5 block h-0.5 w-5 bg-current"></span>
        </button>
        <div
          class="absolute inset-x-0 top-full border-b border-stone-200 bg-stone-50 px-5 py-4 lg:static lg:flex lg:items-center lg:gap-7 lg:border-0 lg:bg-transparent lg:p-0"
          :class="mobileMenuOpen ? 'block' : 'hidden lg:flex'"
        >
          <RouterLink to="/search" class="nav-link" @click="mobileMenuOpen = false"
            >Explore</RouterLink
          >
          <RouterLink
            v-if="isAuthenticated"
            to="/dashboard"
            class="nav-link"
            @click="mobileMenuOpen = false"
            >Dashboard</RouterLink
          >
          <RouterLink v-else to="/login" class="nav-link" @click="mobileMenuOpen = false"
            >Log in</RouterLink
          >
          <RouterLink
            v-if="!isAuthenticated"
            to="/register"
            class="nav-cta"
            @click="mobileMenuOpen = false"
            >Create account</RouterLink
          >
          <button v-else type="button" class="nav-link text-left" @click="logout">Log out</button>
        </div>
      </nav>
    </header>
    <RouterView />
    <div
      v-if="!ageConfirmed"
      class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <section class="max-w-lg rounded-3xl bg-white p-7 shadow-2xl md:p-10">
        <p class="eyebrow">Accès réservé aux adultes</p>
        <h1 id="age-gate-title" class="mt-3 text-3xl font-light">Avez-vous 18 ans ou plus ?</h1>
        <p class="mt-5 leading-7 text-stone-600">
          Vous devez confirmer être majeur(e) avant d’accéder au site. Cette confirmation est
          mémorisée uniquement dans le stockage local de votre navigateur.
        </p>
        <div class="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            class="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white"
            @click="acceptAge"
          >
            Oui, j’ai 18 ans ou plus
          </button>
          <a
            href="https://www.google.com/"
            class="rounded-full border border-stone-300 px-5 py-3 text-center text-sm font-medium"
          >
            Non, quitter le site
          </a>
        </div>
        <nav
          class="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-500"
          aria-label="Legal information"
        >
          <RouterLink to="/mentions-legales">Mentions légales</RouterLink>
          <RouterLink to="/confidentialite">Confidentialité</RouterLink>
          <RouterLink to="/cookies">Cookies</RouterLink>
        </nav>
      </section>
    </div>
    <footer class="border-t border-stone-200 bg-white">
      <nav
        class="mx-auto flex max-w-7xl flex-wrap gap-x-5 gap-y-2 px-6 py-6 text-xs text-stone-500"
        aria-label="Legal links"
      >
        <RouterLink to="/mentions-legales">Mentions légales</RouterLink>
        <RouterLink to="/confidentialite">Politique de confidentialité</RouterLink>
        <RouterLink to="/cookies">Cookies et traceurs</RouterLink>
        <RouterLink to="/cgu">CGU</RouterLink>
      </nav>
    </footer>
  </div>
</template>
