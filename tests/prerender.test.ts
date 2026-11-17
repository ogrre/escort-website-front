import { describe, expect, it } from 'vitest';
import {
  cityMetadata,
  cityPath,
  citySeoMetadata,
  renderCityContent,
} from '../scripts/prerender-cities.mjs';
import { citySitemapUrls } from '../src/lib/sitemap';

describe('city prerender contract', () => {
  const city = { name: 'Bordeaux', slug: 'bordeaux-33063', listings_count: 4 };

  it('generates French and English city routes', () => {
    expect(cityPath('fr', city.slug)).toBe('/fr/villes/bordeaux-33063');
    expect(cityPath('en', city.slug)).toBe('/en/cities/bordeaux-33063');
  });

  it('generates city-specific metadata and initial content', () => {
    expect(cityMetadata('fr', city)).toMatchObject({
      title: 'Profils à Bordeaux | Élégance',
      description: 'Découvrez les profils et annonces disponibles à Bordeaux.',
      canonical: 'http://localhost:5173/fr/villes/bordeaux-33063',
    });
    const html = renderCityContent('fr', city, [
      { id: 'profile-uuid', pseudo: 'Ana', age: 28, city: { name: 'Bordeaux' } },
    ]);
    expect(html).toContain('<h1>Profils à Bordeaux</h1>');
    expect(html).toContain('4 annonces disponibles');
    expect(html).toContain('/fr/profil/profile-uuid');
  });

  it('marks filtered city URLs noindex while keeping the city canonical', () => {
    expect(citySeoMetadata('fr', city, true)).toMatchObject({
      robots: 'noindex,follow',
      canonical: 'http://localhost:5173/fr/villes/bordeaux-33063',
    });
  });

  it('excludes empty cities and query URLs from the sitemap', () => {
    const urls = citySitemapUrls(
      [city, { name: 'Empty', slug: 'empty-00000', listings_count: 0 }],
      'https://example.com',
    );
    expect(urls).toEqual([
      'https://example.com/fr/villes/bordeaux-33063',
      'https://example.com/en/cities/bordeaux-33063',
    ]);
    expect(urls.join('\n')).not.toContain('?');
  });
});
