import type { InjectionKey, Ref } from 'vue';

export type Locale = 'fr' | 'en';
export const localeKey = Symbol('locale') as InjectionKey<Ref<Locale>>;

export function getInitialLocale(): Locale {
  const saved = localStorage.getItem('locale');
  if (saved === 'fr' || saved === 'en') return saved;
  return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

export const localeNames: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
};
