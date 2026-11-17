import { describe, expect, it } from 'vitest';
import { normalizeLocations } from '../src/lib/locations';

describe('normalizeLocations', () => {
  it('keeps the official location slug and complete city contract', () => {
    expect(
      normalizeLocations([
        {
          id: 1,
          name: 'Paris',
          slug: 'paris-75056',
          country: { code: 'FR', name: 'France' },
          region: { code: 'IDF', name: 'Île-de-France' },
          listings_count: 12,
          is_major: 1,
        },
      ]),
    ).toEqual([
      {
        id: '1',
        name: 'Paris',
        slug: 'paris-75056',
        country: { code: 'FR', name: 'France' },
        region: { code: 'IDF', name: 'Île-de-France' },
        listings_count: 12,
        is_major: true,
      },
    ]);
  });

  it('keeps only locations with at least one listing', () => {
    expect(
      normalizeLocations([
        { name: 'Lyon', slug: 'lyon-69123', country: { code: 'FR', name: 'France' } },
        {
          name: 'Bruxelles',
          slug: 'bruxelles-1000',
          country: { code: 'BE', name: 'Belgique' },
          listings_count: 4,
        },
      ]),
    ).toEqual([
      {
        id: 'bruxelles-1000',
        name: 'Bruxelles',
        slug: 'bruxelles-1000',
        country: { code: 'BE', name: 'Belgique' },
        region: null,
        listings_count: 4,
        is_major: false,
      },
    ]);
  });

  it('deduplicates city names regardless of case or accents', () => {
    expect(
      normalizeLocations([
        {
          name: 'Paris',
          slug: 'paris-75056',
          country: { code: 'FR', name: 'France' },
          listings_count: 12,
        },
        {
          name: ' paris ',
          slug: 'paris-75056',
          country: { code: 'FR', name: 'FRANCE' },
          listings_count: 8,
        },
      ]),
    ).toEqual([
      {
        id: 'paris-75056',
        name: 'Paris',
        slug: 'paris-75056',
        country: { code: 'FR', name: 'France' },
        region: null,
        listings_count: 12,
        is_major: false,
      },
    ]);
  });
});
