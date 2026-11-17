import { describe, expect, it } from 'vitest';
import { routes } from '../src/router';

const publicPaths = [
  '/',
  '/register',
  '/login',
  '/fr/villes/bordeaux-33063',
  '/en/cities/bordeaux-33063',
  '/fr/profil/550e8400-e29b-41d4-a716-446655440000',
  '/en/profile/550e8400-e29b-41d4-a716-446655440000',
  '/mentions-legales',
  '/confidentialite',
  '/cookies',
  '/cgu',
];

describe('public route rendering', () => {
  it.each(publicPaths)('defines a route for %s', (path) => {
    const matched = routes.find((route) => route.path === path);
    const parameterized = routes.find((route) => {
      if (!route.path.includes(':')) return false;
      const prefix = route.path.split('/:')[0];
      return path.startsWith(`${prefix}/`);
    });
    expect(matched ?? parameterized).toBeDefined();
  });

  it('uses distinct views for login and registration', () => {
    const loginRoute = routes.find((route) => route.path === '/login');
    const registerRoute = routes.find((route) => route.path === '/register');

    expect(loginRoute?.component).toBeDefined();
    expect(registerRoute?.component).toBeDefined();
    expect(loginRoute?.component).not.toBe(registerRoute?.component);
  });
});
