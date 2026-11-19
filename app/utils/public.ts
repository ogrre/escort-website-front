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
  const photo =
    typeof profile.main_photo === 'string'
      ? profile.main_photo
      : (profile.main_photo?.thumbnail_url ?? profile.main_photo?.url);
  const photos = Array.isArray(profile.photos)
    ? profile.photos
        .map((item: any) => ({
          id: item.id ?? item.uuid,
          url: item.thumbnail_url ?? item.url,
          alt: item.alt ?? name,
        }))
        .filter((item: any) => item.url)
    : photo
      ? [{ url: photo, alt: name }]
      : [];
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
    services: Array.isArray(profile.services) ? profile.services : [],
    photos,
    verified: Boolean(profile.is_verified ?? profile.verified),
    boosted: Boolean(profile.boosted),
    status_text: profile.status_text,
    languages: profile.languages,
    tags: profile.tags,
    contacts: profile.contacts,
    comments: profile.comments,
    gender: profile.gender,
    nationality: profile.nationality?.name ?? profile.nationality,
    ethnicity: profile.ethnicity?.name ?? profile.ethnicity,
    height_cm: profile.height_cm,
    weight_kg: profile.weight_kg,
    eye_color: profile.eye_color,
    hair_color: profile.hair_color,
    cup_size: profile.cup_size,
    intimate_grooming: profile.intimate_grooming,
    smoking: profile.smoking,
    alcohol: profile.alcohol,
    styles: Array.isArray(profile.styles) ? profile.styles : [],
    interested_in: Array.isArray(profile.interested_in) ? profile.interested_in : [],
    weekly_hours: profile.weekly_hours,
    working_cities: Array.isArray(profile.working_cities) ? profile.working_cities : [],
    receives: Boolean(profile.receives ?? profile.incall),
    outcalls: Boolean(profile.outcalls ?? profile.outcall),
    last_online: profile.last_online,
    updated_at: profile.updated_at,
    views: profile.views,
    has_video: Boolean(profile.has_video),
  };
}

export function canonicalSiteUrl(path: string, siteUrl?: string) {
  const baseUrl = siteUrl ?? String(useRuntimeConfig().public.siteUrl);
  return `${baseUrl.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

export function cityPath(slug: string, locale = 'fr') {
  return `/${locale === 'fr' ? 'fr/villes' : 'en/cities'}/${encodeURIComponent(slug)}`;
}

/** Human-readable route key; Laravel's opaque location slug remains API-only. */
export function cityRouteSlug(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr')
    .replace(/[’']/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const frenchProfileLabels: Record<string, string> = {
  woman: 'Femme',
  women: 'Femmes',
  female: 'Femme',
  man: 'Homme',
  men: 'Hommes',
  male: 'Homme',
  couple: 'Couple',
  trans: 'TV / TS',
  tvts: 'TV / TS',
  verified: 'Vérifié',
  yes: 'Oui',
  no: 'Non',
  occasional: 'Occasionnel',
  social: 'Social',
  natural: 'Naturelle',
  shaved: 'Épilée',
  partial: 'Partielle',
  receives: 'Reçoit',
  outcall: 'Se déplace',
  dinner: 'Dîner',
  massage: 'Massage',
  companionship: 'Compagnie',
  conversation: 'Conversation',
  travel: 'Voyage',
  event: 'Événement',
  photo: 'Photo',
  sporty: 'Sportif',
  glamorous: 'Glamour',
  elegant: 'Élégant',
  caucasian: 'Caucasien',
  french: 'Française',
  estonian: 'Estonienne',
  hazel: 'Noisette',
  brown: 'Marron',
  black: 'Noir',
  blonde: 'Blond',
  blond: 'Blond',
  brunette: 'Brun',
  chestnut: 'Châtain',
  silicone: 'Silicone',
  fully_shaved: 'Entièrement rasée',
  fully_shaven: 'Entièrement rasée',
  both: 'Hommes et femmes',
  online: 'En ligne',
  available: 'Disponible',
};

const englishProfileLabels: Record<string, string> = {
  woman: 'Woman',
  women: 'Women',
  femme: 'Woman',
  femmes: 'Women',
  female: 'Woman',
  man: 'Man',
  men: 'Men',
  homme: 'Man',
  hommes: 'Men',
  male: 'Man',
  couple: 'Couple',
  trans: 'TV / TS',
  tvts: 'TV / TS',
  verified: 'Verified',
  yes: 'Yes',
  oui: 'Yes',
  no: 'No',
  non: 'No',
  occasional: 'Occasionally',
  occasionnel: 'Occasionally',
  social: 'Social',
  natural: 'Natural',
  naturelle: 'Natural',
  shaved: 'Shaved',
  epilee: 'Shaved',
  partial: 'Partial',
  partielle: 'Partial',
  receives: 'Receives',
  recoit: 'Receives',
  outcall: 'Travels',
  se_deplace: 'Travels',
  dinner: 'Dinner',
  diner: 'Dinner',
  massage: 'Massage',
  companionship: 'Companionship',
  compagnie: 'Companionship',
  conversation: 'Conversation',
  travel: 'Travel',
  voyage: 'Travel',
  event: 'Event',
  evenement: 'Event',
  photo: 'Photo',
  sporty: 'Sporty',
  glamourous: 'Glamorous',
  glamorous: 'Glamorous',
  glamour: 'Glamorous',
  elegant: 'Elegant',
  caucasian: 'Caucasian',
  caucasien: 'Caucasian',
  french: 'French',
  francaise: 'French',
  estonian: 'Estonian',
  estonienne: 'Estonian',
  hazel: 'Hazel',
  noisette: 'Hazel',
  brown: 'Brown',
  marron: 'Brown',
  black: 'Black',
  noir: 'Black',
  blonde: 'Blonde',
  blond: 'Blonde',
  brunette: 'Brunette',
  brun: 'Brunette',
  chestnut: 'Chestnut',
  chatain: 'Chestnut',
  silicone: 'Silicone',
  fully_shaved: 'Fully shaved',
  fully_shaven: 'Fully shaved',
  entierement_rasee: 'Fully shaved',
  both: 'Men and women',
  online: 'Online',
  en_ligne: 'Online',
  available: 'Available',
  disponible: 'Available',
};

function profileValueKey(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function translateProfileValue(value: unknown, locale = 'fr'): string {
  const text = String(value ?? '');
  const key = profileValueKey(value);
  return (locale === 'fr' ? frenchProfileLabels[key] : englishProfileLabels[key]) ?? text;
}
export function profilePath(uuid: string, locale = 'fr') {
  return `/${locale === 'fr' ? 'fr/profil' : 'en/profile'}/${encodeURIComponent(uuid)}`;
}
