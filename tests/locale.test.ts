import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getInitialLocale } from '../src/lib/locale';

describe('locale selection', () => {
  beforeEach(() => {
    const values = new Map<string, string>();

    vi.stubGlobal('localStorage', {
      clear: () => values.clear(),
      getItem: (key: string) => values.get(key) ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, value),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps an explicit visitor choice', () => {
    localStorage.setItem('locale', 'fr');

    expect(getInitialLocale()).toBe('fr');
  });

  it('uses the browser language when no choice is saved', () => {
    Object.defineProperty(navigator, 'language', {
      configurable: true,
      value: 'en-US',
    });

    expect(getInitialLocale()).toBe('en');
  });
});
