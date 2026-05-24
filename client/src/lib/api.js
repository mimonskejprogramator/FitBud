
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request(method, endpoint, body) {
  const opts = {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : {}
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${endpoint}`, opts);
  let data = null;
  try { data = await res.json(); } catch (_) { }

  if (!res.ok) {
    const err = new Error((data && data.error) || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (endpoint) => request('GET', endpoint),
  post: (endpoint, body) => request('POST', endpoint, body),
  put: (endpoint, body) => request('PUT', endpoint, body),
  del: (endpoint) => request('DELETE', endpoint),
};

export async function fetchCurrentUser() {
  const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user || null;
}

export async function logoutRequest() {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (_) { }
}
