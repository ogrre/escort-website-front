const localMediaOrigin = import.meta.env.VITE_MEDIA_URL ?? 'http://localhost:9000';

/** Convert storage URLs emitted from Docker's internal network for browser use. */
export function resolveMediaUrl(value?: string | null): string {
  if (!value) return '';

  try {
    const url = new URL(value, globalThis.location?.origin ?? 'http://localhost');
    if (url.hostname === 'minio' || url.hostname === 'minio-api') {
      const publicOrigin = new URL(localMediaOrigin);
      url.protocol = publicOrigin.protocol;
      url.hostname = publicOrigin.hostname;
      url.port = publicOrigin.port;
    }
    return url.toString();
  } catch {
    return value;
  }
}
