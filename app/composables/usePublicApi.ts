export function usePublicApi() {
  const config = useRuntimeConfig();
  return $fetch.create({
    baseURL: config.public.apiBaseUrl,
    headers: { Accept: 'application/json', 'X-App-Language': 'fr' },
    timeout: 10000,
  });
}
