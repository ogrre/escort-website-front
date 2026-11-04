export const AGE_GATE_STORAGE_KEY = 'elegance-age-confirmed';

export function hasAgeConfirmation(storage: Pick<Storage, 'getItem'>): boolean {
  return storage.getItem(AGE_GATE_STORAGE_KEY) === 'true';
}

export function confirmAge(storage: Pick<Storage, 'setItem'>): void {
  storage.setItem(AGE_GATE_STORAGE_KEY, 'true');
}
