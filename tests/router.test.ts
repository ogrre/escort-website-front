import { describe, expect, it } from 'vitest';
import { routes } from '../src/router';
import { cityPath, citySearchPath } from '../src/lib/city-links';

const publicPaths = [
  '/',
  '/register',
  '/login',
  '/fr/villes/bordeaux-33063',
  '/en/cities/bordeaux-33063',
  '/fr/villes',
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

  it('redirects the legacy search route to the home search', () => {
    expect(routes.find((route) => route.path === '/search')?.redirect).toBe('/');
  });

  it('never redirects a city display name into a city SEO route', () => {
    const redirect = routes.find((route) => route.path === '/cities/:citySlug')?.redirect;
    expect(typeof redirect).toBe('function');
    expect(
      (redirect as (to: { params: Record<string, string> }) => string)({
        params: { citySlug: 'Bordeaux' },
      }),
    ).toBe('/');
    expect(
      (redirect as (to: { params: Record<string, string> }) => string)({
        params: { citySlug: 'bordeaux-33063' },
      }),
    ).toBe('/fr/villes/bordeaux-33063');
  });

  it('builds locale-aware city links from official slugs', () => {
    expect(cityPath('fr', 'bordeaux-33063')).toBe('/fr/villes/bordeaux-33063');
    expect(cityPath('en', 'bordeaux-33063')).toBe('/en/cities/bordeaux-33063');
    expect(cityPath('fr', 'orleans-45234')).not.toContain('Orleans');
    expect(cityPath('en', 'bordeaux 33063')).toBe('/en/cities/bordeaux%2033063');
  });

  it('keeps the active locale when submitting a selected city search', () => {
    expect(citySearchPath('fr', 'bordeaux-33063', { gender: 'femme' })).toBe(
      '/fr/villes/bordeaux-33063?gender=femme',
    );
    expect(citySearchPath('en', 'bordeaux-33063', { gender: 'femme' })).toBe(
      '/en/cities/bordeaux-33063?gender=femme',
    );
  });
});
