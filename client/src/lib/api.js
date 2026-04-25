// Centrální místo pro adresu API - dá se přepsat přes .env (VITE_API_URL)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Pomocné funkce pro volání API - automaticky přidají JWT token do hlavičky
function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(method, endpoint, body) {
  const opts = {
    method,
    headers: {
      ...authHeaders(),
      ...(body ? { 'Content-Type': 'application/json' } : {})
    }
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${endpoint}`, opts);
  let data = null;
  try { data = await res.json(); } catch (_) { /* response nemusí být JSON */ }

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
