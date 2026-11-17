import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getInitialLocale } from '../src/lib/locale';

describe('locale selection', () => {
  beforeEach(() => {
    const values = new Map<string, string>();

    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        clear: () => values.clear(),
        getItem: (key: string) => values.get(key) ?? null,
        removeItem: (key: string) => values.delete(key),
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'localStorage');
  });

  it('keeps an explicit visitor choice', () => {
    globalThis.localStorage.setItem('locale', 'fr');

    expect(getInitialLocale()).toBe('fr');
  });

  it('uses the browser language when no choice is saved', () => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { language: 'en-US' },
    });

    expect(getInitialLocale()).toBe('en');
  });
});
