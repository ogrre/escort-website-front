export function usePublicApi() {
  const config = useRuntimeConfig();
  return $fetch.create({
    baseURL: import.meta.server ? config.apiInternalBaseUrl : config.public.apiBaseUrl,
    headers: { Accept: 'application/json' },
    timeout: 5000,
  });
}
