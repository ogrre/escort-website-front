import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cachedRequest, clearRequestCache } from '../src/lib/request-cache';

describe('request cache', () => {
  beforeEach(() => {
    clearRequestCache();
    vi.restoreAllMocks();
  });

  it('reuses a public response during its TTL', async () => {
    const request = vi.fn().mockResolvedValue({ data: ['Paris'] });

    await expect(cachedRequest('locations', request, 60_000)).resolves.toEqual({
      data: ['Paris'],
    });
    await expect(cachedRequest('locations', request, 60_000)).resolves.toEqual({
      data: ['Paris'],
    });

    expect(request).toHaveBeenCalledTimes(1);
  });

  it('shares an in-flight request between callers', async () => {
    let resolveRequest: (value: string) => void = () => undefined;
    const request = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const first = cachedRequest('listings', request, 60_000);
    const second = cachedRequest('listings', request, 60_000);
    resolveRequest('cached');

    await expect(Promise.all([first, second])).resolves.toEqual(['cached', 'cached']);
    expect(request).toHaveBeenCalledTimes(1);
  });
});
