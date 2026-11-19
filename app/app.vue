<script setup lang="ts">
import { ref } from 'vue';
import { confirmAge, hasAgeConfirmation } from '../src/lib/age-gate';

const { user, refresh, logout } = useAuth();
const api = usePublicApi();
const route = useRoute();
const ageConfirmed = ref(false);
const ageGateReady = ref(false);
const hasListing = ref(false);
const mobileOpen = ref(false);

async function refreshAccount() {
  await refresh();
  if (!user.value || user.value.role !== 'advertiser' || !import.meta.client) {
    hasListing.value = false;
    return;
  }
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const response = await api<{ data?: unknown[] }>('/my/listings', {
      headers: { Authorization: `Bearer ${token}` },
    });
    hasListing.value = Array.isArray(response.data) && response.data.length > 0;
  } catch {
    hasListing.value = false;
  }
}

onMounted(() => {
  ageConfirmed.value = hasAgeConfirmation(localStorage);
  ageGateReady.value = true;
  void refreshAccount();
});

watch(
  () => route.fullPath,
  () => void refreshAccount(),
);

function acceptAge() {
  confirmAge(localStorage);
  ageConfirmed.value = true;
}

const currentLocale = computed(() =>
  route.path === '/en' || route.path.startsWith('/en/') ? 'en' : 'fr',
);
const isEnglish = computed(() => currentLocale.value === 'en');
const advertiserAction = computed(() =>
  isEnglish.value
    ? hasListing.value
      ? 'My listing'
      : 'Post a listing'
    : hasListing.value
      ? 'Mon annonce'
      : 'Déposer une annonce',
);
const advertiserPath = computed(() => (hasListing.value ? '/dashboard/profile' : '/register'));
function localePath(locale: 'fr' | 'en') {
  const path = route.path;
  const query = route.fullPath.slice(path.length);
  let replacement = locale === 'en' ? '/en' : '/';
  if (locale === 'en') {
    if (path === '/') replacement = '/en';
    else if (path === '/fr/villes') replacement = '/en/cities';
    else if (path.startsWith('/fr/villes/'))
      replacement = path.replace('/fr/villes/', '/en/cities/');
    else if (path.startsWith('/fr/profil/'))
      replacement = path.replace('/fr/profil/', '/en/profile/');
  } else {
    if (path === '/en') replacement = '/';
    else if (path === '/en/cities') replacement = '/fr/villes';
    else if (path.startsWith('/en/cities/'))
      replacement = path.replace('/en/cities/', '/fr/villes/');
    else if (path.startsWith('/en/profile/'))
      replacement = path.replace('/en/profile/', '/fr/profil/');
  }
  return `${replacement}${query}`;
}

function switchLocale(locale: 'fr' | 'en') {
  if (import.meta.client) localStorage.setItem('locale', locale);
}
</script>

<template>
  <div class="v8-shell">
    <header class="v8-header">
      <div class="v8-container v8-head-inner">
        <NuxtLink to="/" class="v8-brand" aria-label="ÉLÉGANCE accueil">ÉLÉGANCE</NuxtLink>
        <nav class="v8-head-nav" aria-label="Navigation principale">
          <NuxtLink :to="isEnglish ? '/en/cities' : '/fr/villes'">{{
            isEnglish ? 'Cities' : 'Villes'
          }}</NuxtLink>
          <NuxtLink :to="user ? '/dashboard/settings' : '/login'">{{
            user ? (isEnglish ? 'Account' : 'Compte') : isEnglish ? 'Login' : 'Connexion'
          }}</NuxtLink>
        </nav>
        <nav class="v8-locale-switcher" aria-label="Choisir la langue">
          <NuxtLink
            :class="{ active: currentLocale === 'fr' }"
            :to="localePath('fr')"
            prefetch
            lang="fr"
            hreflang="fr"
            @click="switchLocale('fr')"
            >FR</NuxtLink
          >
          <NuxtLink
            :class="{ active: currentLocale === 'en' }"
            :to="localePath('en')"
            prefetch
            lang="en"
            hreflang="en"
            @click="switchLocale('en')"
            >EN</NuxtLink
          >
        </nav>
        <div class="v8-head-actions">
          <NuxtLink class="v8-btn primary small v8-desktop-only" :to="advertiserPath">{{
            advertiserAction
          }}</NuxtLink>
          <button v-if="user" class="v8-link-button v8-desktop-only" type="button" @click="logout">
            Déconnexion
          </button>
          <button
            class="v8-btn ghost small v8-menu-toggle"
            type="button"
            :aria-expanded="mobileOpen"
            aria-label="Ouvrir le menu"
            @click="mobileOpen = !mobileOpen"
          >
            ☰
          </button>
        </div>
      </div>
      <nav v-if="mobileOpen" class="v8-mobile-menu v8-container" aria-label="Navigation mobile">
        <NuxtLink :to="isEnglish ? '/en/cities' : '/fr/villes'">{{
          isEnglish ? 'Explore cities' : 'Explorer les villes'
        }}</NuxtLink>
        <NuxtLink :to="user ? '/dashboard/settings' : '/login'">{{
          user ? 'Compte' : 'Connexion'
        }}</NuxtLink>
        <NuxtLink :to="advertiserPath">{{ advertiserAction }}</NuxtLink>
      </nav>
    </header>
    <main class="v8-main"><NuxtPage /></main>
    <div
      v-if="ageGateReady && !ageConfirmed"
      class="v8-age-gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="v8-age-title"
    >
      <section class="v8-panel">
        <span class="v8-eyebrow">Accès réservé aux adultes</span>
        <h2 id="v8-age-title">Avez-vous 18 ans ou plus ?</h2>
        <p>Vous devez confirmer être majeur(e) avant d’accéder au site.</p>
        <div class="v8-inline-actions">
          <button class="v8-btn primary" type="button" @click="acceptAge">
            Oui, j’ai 18 ans ou plus
          </button>
          <a class="v8-btn ghost" href="https://www.google.com/" rel="noopener noreferrer"
            >Quitter le site</a
          >
        </div>
      </section>
    </div>
    <footer class="v8-footer">
      <div class="v8-container v8-footer-main">
        <div>
          <NuxtLink class="v8-brand" to="/">ÉLÉGANCE</NuxtLink>
          <p class="v8-muted v8-small">
            Un annuaire pensé pour une recherche locale simple, discrète et intuitive.
          </p>
          <span class="v8-chip">Réservé aux adultes · 18+</span>
        </div>
        <div>
          <h4>Découvrir</h4>
          <nav class="v8-footer-links">
            <NuxtLink to="/">Accueil</NuxtLink><NuxtLink to="/fr/villes">Villes</NuxtLink>
          </nav>
        </div>
        <div>
          <h4>Votre compte</h4>
          <nav class="v8-footer-links">
            <NuxtLink to="/login">Connexion</NuxtLink><NuxtLink to="/register">Inscription</NuxtLink
            ><NuxtLink to="/dashboard">Espace annonceur</NuxtLink
            ><NuxtLink to="/dashboard/subscription">Abonnement</NuxtLink>
          </nav>
        </div>
        <div>
          <h4>Informations</h4>
          <nav class="v8-footer-links">
            <NuxtLink to="/mentions-legales">Mentions légales</NuxtLink
            ><NuxtLink to="/confidentialite">Confidentialité</NuxtLink
            ><NuxtLink to="/cgu">CGU</NuxtLink><NuxtLink to="/cookies">Cookies</NuxtLink>
          </nav>
        </div>
      </div>
      <div class="v8-container v8-footer-bottom">
        <span>© 2026 ÉLÉGANCE</span
        ><span>Les contenus légaux sont à compléter et valider officiellement.</span>
      </div>
    </footer>
  </div>
</template>
