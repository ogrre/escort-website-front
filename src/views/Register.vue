<script setup lang="ts">
import AuthForm from '../components/AuthForm.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const selectedRole = computed(() => {
  const role = String(route.query.role ?? '');
  return role === 'advertiser' || role === 'visitor' ? role : '';
});
</script>

<template>
  <main v-if="!selectedRole" class="v2-wrap v2-signup-page">
    <header class="v2-signup-head">
      <p class="v2-eyebrow">Éclat</p>
      <h1>Créer un compte</h1>
      <p class="v2-lead">
        Choisissez votre profil : l’inscription prend deux minutes et l’e-mail est confirmé à la
        fin.
      </p>
    </header>

    <div class="v2-signup-grid">
      <section class="v2-signup-card advertiser">
        <div class="v2-signup-row">
          <div class="v2-signup-body">
            <span class="v2-signup-badge">✦ Escorte · Multi-profil / Agence</span>
            <h2>Je suis une escorte, ou je gère plusieurs profils</h2>
            <p>Publiez votre fiche et faites-vous connaître.</p>
            <ul>
              <li>✓ Sedcard facile à mettre en ligne</li>
              <li>✓ Photos, vidéos et commentaires sur votre fiche</li>
              <li>✓ Utilisateurs ciblés de notre réseau</li>
              <li>✓ Tous vos profils dans un seul compte</li>
              <li>✓ Une fiche priorisée parmi les autres escortes</li>
            </ul>
            <p class="v2-signup-note">
              <strong>Escorte exclusive</strong> — votre fiche passe devant.
            </p>
          </div>
          <div class="v2-signup-portrait advertiser-portrait" aria-hidden="true"></div>
        </div>
        <RouterLink to="/register?role=advertiser" class="v2-button primary v2-signup-cta">
          S’inscrire comme escorte
        </RouterLink>
      </section>

      <section class="v2-signup-card visitor">
        <div class="v2-signup-row">
          <div class="v2-signup-body">
            <span class="v2-signup-badge">♙ Membre</span>
            <h2>Je suis un membre</h2>
            <p>Commentez, suivez et cherchez des escortes.</p>
            <ul>
              <li>✓ Ajoutez des commentaires</li>
              <li>✓ Gérez votre liste de favoris</li>
              <li>✓ Accédez à la recherche avancée</li>
              <li>✓ Échangez et suivez vos escortes</li>
              <li>✓ Priorisez vos escortes avec Premium</li>
            </ul>
            <p class="v2-signup-note">
              <strong>Membre premium</strong> — priorisez vos escortes dans les listes.
            </p>
          </div>
          <div class="v2-signup-portrait visitor-portrait" aria-hidden="true"></div>
        </div>
        <RouterLink to="/register?role=visitor" class="v2-button ghost v2-signup-cta">
          S’inscrire comme membre
        </RouterLink>
      </section>
    </div>

    <p class="v2-signup-foot">Déjà inscrit ? <RouterLink to="/login">Se connecter</RouterLink></p>
  </main>
  <AuthForm v-else mode="register" />
</template>
