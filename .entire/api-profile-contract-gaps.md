# API profile contract gaps for the Nuxt public profile

Status: handoff note for the API repository
Date: 2026-11-19
Frontend branch: `feat/refactor-interface-ui-ux`
API branch inspected: `feat/api-audit-profile-coverage`

## Objective

The Nuxt profile page must expose the same useful information as the legacy public profile page, while keeping a simpler mobile-first layout. This note lists the API work still needed before the frontend can complete that parity.

The comparison was made against two different profiles, so values must not be compared literally. The comparison concerns response capabilities and public information blocks.

## Already available in the API

The following data is already present in `ListingResource` and should be consumed by the frontend rather than duplicated in another endpoint:

- `description`, `age`, `city`, `working_cities`;
- `services`, `styles`, `interested_in`;
- `weekly_hours` and `availability`;
- `languages` and `profile_languages` with language levels;
- `contacts`, filtered to enabled contacts for public visitors;
- `height_cm`, `weight_kg`, `eye_color`, `hair_color`, `breast_type`, `cup_size`;
- `intimate_grooming`, `smoking`, `alcohol`;
- `has_video`, `video_url`;
- `verified` / `is_photo_verified`;
- ordered `photos` with UUID, URL, alt text, position and `is_main`;
- approved `comments` when the relation is loaded;
- `published_at`, `expires_at`, publication status and status labels;
- UUID-based profile, photo and comment identifiers.

The current frontend does not yet render every field. In particular, languages, language levels and some publication metadata are frontend follow-up work, not API gaps.

## API gaps for profile parity

### 1. Stable public profile detail contract

The frontend currently calls `GET /api/v1/profiles/{listingUuid}`, which returns `ListingResource`. Add or document a stable public detail contract, either by extending this response or by introducing a dedicated `PublicProfileResource`.

The response should provide these fields with stable names:

```json
{
  "id": "listing-uuid",
  "reference": "3128199",
  "name": "Inesss59",
  "age": 24,
  "gender": "female",
  "is_online": true,
  "last_online": "2026-11-18T21:45:00Z",
  "joined_at": "2026-05-12T00:00:00Z",
  "updated_at": "2026-11-18T20:00:00Z",
  "status": "published",
  "status_label": "Published",
  "is_photo_verified": true,
  "is_exclusive": false,
  "tier": null,
  "share_url": null
}
```

Notes:

- `reference` may use the public listing numeric reference if that concept exists; it must not replace the UUID used by API routes.
- `joined_at` should be a public-safe timestamp derived from `created_at` or a dedicated publication date.
- `is_online` must be explicit. The frontend currently infers it from `last_online`, which is not equivalent to “online now”.
- `status` must not expose private moderation or subscription details. Non-public listings should continue to be hidden or return the documented public error.
- `tier` must expose only the public advertising tier label if that concept is part of the product. Do not expose billing or payment internals.

### 2. Public actions

The legacy profile exposes Message, Favorites, Follow, Top 50, Report and Share/copy-link actions. The API currently exposes comments and comment reports, but no listing-level endpoints for these actions.

Decide and document the required public actions:

- `POST/DELETE /profiles/{uuid}/favorite`;
- `POST/DELETE /profiles/{uuid}/follow`;
- `POST/DELETE /profiles/{uuid}/top` if Top 50 remains a product feature;
- `POST /profiles/{uuid}/report` or an equivalent report resource;
- Share/copy-link needs no API if `share_url` can be built from the public UUID, but the canonical URL format must be documented.

All mutating actions must require authentication and use UUIDs. Add authorization, idempotency and feature tests before frontend integration.

### 3. Public profile media metadata

The API already returns ordered photos. To match the legacy media block, document or add:

- a stable `is_main` guarantee after reorder;
- explicit `is_approved` / public visibility semantics without exposing moderation internals;
- optional media type and video metadata if video is displayed in the gallery;
- a public photo-verification or reverse-image-check URL only if that feature is intended to remain in the new product.

The frontend must never reconstruct media URLs from storage paths or numeric IDs.

### 4. Similar profiles

The frontend currently approximates similar profiles with `GET /profiles/search?city=...`. This is acceptable for the first version, but it is not a stable “similar profiles” contract.

Either:

- document the search query as the supported recommendation fallback; or
- add `GET /api/v1/profiles/{uuid}/similar` with public, ranked, paginated results.

The response must exclude the current profile and preserve publication, subscription and moderation visibility rules.

### 5. Detail response consistency

`ProfileResource` used by `/profiles/search` is intentionally card-oriented and currently omits full detail fields such as contacts, description, full photos, comments and language levels. This is fine for cards, but must be explicit in the contract.

The API should document two shapes:

- `ProfileCardResource` for city/search pages;
- `PublicProfileResource` / `ListingResource` for profile detail.

Avoid making the frontend infer whether a response is a card or detail payload from optional fields.

## Data quality checks

The supplied Nuxt HTML showed `Gender —` for one profile while other fields were populated. Verify seed and API data quality for:

- gender;
- nationality and ethnicity;
- languages and language levels;
- `last_online` versus current online state;
- public contacts and phone visibility;
- photo verification flags;
- active publication and subscription status.

Missing values should be returned as `null` or empty arrays consistently, never as undocumented alternate shapes.

## Required API changes and validation

For each API change:

1. Update `../api/docs/api-contract.md`.
2. Add or update Laravel feature tests for public serialization and authorization.
3. Add response-shape assertions for both `/profiles/search` and `/profiles/{uuid}`.
4. Verify that private fields remain hidden for anonymous visitors.
5. Run the API test suite, lint/static analysis and build checks configured by the API repository.
6. State the exact frontend fields or endpoints that become available in the API PR description.

## Frontend follow-up after API changes

- Render languages and levels.
- Render reference, joined date and last-online details.
- Render public tier and profile status when the API contract is available.
- Add share/copy-link, follow, Top 50 and report actions when their endpoints exist.
- Add links for base and working cities.
- Complete the media verification block only if its API contract is approved.
- Add profile JSON-LD/Breadcrumb metadata after the canonical public detail fields are stable.
