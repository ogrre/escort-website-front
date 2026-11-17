import { describe, expect, it } from 'vitest';
import { cityCanonical, citySeoMetadata } from '../src/lib/city-seo';
import {
  isFilteredProfileUrl,
  profileApiParams,
  readProfileFilters,
} from '../src/lib/profile-search';

describe('profile search contract', () => {
  it('uses official filter names and values', () => {
    const filters = readProfileFilters({
      gender: 'femme',
      has_video: '1',
      video: '1',
      city: 'bordeaux-33063',
    });
    expect(profileApiParams(filters)).toMatchObject({
      city: 'bordeaux-33063',
      gender: 'femme',
      has_video: '1',
    });
    expect(profileApiParams(filters)).not.toHaveProperty('video');
  });

  it('uses the official city slug for canonical URLs', () => {
    expect(cityCanonical('fr', 'bordeaux-33063', 'http://localhost:5173')).toBe(
      'http://localhost:5173/fr/villes/bordeaux-33063',
    );
  });

  it('marks filtered city pages noindex and clean city pages index', () => {
    expect(
      citySeoMetadata('fr', { name: 'Bordeaux', slug: 'bordeaux-33063' }, { gender: 'femme' })
        .robots,
    ).toBe('noindex,follow');
    expect(citySeoMetadata('fr', { name: 'Bordeaux', slug: 'bordeaux-33063' }).robots).toBe(
      'index,follow',
    );
    expect(isFilteredProfileUrl({ gender: 'femme' })).toBe(true);
  });
});
