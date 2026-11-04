import axios from 'axios';

const savedLocale =
  typeof globalThis.localStorage?.getItem === 'function'
    ? globalThis.localStorage.getItem('locale')
    : null;
const browserLocale = globalThis.navigator?.language?.slice(0, 2) ?? 'fr';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api/v1',
  headers: {
    Accept: 'application/json',
    'X-App-Language': savedLocale ?? browserLocale,
  },
});
