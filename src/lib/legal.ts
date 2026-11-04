const env = import.meta.env;

export const legal = {
  publisherName: env.VITE_LEGAL_PUBLISHER_NAME || '[Nom légal à compléter]',
  publisherForm: env.VITE_LEGAL_PUBLISHER_FORM || '[Forme juridique et capital à compléter]',
  publisherAddress: env.VITE_LEGAL_PUBLISHER_ADDRESS || '[Adresse à compléter]',
  publisherEmail: env.VITE_LEGAL_PUBLISHER_EMAIL || '[E-mail de contact à compléter]',
  registration: env.VITE_LEGAL_REGISTRATION || '[Numéro d’immatriculation à compléter]',
  hostName: env.VITE_LEGAL_HOST_NAME || '[Nom de l’hébergeur à compléter]',
  hostAddress: env.VITE_LEGAL_HOST_ADDRESS || '[Coordonnées de l’hébergeur à compléter]',
  privacyEmail: env.VITE_LEGAL_PRIVACY_EMAIL || '[Adresse de contact RGPD à compléter]',
  updatedAt: env.VITE_LEGAL_UPDATED_AT || '4 novembre 2026',
};
