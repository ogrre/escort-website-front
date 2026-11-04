import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { routes } from '../src/router';

const publicPaths = ['/', '/register', '/login', '/search'];

describe('public route rendering', () => {
  it.each(publicPaths)('resolves %s to a route component', async (path) => {
    const router = createRouter({ history: createMemoryHistory(), routes });

    await router.push(path);
    await router.isReady();

    expect(router.currentRoute.value.fullPath).toBe(path);
    expect(router.currentRoute.value.matched.at(-1)?.components?.default).toBeDefined();
  });
});
