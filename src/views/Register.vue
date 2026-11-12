<script setup lang="ts">
import AuthForm from '../components/AuthForm.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCopy } from '../lib/i18n';

const route = useRoute();
const selectedRole = computed(() => {
  const role = String(route.query.role ?? '');
  return role === 'advertiser' || role === 'visitor' ? role : '';
});
const { locale } = useCopy({ fr: 'fr', en: 'en' });
const english = computed(() => locale.value === 'en');
const copy = computed(() =>
  english.value
    ? {
        eyebrow: 'Elegance',
        title: 'Create an account',
        intro:
          'Choose your profile: registration takes two minutes and your email is confirmed at the end.',
        advertiserBadge: 'Advertiser · Multi-profile / Agency',
        advertiserTitle: 'I am an escort, or I manage multiple profiles',
        advertiserIntro: 'Publish your profile and get discovered.',
        advertiserFeatures: [
          'Easy sedcard publishing',
          'Photos, videos and comments on your profile',
          'Targeted users from our network',
          'All your profiles in one account',
          'Priority placement among other escorts',
        ],
        advertiserNote: 'Exclusive advertiser — your profile comes first.',
        advertiserCta: 'Register as an advertiser',
        visitorBadge: 'Member',
        visitorTitle: 'I am a member',
        visitorIntro: 'Comment, follow and search for escorts.',
        visitorFeatures: [
          'Add comments',
          'Manage your favourites',
          'Access advanced search',
          'Exchange messages and follow escorts',
          'Prioritise escorts with Premium',
        ],
        visitorNote: 'Premium member — prioritise your escorts in listings.',
        visitorCta: 'Register as a member',
        already: 'Already registered?',
        login: 'Log in',
      }
    : {
        eyebrow: 'Élégance',
        title: 'Créer un compte',
        intro:
          'Choisissez votre profil : l’inscription prend deux minutes et l’e-mail est confirmé à la fin.',
        advertiserBadge: 'Annonceur · Multi-profil / Agence',
        advertiserTitle: 'Je suis une escorte, ou je gère plusieurs profils',
        advertiserIntro: 'Publiez votre fiche et faites-vous connaître.',
        advertiserFeatures: [
          'Sedcard facile à mettre en ligne',
          'Photos, vidéos et commentaires sur votre fiche',
          'Utilisateurs ciblés de notre réseau',
          'Tous vos profils dans un seul compte',
          'Une fiche priorisée parmi les autres escortes',
        ],
        advertiserNote: 'Escorte exclusive — votre fiche passe devant.',
        advertiserCta: 'S’inscrire comme annonceur',
        visitorBadge: 'Membre',
        visitorTitle: 'Je suis un membre',
        visitorIntro: 'Commentez, suivez et cherchez des escortes.',
        visitorFeatures: [
          'Ajoutez des commentaires',
          'Gérez votre liste de favoris',
          'Accédez à la recherche avancée',
          'Échangez et suivez vos escortes',
          'Priorisez vos escortes avec Premium',
        ],
        visitorNote: 'Membre premium — priorisez vos escortes dans les listes.',
        visitorCta: 'S’inscrire comme membre',
        already: 'Déjà inscrit ?',
        login: 'Se connecter',
      },
);
</script>

<template>
  <main v-if="!selectedRole" class="v2-wrap v2-signup-page">
    <header class="v2-signup-head">
      <p class="v2-eyebrow">{{ copy.eyebrow }}</p>
      <h1>{{ copy.title }}</h1>
      <p class="v2-lead">
        {{ copy.intro }}
      </p>
    </header>

    <div class="v2-signup-grid">
      <section class="v2-signup-card advertiser">
        <div class="v2-signup-row">
          <div class="v2-signup-body">
            <span class="v2-signup-badge">✦ {{ copy.advertiserBadge }}</span>
            <h2>{{ copy.advertiserTitle }}</h2>
            <p>{{ copy.advertiserIntro }}</p>
            <ul>
              <li v-for="feature in copy.advertiserFeatures" :key="feature">✓ {{ feature }}</li>
            </ul>
            <p class="v2-signup-note">
              {{ copy.advertiserNote }}
            </p>
          </div>
          <div class="v2-signup-portrait advertiser-portrait" aria-hidden="true"></div>
        </div>
        <RouterLink to="/register?role=advertiser" class="v2-button primary v2-signup-cta">
          {{ copy.advertiserCta }}
        </RouterLink>
      </section>

      <section class="v2-signup-card visitor">
        <div class="v2-signup-row">
          <div class="v2-signup-body">
            <span class="v2-signup-badge">♙ {{ copy.visitorBadge }}</span>
            <h2>{{ copy.visitorTitle }}</h2>
            <p>{{ copy.visitorIntro }}</p>
            <ul>
              <li v-for="feature in copy.visitorFeatures" :key="feature">✓ {{ feature }}</li>
            </ul>
            <p class="v2-signup-note">
              {{ copy.visitorNote }}
            </p>
          </div>
          <div class="v2-signup-portrait visitor-portrait" aria-hidden="true"></div>
        </div>
        <RouterLink to="/register?role=visitor" class="v2-button ghost v2-signup-cta">
          {{ copy.visitorCta }}
        </RouterLink>
      </section>
    </div>

    <p class="v2-signup-foot">
      {{ copy.already }} <RouterLink to="/login">{{ copy.login }}</RouterLink>
    </p>
  </main>
  <AuthForm v-else mode="register" />
</template>
