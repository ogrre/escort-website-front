import type { Listing } from '../../src/stores/listings';
import type { ApiLocation } from '../../src/lib/locations';
import { normalizeLocations } from '../../src/lib/locations';

export type ApiEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
  links?: Record<string, string | null>;
};

export function locationList(value: ApiEnvelope<ApiLocation[]> | ApiLocation[]) {
  return normalizeLocations(Array.isArray(value) ? value : value.data);
}

export function normalizePublicProfile(profile: Record<string, any>): Listing {
  const name = profile.pseudo ?? profile.name ?? '';
  const photo = profile.main_photo?.thumbnail_url ?? profile.main_photo?.url;
  const photos = profile.photos ?? (photo ? [{ url: photo, alt: name }] : []);
  const city =
    typeof profile.city === 'string'
      ? profile.city
      : (profile.city?.name ?? profile.location?.name ?? '');
  return {
    id: String(profile.id),
    name,
    description: profile.short_bio ?? profile.description ?? '',
    age: profile.age ?? 0,
    city,
    country: profile.country?.name ?? profile.country,
    services: profile.services ?? [],
    photos,
    verified: Boolean(profile.is_verified ?? profile.verified),
    boosted: Boolean(profile.boosted),
    status_text: profile.status_text,
    languages: profile.languages,
    tags: profile.tags,
    contacts: profile.contacts,
    comments: profile.comments,
  };
}

export function canonicalSiteUrl(path: string) {
  const config = useRuntimeConfig();
  return `${String(config.public.siteUrl).replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

export function cityPath(slug: string, locale = 'fr') {
  return `/${locale === 'fr' ? 'fr/villes' : 'en/cities'}/${encodeURIComponent(slug)}`;
}
export function profilePath(uuid: string, locale = 'fr') {
  return `/${locale === 'fr' ? 'fr/profil' : 'en/profile'}/${encodeURIComponent(uuid)}`;
}
