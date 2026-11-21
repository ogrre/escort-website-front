import axios from 'axios';

const savedLocale =
  typeof globalThis.localStorage?.getItem === 'function'
    ? globalThis.localStorage.getItem('locale')
    : null;
const browserLocale = globalThis.navigator?.language?.slice(0, 2) ?? 'fr';

export const api = axios.create({
  // Keep browser requests same-origin in Nuxt so auth does not depend on the
  // API's CORS allow-list. The Nuxt server proxies this path to the API.
  baseURL: import.meta.env.VITE_API_URL ?? '/api/backend',
  headers: {
    Accept: 'application/json',
    'X-App-Language': savedLocale ?? browserLocale,
  },
});
