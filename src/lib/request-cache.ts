interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const pendingRequests = new Map<string, Promise<unknown>>();
const storagePrefix = 'elegance:public-cache:';

export async function cachedRequest<T>(
  key: string,
  request: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  const now = Date.now();
  const memoryEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memoryEntry && memoryEntry.expiresAt > now) {
    return memoryEntry.value;
  }

  const pending = pendingRequests.get(key) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  if (typeof sessionStorage !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(storagePrefix + key);
      if (stored) {
        const entry = JSON.parse(stored) as CacheEntry<T>;
        if (entry.expiresAt > now) {
          memoryCache.set(key, entry);
          return entry.value;
        }
        sessionStorage.removeItem(storagePrefix + key);
      }
    } catch {
      sessionStorage.removeItem(storagePrefix + key);
    }
  }

  const promise = request()
    .then((value) => {
      const entry = { expiresAt: Date.now() + ttlMs, value };
      memoryCache.set(key, entry);
      if (typeof sessionStorage !== 'undefined') {
        try {
          sessionStorage.setItem(storagePrefix + key, JSON.stringify(entry));
        } catch {
          // Caching is optional when storage is unavailable or full.
        }
      }
      return value;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, promise);
  return promise;
}

export function clearRequestCache() {
  memoryCache.clear();
  pendingRequests.clear();
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(storagePrefix))
      .forEach((key) => sessionStorage.removeItem(key));
  }
}
