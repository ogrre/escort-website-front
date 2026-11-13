import { describe, expect, it } from 'vitest';
import { getAuthNotice } from '../src/lib/auth-feedback';

describe('authentication feedback', () => {
  it('returns the French email verification confirmation', () => {
    expect(getAuthNotice({ verified: true }, 'fr')).toBe(
      'Votre adresse e-mail a été vérifiée. Vous pouvez maintenant vous connecter.',
    );
  });

  it('returns the English email verification confirmation', () => {
    expect(getAuthNotice({ verified: true }, 'en')).toBe(
      'Your email address has been verified. You can now log in.',
    );
  });

  it('prioritizes verification feedback over registration feedback', () => {
    expect(getAuthNotice({ registered: true, verified: true }, 'en')).toContain('verified');
  });
});
