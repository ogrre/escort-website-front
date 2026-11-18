import type { Locale } from './locale';

export function getAuthNotice(
  state: { registered?: boolean; verified?: boolean },
  locale: Locale,
): string {
  if (state.verified) {
    return locale === 'en'
      ? 'Your email address has been verified. You can now log in.'
      : 'Votre adresse e-mail a été vérifiée. Vous pouvez maintenant vous connecter.';
  }

  if (state.registered) {
    return locale === 'en'
      ? 'Account created. Check your email, then log in.'
      : 'Compte créé. Vérifiez votre e-mail, puis connectez-vous.';
  }

  return '';
}
