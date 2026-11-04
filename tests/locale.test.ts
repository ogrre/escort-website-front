import { afterEach, describe, expect, it } from 'vitest';
import { getInitialLocale } from '../src/lib/locale';

describe('locale selection', () => {
  afterEach(() => {
    localStorage.clear();
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
