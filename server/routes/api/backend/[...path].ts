import { getRequestURL, proxyRequest } from 'h3';

export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const requestUrl = getRequestURL(event);
  const path = String(event.context.params?.path ?? '').replace(/^\/+/, '');
  const target = `${String(config.apiInternalBaseUrl).replace(/\/+$/, '')}/${path}${requestUrl.search}`;

  return proxyRequest(event, target);
});
