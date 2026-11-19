import { describe, expect, it } from 'vitest';
import { cityMatches } from '../app/composables/useLocations';
import { buildCitySearchQuery } from '../app/utils/search-query';
import { normalizePublicProfile, translateProfileValue } from '../app/utils/public';

describe('v5 public UX contracts', () => {
  it('filters the complete city catalog by accents, search and letter', () => {
    const city = {
      id: '1',
      name: 'Orléans',
      slug: 'orleans-45234',
      country: { code: 'FR', name: 'France' },
      region: { code: '24', name: 'Centre-Val de Loire' },
      listings_count: 2,
      is_major: false,
    };
    expect(cityMatches(city, 'orleans', 'O')).toBe(true);
    expect(cityMatches(city, 'paris', 'O')).toBe(false);
  });

  it('keeps only supported non-empty search query values', () => {
    expect(
      buildCitySearchQuery({ q: 'Camille', gender: 'femme', age_min: '', age_max: undefined }),
    ).toEqual({ q: 'Camille', gender: 'femme' });
  });

  it('normalizes real API profile shapes without inventing a slug', () => {
    const profile = normalizePublicProfile({
      id: 'profile-uuid',
      name: 'Camille',
      city: 'Lille',
      photos: [],
    });
    expect(profile).toMatchObject({ id: 'profile-uuid', name: 'Camille', city: 'Lille' });
    expect(profile).not.toHaveProperty('slug');
  });

  it('keeps profile labels in the requested locale', () => {
    expect(translateProfileValue('Femmes', 'en')).toBe('Women');
    expect(translateProfileValue('Voyage', 'en')).toBe('Travel');
    expect(translateProfileValue('Événement', 'en')).toBe('Event');
    expect(translateProfileValue('Naturelle', 'en')).toBe('Natural');
    expect(translateProfileValue('women', 'fr')).toBe('Femmes');
  });
});
