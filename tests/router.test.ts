import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { routes } from '../src/router';

const publicPaths = [
  '/',
  '/register',
  '/login',
  '/mentions-legales',
  '/confidentialite',
  '/cookies',
  '/cgu',
];

describe('public route rendering', () => {
  it.each(publicPaths)('resolves %s to a route component', async (path) => {
    const router = createRouter({ history: createMemoryHistory(), routes });

    await router.push(path);
    await router.isReady();

    expect(router.currentRoute.value.fullPath).toBe(path);
    expect(router.currentRoute.value.matched.at(-1)?.components?.default).toBeDefined();
  });

  it('uses distinct views for login and registration', () => {
    const loginRoute = routes.find((route) => route.path === '/login');
    const registerRoute = routes.find((route) => route.path === '/register');

    expect(loginRoute?.component).toBeDefined();
    expect(registerRoute?.component).toBeDefined();
    expect(loginRoute?.component).not.toBe(registerRoute?.component);
  });
});
