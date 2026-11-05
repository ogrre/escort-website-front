<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ListingCard from '../components/ListingCard.vue';
import { setSeo } from '../lib/seo';
import { useListingsStore } from '../stores/listings';

const store = useListingsStore();
const route = useRoute();
const router = useRouter();
const query = ref(String(route.query.q ?? ''));
const city = ref(String(route.query.city ?? ''));
const gender = ref(String(route.query.gender ?? ''));
const verified = ref(false);
const video = ref(false);

const filtered = computed(() =>
  store.listings.filter((item) => {
    const text = `${item.name} ${item.description} ${item.city}`.toLocaleLowerCase();
    return (
      (!query.value || text.includes(query.value.toLocaleLowerCase())) &&
      (!city.value || item.city.toLocaleLowerCase() === city.value.toLocaleLowerCase()) &&
      (!gender.value || (item.tags ?? []).includes(gender.value)) &&
      (!verified.value || item.verified) &&
      (!video.value || (item.tags ?? []).includes('video'))
    );
  }),
);

function submit() {
  router.replace({
    query: {
      q: query.value || undefined,
      city: city.value || undefined,
      gender: gender.value || undefined,
    },
  });
}

onMounted(() => {
  setSeo({
    title: 'Rechercher une annonce | Éclat',
    description: 'Recherchez rapidement les profils disponibles par ville.',
    canonical: `${window.location.origin}/search`,
  });
  store.search({ sort: 'boosted' });
});
</script>

<template>
  <main class="v2-wrap v2-search-page">
    <p class="v2-eyebrow">Annuaire / Recherche</p>
    <h1>Rechercher une annonce</h1>
    <div class="v2-layout">
      <aside class="v2-search-panel v2-filter-panel">
        <div class="v2-section-heading">
          <h2>Filtres</h2>
          <button
            class="v2-button ghost"
            type="button"
            @click="
              query = '';
              city = '';
              gender = '';
              verified = false;
              video = false;
            "
          >
            Effacer
          </button>
        </div>
        <label class="v2-field"
          ><span>Pseudo / présentation</span
          ><input v-model="query" placeholder="Pseudo ou mot-clé" @keyup.enter="submit"
        /></label>
        <label class="v2-field"
          ><span>Ville</span
          ><input v-model="city" placeholder="Rechercher une ville" @keyup.enter="submit"
        /></label>
        <label class="v2-field"
          ><span>Genre</span
          ><select v-model="gender">
            <option value="">Tous</option>
            <option value="female">Femme</option>
            <option value="male">Homme</option>
            <option value="trans">TV / TS</option>
          </select></label
        >
        <label class="v2-check"
          ><input v-model="verified" type="checkbox" /> Profils vérifiés</label
        >
        <label class="v2-check"><input v-model="video" type="checkbox" /> Avec vidéo</label>
        <button class="v2-button primary wide" type="button" @click="submit">
          Afficher les résultats
        </button>
      </aside>
      <section>
        <div class="v2-search-panel v2-top-search">
          <form class="v2-search-row" @submit.prevent="submit">
            <input v-model="query" placeholder="Pseudo ou mot-clé" /><input
              v-model="city"
              placeholder="Rechercher une ville"
            /><button class="v2-button primary" type="submit">Chercher</button>
          </form>
          <div class="v2-filter-chips">
            <button
              class="v2-chip"
              :class="{ active: verified }"
              type="button"
              @click="verified = !verified"
            >
              ✓ Vérifiés</button
            ><button
              class="v2-chip"
              :class="{ active: video }"
              type="button"
              @click="video = !video"
            >
              ▶ Vidéo
            </button>
          </div>
        </div>
        <div class="v2-section-heading v2-results-heading">
          <div>
            <h2>Annonces</h2>
            <span class="v2-muted">{{ filtered.length }} profils</span>
          </div>
        </div>
        <div v-if="store.loading" class="v2-listing-grid">
          <span v-for="n in 6" :key="n" class="v2-listing-skeleton"></span>
        </div>
        <div v-else-if="filtered.length" class="v2-listing-grid">
          <ListingCard v-for="item in filtered" :key="item.id" :listing="item" />
        </div>
        <p v-else class="v2-empty">Aucun résultat. Essayez d’élargir vos filtres.</p>
      </section>
    </div>
  </main>
</template>
