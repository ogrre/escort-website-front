export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'citySlug') ?? '';
  if (!/^[a-z0-9]+-\d+$/.test(slug))
    throw createError({ statusCode: 404, statusMessage: 'City not found' });
  return sendRedirect(event, `/fr/villes/${encodeURIComponent(slug)}`, 308);
});
