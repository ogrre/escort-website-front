function setMeta(name: string, content: string, attribute = 'name') {
  const selector = `meta[${attribute}="${name}"]`;
  const meta = document.querySelector(selector) ?? document.createElement('meta');
  meta.setAttribute(attribute, name);
  meta.setAttribute('content', content);
  document.head.appendChild(meta);
}

export function setSeo(options: { title: string; description: string; canonical?: string }) {
  document.title = options.title;
  setMeta('description', options.description);
  setMeta('og:title', options.title, 'property');
  setMeta('og:description', options.description, 'property');
  if (options.canonical) {
    const canonical =
      document.querySelector('link[rel="canonical"]') ?? document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', options.canonical);
    document.head.appendChild(canonical);
    setMeta('og:url', options.canonical, 'property');
  }
}
