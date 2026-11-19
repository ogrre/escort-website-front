<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    citySlug?: string;
    values?: Record<string, string | undefined>;
    locale?: 'fr' | 'en';
    advancedOpen?: boolean;
  }>(),
  { citySlug: undefined, values: () => ({}), locale: 'fr', advancedOpen: false },
);
const route = useRoute();
const q = ref(props.values?.q ?? String(route.query.q ?? ''));
const gender = ref(props.values?.gender ?? String(route.query.gender ?? ''));
const age = ref(
  props.values?.age_min && props.values?.age_max
    ? `${props.values.age_min}-${props.values.age_max}`
    : '',
);
const router = useRouter();
const emit = defineEmits<{ search: []; advanced: [] }>();
function submit() {
  const query: Record<string, string | undefined> = {
    ...route.query,
    q: q.value.trim() || undefined,
    gender: gender.value || undefined,
    age_min: undefined,
    age_max: undefined,
    page: undefined,
  };
  if (age.value) {
    const [min, max] = age.value.split('-');
    Object.assign(query, { age_min: min, age_max: max });
  }
  if (props.citySlug) {
    const prefix = props.locale === 'en' ? '/en/cities/' : '/fr/villes/';
    void router.push({ path: `${prefix}${encodeURIComponent(props.citySlug)}`, query });
  } else emit('search');
}
</script>

<template>
  <form class="e-search-bar" @submit.prevent="submit">
    <label
      ><span>Ville</span
      ><NuxtLink
        v-if="citySlug"
        :to="
          props.locale === 'en'
            ? `/en/cities/${encodeURIComponent(citySlug)}`
            : `/fr/villes/${encodeURIComponent(citySlug)}`
        "
        >{{ citySlug }}</NuxtLink
      ><NuxtLink v-else :to="props.locale === 'en' ? '/en/cities' : '/fr/villes'">
        {{ props.locale === 'en' ? 'Choose a city' : 'Choisir une ville' }}
      </NuxtLink></label
    >
    <label
      ><span>{{ props.locale === 'en' ? 'Name or keyword' : 'Pseudo ou mot-clé' }}</span
      ><input
        v-model="q"
        name="q"
        :placeholder="props.locale === 'en' ? 'e.g. Camille' : 'Ex. Camille'"
    /></label>
    <label
      ><span>{{ props.locale === 'en' ? 'Gender' : 'Genre' }}</span
      ><select v-model="gender" name="gender">
        <option value="">{{ props.locale === 'en' ? 'All' : 'Tous' }}</option>
        <option value="femme">{{ props.locale === 'en' ? 'Women' : 'Femme' }}</option>
        <option value="homme">{{ props.locale === 'en' ? 'Men' : 'Homme' }}</option>
        <option value="tvts">TV / TS</option>
        <option value="couple">{{ props.locale === 'en' ? 'Couples' : 'Couple' }}</option>
      </select></label
    >
    <label
      ><span>{{ props.locale === 'en' ? 'Age' : 'Âge' }}</span
      ><select v-model="age" name="age">
        <option value="">{{ props.locale === 'en' ? 'All' : 'Tous' }}</option>
        <option value="18-25">18–25</option>
        <option value="26-35">26–35</option>
        <option value="36-50">36–50</option>
        <option value="51-99">51+</option>
      </select></label
    >
    <button class="e-button primary" type="submit">
      {{ props.locale === 'en' ? 'Search' : 'Rechercher' }}
    </button>
    <button
      class="e-button secondary e-search-advanced"
      type="button"
      :aria-expanded="props.advancedOpen"
      aria-controls="advanced-filters"
      @click="emit('advanced')"
    >
      {{
        props.advancedOpen
          ? props.locale === 'en'
            ? 'Hide advanced filters'
            : 'Réduire les filtres'
          : props.locale === 'en'
            ? 'More filters'
            : 'Filtres avancés'
      }}
    </button>
  </form>
</template>
