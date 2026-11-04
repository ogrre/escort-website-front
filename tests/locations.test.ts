import { describe, expect, it } from 'vitest';
import { normalizeLocations } from '../src/lib/locations';

describe('normalizeLocations', () => {
  it('normalizes the API country object without rendering it as JSON', () => {
    expect(
      normalizeLocations([
        {
          name: 'Paris',
          country: { code: 'FR', name: 'France' },
          listings_count: 12,
        },
      ]),
    ).toEqual([{ city: 'Paris', country: 'France', listings_count: 12 }]);
  });

  it('keeps only locations with at least one listing', () => {
    expect(
      normalizeLocations([
        { name: 'Lyon', country_code: 'FR' },
        { name: 'Bruxelles', country: { name: 'Belgique' }, listings_count: 4 },
      ]),
    ).toEqual([{ city: 'Bruxelles', country: 'Belgique', listings_count: 4 }]);
  });

  it('deduplicates city names regardless of case or accents', () => {
    expect(
      normalizeLocations([
        { name: 'Paris', country: { code: 'FR', name: 'France' }, listings_count: 12 },
        { name: ' paris ', country: { code: 'FR', name: 'FRANCE' }, listings_count: 8 },
      ]),
    ).toEqual([{ city: 'Paris', country: 'France', listings_count: 12 }]);
  });
});
