<script setup lang="ts">
import '../src/styles.css';
</script>

<template>
  <div class="app-shell v2-app-shell flex min-h-screen flex-col overflow-x-hidden">
    <header class="sticky top-0 z-40 v2-header">
      <nav class="v2-nav mx-auto flex w-full max-w-7xl items-center gap-4 px-5 py-4 lg:px-8">
        <NuxtLink to="/" class="brand-mark">ÉLÉGANCE</NuxtLink>
        <div class="v2-header-actions">
          <NuxtLink to="/" class="v2-header-link">Accueil</NuxtLink>
          <NuxtLink to="/fr/villes" class="v2-header-link">Toutes les villes</NuxtLink>
          <NuxtLink to="/login" class="v2-header-link">Se connecter</NuxtLink>
          <NuxtLink to="/register" class="v2-header-button">Poster une annonce</NuxtLink>
        </div>
      </nav>
    </header>
    <div class="flex-1"><NuxtPage /></div>
    <footer class="v2-footer"><nav class="mx-auto flex max-w-7xl flex-wrap gap-x-5 gap-y-2 px-6 py-6 text-xs"><NuxtLink to="/mentions-legales">Mentions légales</NuxtLink><NuxtLink to="/confidentialite">Confidentialité</NuxtLink><NuxtLink to="/cookies">Cookies</NuxtLink><NuxtLink to="/cgu">CGU</NuxtLink></nav></footer>
  </div>
</template>
