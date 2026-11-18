# Nuxt 4 migration — step 1

The frontend now uses Nuxt 4.5.2, TypeScript and the Vercel Nitro preset. Deploy with `nuxt build`; do not use `nuxt generate` because public pages need SSR and ISR.

## Rendering and indexation

| Route | Rendering/cache | Indexation |
| --- | --- | --- |
| `/` | SSR + Vercel ISR 300 s | `index,follow` |
| `/fr/villes`, `/en/cities` | SSR + ISR 3600 s | `index,follow` |
| `/fr/villes/:citySlug`, `/en/cities/:citySlug` | SSR + ISR 300 s | index only without meaningful filters |
| `/fr/profil/:uuid`, `/en/profile/:uuid` | SSR + ISR 60 s | public profiles only; API controls publication |
| `/dashboard/**`, auth, admin | CSR/no-store where private | `noindex`; never in sitemap |
| `/robots.txt`, `/sitemap.xml` | Dynamic Nitro routes | API-backed; no static city list |

Filtered city pages use `noindex,follow` and canonicalize to the clean city URL. Pagination retains crawlable links and is not blindly canonicalized to page one, because pages can contain distinct profiles. The sitemap currently includes public eligible locations; profile sitemap inclusion requires a confirmed API endpoint for enumerating all active public profile UUIDs.

ISR is time-based only in this step. Laravel does not currently provide a frontend revalidation webhook or tag contract, so publication/suspension changes may remain stale for the configured window. API authorization and publication state remain authoritative; a backend notification plus targeted Vercel revalidation should be added when the API contract exists.

## Legacy route map

| Previous route | Nuxt route/strategy |
| --- | --- |
| `/search`, `/recherche` | 301-equivalent server redirect rule to `/` |
| `/compte` | redirect to `/login` |
| `/profile` | redirect to `/dashboard` |
| `/cities/:citySlug` | redirect to `/fr/villes` (invalid display-name slugs are not promoted) |
| `/fr/villes/:citySlug`, `/fr/profil/:uuid` | preserved |
| `/en/cities/:citySlug`, `/en/profile/:uuid` | preserved |

The API contract currently confirms `locations` and profile detail/search shapes through repository fixtures. Password reset, verify-email and comments retrieval/posting do not have complete frontend page/API evidence in this repository and were not invented in this migration. Existing dashboard, photo, Yoti and subscription components remain available behind the Nuxt routes and still call Laravel with the existing Bearer token flow.

## Adult access and previews

`rating=adult` is emitted globally. This does not replace legal age controls: the existing local age gate and Yoti flow remain application responsibilities. Preview Vercel hosts are disallowed in `robots.txt`; production must set `NUXT_PUBLIC_SITE_URL` to the HTTPS canonical origin. No auth token is placed in `runtimeConfig.public`, and public SSR requests never read `localStorage`.
