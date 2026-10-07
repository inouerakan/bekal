import { apiFetch, getStoredUser, saveSession } from './api';

export async function refreshSession() {
  const current = getStoredUser();
  if (!current) return null;

  try {
    const session = await apiFetch('/api/auth/me');
    saveSession(session);
    const updated = getStoredUser();

    if (!updated || updated.role !== current.role) {
      window.dispatchEvent(new Event('bekal-auth-change'));
    }

    return updated;
  } catch {
    return getStoredUser();
  }
}