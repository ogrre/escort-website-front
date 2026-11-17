import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export function normalizeSiteOrigin(origin) {
  return origin.replace(/\/+$/, '');
}

const apiBase = normalizeSiteOrigin(process.env.VITE_API_URL || 'http://localhost:8081/api/v1');
const siteOrigin = normalizeSiteOrigin(process.env.VITE_SITE_ORIGIN || 'http://localhost:5173');
const distRoot = resolve(process.cwd(), 'dist');

export function cityPath(locale, slug) {
  return `/${locale}/${locale === 'fr' ? 'villes' : 'cities'}/${encodeURIComponent(slug)}`;
}

export function cityMetadata(locale, city, origin = siteOrigin) {
  const name =
    locale === 'fr' ? `Profils à ${city.name} | Élégance` : `Profiles in ${city.name} | Élégance`;
  const description =
    locale === 'fr'
      ? `Découvrez les profils et annonces disponibles à ${city.name}.`
      : `Discover profiles and listings available in ${city.name}.`;
  return {
    title: name,
    description,
    canonical: `${normalizeSiteOrigin(origin)}${cityPath(locale, city.slug)}`,
  };
}

export function citySeoMetadata(locale, city, hasQuery = false, origin = siteOrigin) {
  return {
    ...cityMetadata(locale, city, origin),
    robots: hasQuery ? 'noindex,follow' : 'index,follow',
  };
}

export function renderCityContent(locale, city, profiles) {
  const french = locale === 'fr';
  const profileLinks = profiles
    .map((profile) => {
      const profileName = escapeHtml(profile.pseudo || profile.name || 'Profil');
      const cityName = escapeHtml(profile.city?.name || city.name);
      const uuid = encodeURIComponent(String(profile.id));
      const profilePath = french ? `/fr/profil/${uuid}` : `/en/profile/${uuid}`;
      const photo = profile.main_photo?.url || profile.main_photo?.thumbnail_url;
      const image = photo
        ? `<img src="${escapeHtml(photo)}" alt="${profileName}" width="180" height="240" loading="lazy">`
        : '';
      return `<a class="v2-listing-link" href="${profilePath}">${image}<span>${profileName}${profile.age ? `, ${escapeHtml(String(profile.age))}` : ''}</span><small>${cityName}</small></a>`;
    })
    .join('');
  return `<main class="v2-page v4-home"><section class="v2-wrap v4-home-intro city-seo-header"><p class="v2-eyebrow">${french ? 'Annuaire local · 18+' : 'Local directory · 18+'}</p><h1>${french ? 'Profils à' : 'Profiles in'} ${escapeHtml(city.name)}</h1><p class="v2-lead">${french ? 'Découvrez les profils et annonces disponibles à' : 'Discover profiles and listings available in'} ${escapeHtml(city.name)}.</p><p class="city-count">${escapeHtml(String(city.listings_count))} ${french ? 'annonces disponibles' : 'published profiles'}</p></section><section class="v2-wrap v2-listings" aria-labelledby="listings-title"><h2 id="listings-title">${french ? 'Profils à découvrir' : 'Profiles to discover'}</h2><div class="v2-listing-grid">${profileLinks}</div></section></main>`;
}

async function fetchJson(url) {
  let response;
  try {
    response = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch (error) {
    throw new Error(`Prerender API inaccessible (${url}): ${error.message}`);
  }
  if (!response.ok) throw new Error(`Prerender API returned HTTP ${response.status} for ${url}`);
  try {
    return await response.json();
  } catch {
    throw new Error(`Prerender API returned invalid JSON for ${url}`);
  }
}

async function fetchLocations() {
  const locations = [];
  let next = `${apiBase}/locations?has_listings=1&per_page=100`;
  while (next) {
    const payload = await fetchJson(next);
    locations.push(...(payload.data || []));
    next = payload.links?.next ? new URL(payload.links.next, apiBase).toString() : null;
  }
  const unique = new Map();
  for (const city of locations) {
    if (city?.slug && city?.name && Number(city.listings_count) > 0) unique.set(city.slug, city);
  }
  return [...unique.values()];
}

async function fetchProfiles(city) {
  const query = new URLSearchParams({
    city: city.slug,
    sort: 'recommended',
    limit: '24',
    page: '1',
  });
  const payload = await fetchJson(`${apiBase}/profiles/search?${query}`);
  return Array.isArray(payload.data) ? payload.data : [];
}

function replaceMeta(html, selector, tag) {
  const expression = new RegExp(`<meta[^>]+${selector}[^>]*>`, 'i');
  return html.replace(expression, tag);
}

function applyMetadata(html, locale, city) {
  const metadata = citySeoMetadata(locale, city, false, siteOrigin);
  let result = html.replace(/<html lang="[^"]*">/i, `<html lang="${locale}">`);
  result = result.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);
  result = replaceMeta(
    result,
    'name="description"',
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
  );
  result = replaceMeta(
    result,
    'name="robots"',
    `<meta name="robots" content="${metadata.robots}" />`,
  );
  result = replaceMeta(
    result,
    'property="og:title"',
    `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
  );
  result = replaceMeta(
    result,
    'property="og:description"',
    `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
  );
  result = `${result.replace('</head>', `<link rel="canonical" href="${escapeHtml(metadata.canonical)}" />\n</head>`)}`;
  return result.replace(
    '<div id="app"></div>',
    `<div id="app">${renderCityContent(locale, city, city.profiles || [])}</div>`,
  );
}

function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );
}

async function main() {
  const template = await readFile(resolve(distRoot, 'index.html'), 'utf8');
  const cities = await fetchLocations();
  for (const city of cities) {
    city.profiles = await fetchProfiles(city);
    for (const locale of ['fr', 'en']) {
      const output = resolve(distRoot, cityPath(locale, city.slug).slice(1), 'index.html');
      await mkdir(resolve(output, '..'), { recursive: true });
      await writeFile(output, applyMetadata(template, locale, city));
    }
  }
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const city of cities)
    for (const locale of ['fr', 'en'])
      sitemap.push(`  <url><loc>${siteOrigin}${cityPath(locale, city.slug)}</loc></url>`);
  sitemap.push('</urlset>');
  await writeFile(resolve(distRoot, 'sitemap.xml'), `${sitemap.join('\n')}\n`);
  console.log(`Prerendered ${cities.length} cities in French and English.`);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname))
  main().catch((error) => {
    console.error(`[prerender] ${error.message}`);
    process.exitCode = 1;
  });
