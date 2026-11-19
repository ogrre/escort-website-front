<script setup lang="ts">
const props = defineProps<{ open: boolean; values: Record<string, string | undefined> }>();
const emit = defineEmits<{
  close: [];
  apply: [values: Record<string, string | undefined>];
  reset: [];
}>();
const draft = reactive({ ...props.values });
watch(
  () => props.values,
  (value) => Object.assign(draft, value),
  { deep: true },
);
function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) emit('close');
}
onMounted(() => window.addEventListener('keydown', closeOnEscape));
onBeforeUnmount(() => window.removeEventListener('keydown', closeOnEscape));
</script>

<template>
  <section v-if="open" class="e-inline-filters" role="region" aria-labelledby="filters-title">
    <div class="e-drawer-head">
      <div>
        <span class="e-kicker">Recherche</span>
        <h2 id="filters-title">Filtres avancés</h2>
      </div>
      <button
        class="e-icon-button"
        type="button"
        aria-label="Fermer les filtres"
        @click="emit('close')"
      >
        ×
      </button>
    </div>
    <div class="e-inline-filters__body">
      <div class="e-filter-grid">
        <label
          ><span>Âge minimum</span><input v-model="draft.age_min" type="number" min="18" max="99"
        /></label>
        <label
          ><span>Âge maximum</span><input v-model="draft.age_max" type="number" min="18" max="99"
        /></label>
        <label><span>Nationalité</span><input v-model="draft.nationality" /></label>
        <label><span>Origine</span><input v-model="draft.ethnicity" /></label>
        <label><span>Langue</span><input v-model="draft.language" /></label>
        <label
          ><span>Rayon</span
          ><select v-model="draft.radius">
            <option value="">Sans rayon</option>
            <option value="5">5 km</option>
            <option value="25">25 km</option>
            <option value="50">50 km</option>
            <option value="100">100 km</option>
          </select></label
        >
      </div>
      <fieldset class="e-filter-checks">
        <legend>Disponibilité publique</legend>
        <label><input v-model="draft.verified" type="checkbox" true-value="1" /> Vérifié</label
        ><label><input v-model="draft.has_video" type="checkbox" true-value="1" /> Avec vidéo</label
        ><label
          ><input v-model="draft.phone" type="checkbox" true-value="1" /> Téléphone visible</label
        >
      </fieldset>
      <div class="e-drawer-actions">
        <button class="e-button secondary" type="button" @click="emit('reset')">
          Réinitialiser</button
        ><button class="e-button primary" type="button" @click="emit('apply', { ...draft })">
          Voir les résultats
        </button>
      </div>
    </div>
  </section>
</template>
