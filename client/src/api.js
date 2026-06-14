const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('cms_token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || res.statusText);
  return body;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getContentTypes: () => request('/content-types'),
  createContentType: (data) =>
    request('/content-types', { method: 'POST', body: JSON.stringify(data) }),
  updateContentType: (id, data) =>
    request(`/content-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContentType: (id) => request(`/content-types/${id}`, { method: 'DELETE' }),

  getEntries: (contentType) => request(`/entries/${contentType}`),
  getEntry: (contentType, id) => request(`/entries/${contentType}/${id}`),
  createEntry: (contentType, data, status) =>
    request(`/entries/${contentType}`, { method: 'POST', body: JSON.stringify({ data, status }) }),
  updateEntry: (contentType, id, data, status) =>
    request(`/entries/${contentType}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data, status }),
    }),
  deleteEntry: (contentType, id) => request(`/entries/${contentType}/${id}`, { method: 'DELETE' }),
};

export { getToken };
