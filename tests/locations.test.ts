import { describe, expect, it } from 'vitest';
import { normalizeLocations } from '../src/lib/locations';

describe('normalizeLocations', () => {
  it('normalizes the API country object without rendering it as JSON', () => {
    expect(
      normalizeLocations([
        {
          name: 'Paris',
          country: { code: 'FR', name: 'France' },
        },
      ]),
    ).toEqual([{ city: 'Paris', country: 'France', listings_count: undefined }]);
  });

  it('keeps locations returned by the has_listings API filter without a count field', () => {
    expect(
      normalizeLocations([
        { name: 'Lyon', country_code: 'FR' },
        { name: 'Bruxelles', country: { name: 'Belgique' }, listings_count: 4 },
      ]),
    ).toEqual([
      { city: 'Lyon', country: 'FR', listings_count: undefined },
      { city: 'Bruxelles', country: 'Belgique', listings_count: 4 },
    ]);
  });
});
