<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from './lib/api';

const router = useRouter();
const mobileMenuOpen = ref(false);
const isAuthenticated = computed(() => Boolean(localStorage.getItem('token')));

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
  </div>
</template>
