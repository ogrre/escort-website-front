export interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  email_verified_at?: string | null;
  age_confirmed_at?: string | null;
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null);
  const checked = useState('auth-checked', () => false);
  const api = usePublicApi();

  async function refresh(force = false) {
    if (!import.meta.client || (checked.value && !force)) return user.value;
    if (force) checked.value = false;
    checked.value = true;
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const response = await api<{ data?: AuthUser } | AuthUser>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      user.value = 'data' in response ? (response.data ?? null) : response;
    } catch {
      user.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return user.value;
  }

  async function logout() {
    const token = import.meta.client ? localStorage.getItem('token') : null;
    if (token) {
      await api('/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => undefined);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    user.value = null;
    checked.value = true;
    await navigateTo('/login');
  }

  return { user, checked, refresh, logout };
}
