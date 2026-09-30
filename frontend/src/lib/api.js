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

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Backend tidak dapat dijangkau. Pastikan server backend berjalan.');
  }
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Terjadi kesalahan pada server');
  }
  return payload;
}

export function saveSession(response = {}) {
  const session = response.data || response;
  const { token, user } = session;
  const sessionToken = token;
  const sessionUser = session.user || user || (session.id ? {
    id: session.id,
    full_name: session.full_name,
    email: session.email,
    role: session.role,
    is_verified: session.is_verified,
  } : null);
  if (!sessionToken) throw new Error('Token login tidak ditemukan dari backend');
  localStorage.setItem('bekal_token', sessionToken);
  localStorage.setItem('bekal_user', JSON.stringify(sessionUser));
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
