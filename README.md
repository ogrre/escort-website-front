# Frontend

Vue 3 / TypeScript / Vite / Pinia / Tailwind.

## Variables Vercel

Configure the `VITE_*` variables from `.env.example` in the Vercel project settings for each
environment. The `VITE_LEGAL_*` values are public display information for the legal pages; they
must be completed before production. `VITE_API_URL` points the SPA to the Laravel API.

The production build also runs the city prerenderer. Set `VITE_SITE_ORIGIN` to the public HTTPS
origin used for canonical URLs and the sitemap (for example, `https://example.com`). The build
reads active cities and their profiles from `VITE_API_URL`; it fails with an explicit error when
the Laravel API cannot be reached.

`VITE_SITE_ORIGIN` must be set to `https://example.com` in production. It is used as the origin
for canonical URLs and sitemap entries for both `/fr/villes/:citySlug` and `/en/cities/:citySlug`.
The local fallback is `http://localhost:5173`; trailing slashes are removed so generated URLs do
not contain double slashes.
