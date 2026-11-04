export function setSeo(options: { title: string; description: string; canonical?: string }) {
  document.title = options.title;
  const description =
    document.querySelector('meta[name="description"]') ?? document.createElement('meta');
  description.setAttribute('name', 'description');
  description.setAttribute('content', options.description);
  document.head.appendChild(description);
  if (options.canonical) {
    const canonical =
      document.querySelector('link[rel="canonical"]') ?? document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', options.canonical);
    document.head.appendChild(canonical);
  }
}
