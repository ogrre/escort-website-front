import { describe, expect, it } from 'vitest';
import { AGE_GATE_STORAGE_KEY, confirmAge, hasAgeConfirmation } from '../src/lib/age-gate';

describe('age gate', () => {
  it('requires an explicit confirmation', () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null };

    expect(hasAgeConfirmation(storage)).toBe(false);
  });

  it('stores only the local confirmation flag', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    confirmAge(storage);

    expect(values.size).toBe(1);
    expect(values.get(AGE_GATE_STORAGE_KEY)).toBe('true');
    expect(hasAgeConfirmation(storage)).toBe(true);
  });
});
