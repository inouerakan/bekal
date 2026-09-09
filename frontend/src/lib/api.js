const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('bekal_token');
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Terjadi kesalahan pada server');
  }
  return payload;
}

export function saveSession({ token, user }) {
  localStorage.setItem('bekal_token', token);
  localStorage.setItem('bekal_user', JSON.stringify(user));
  window.dispatchEvent(new Event('bekal-auth-change'));
}

export function clearSession() {
  localStorage.removeItem('bekal_token');
  localStorage.removeItem('bekal_user');
  window.dispatchEvent(new Event('bekal-auth-change'));
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('bekal_user'));
  } catch {
    return null;
  }
}
