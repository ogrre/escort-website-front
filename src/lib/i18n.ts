import { computed, inject, ref, type ComputedRef, type Ref } from 'vue';
import { localeKey, type Locale } from './locale';

export function useCopy<T>(translations: Record<Locale, T>): {
  locale: Ref<Locale>;
  copy: ComputedRef<T>;
} {
  const locale = inject(localeKey, ref<Locale>('fr'));
  return { locale, copy: computed(() => translations[locale.value]) };
}
