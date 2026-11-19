<script setup lang="ts">
const props = defineProps<{ values: Record<string, string | undefined> }>();
const emit = defineEmits<{ apply: [values: Record<string, string | undefined>]; reset: [] }>();
const draft = reactive<Record<string, string | undefined>>({ ...props.values });
watch(
  () => props.values,
  (values) => Object.assign(draft, values),
  { deep: true },
);
function submit() {
  const values = Object.fromEntries(
    Object.entries(draft).map(([key, value]) => [key, value || undefined]),
  );
  emit('apply', values);
}
</script>

<template>
  <aside class="v8-filter-sidebar v8-panel">
    <div class="v8-filter-heading">
      <h2>Filtres</h2>
      <button class="v8-small-button" type="button" @click="emit('reset')">Effacer</button>
    </div>
    <form class="v8-filter-form" @submit.prevent="submit">
      <label>Pseudo / mot-clé<input v-model="draft.q" name="q" placeholder="Rechercher" /></label>
      <label
        >Genre<select v-model="draft.gender" name="gender">
          <option value="">Tous</option>
          <option value="femme">Femmes</option>
          <option value="homme">Hommes</option>
          <option value="tvts">TV / TS</option>
          <option value="couple">Couples</option>
        </select></label
      >
      <fieldset>
        <legend>Disponibilité et médias</legend>
        <label
          ><input v-model="draft.verified" type="checkbox" true-value="1" false-value="" /> Photos
          vérifiées</label
        ><label
          ><input v-model="draft.has_video" type="checkbox" true-value="1" false-value="" /> Avec
          vidéo</label
        ><label
          ><input v-model="draft.phone" type="checkbox" true-value="1" false-value="" />
          Téléphone</label
        >
      </fieldset>
      <fieldset>
        <legend>Âge</legend>
        <div class="v8-filter-pair">
          <label>Min.<input v-model="draft.age_min" type="number" min="18" max="80" /></label
          ><label>Max.<input v-model="draft.age_max" type="number" min="18" max="80" /></label>
        </div>
      </fieldset>
      <label>Nationalité<input v-model="draft.nationality" /></label
      ><label>Origine<input v-model="draft.ethnicity" /></label
      ><label>Langue<input v-model="draft.language" /></label>
      <fieldset>
        <legend>Caractéristiques</legend>
        <div class="v8-filter-pair">
          <label
            >Hauteur min.<input v-model="draft.height_min" type="number" min="50" max="250"
          /></label>
          <label
            >Hauteur max.<input v-model="draft.height_max" type="number" min="50" max="250"
          /></label>
          <label
            >Poids min.<input v-model="draft.weight_min" type="number" min="20" max="300"
          /></label>
          <label
            >Poids max.<input v-model="draft.weight_max" type="number" min="20" max="300"
          /></label>
        </div>
        <label>Couleur des yeux<input v-model="draft.eye_color" /></label>
        <label>Couleur des cheveux<input v-model="draft.hair_color" /></label>
        <label>Taille de bonnet<input v-model="draft.cup_size" /></label>
        <label>Épilation<input v-model="draft.intimate_grooming" /></label>
        <label>Tabac<input v-model="draft.smoking" /></label>
        <label>Alcool<input v-model="draft.alcohol" /></label>
      </fieldset>
      <label>Services<input v-model="draft.services" placeholder="Massage, Dîner" /></label>
      <label>Styles<input v-model="draft.styles" placeholder="Naturel, Glamour" /></label>
      <label
        >Recherche pour<input v-model="draft.interested_in" placeholder="Homme, Femme"
      /></label>
      <fieldset>
        <legend>Déplacements</legend>
        <label
          ><input v-model="draft.incall" type="checkbox" true-value="1" false-value="" />
          Reçoit</label
        >
        <label
          ><input v-model="draft.outcall" type="checkbox" true-value="1" false-value="" /> Se
          déplace</label
        >
      </fieldset>
      <label
        >Trier par<select v-model="draft.sort">
          <option value="recommended">Recommandées</option>
          <option value="newest">Plus récentes</option>
          <option value="most_viewed">Plus vues</option>
          <option value="last_update">Mises à jour</option>
          <option value="last_online">Dernière connexion</option>
          <option value="boosted">Mis en avant</option>
        </select></label
      >
      <button class="v8-btn primary" type="submit">Appliquer les filtres</button>
    </form>
  </aside>
</template>
