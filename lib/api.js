// lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export function saveToken(token) {
  if (typeof window !== 'undefined') localStorage.setItem('token', token)
}

export function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem('token')
}

async function apiFetch(path, options = {}) {
  const token = getToken()

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg  = body.error || `Erro ${res.status}`
    const err  = new Error(msg)
    err.status = res.status
    throw err
  }

  if (res.status === 204) return null
  return res.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const getMe = () => apiFetch('/api/auth/me')

export async function logout() {
  clearToken()
}

// ─── Studies (público) ────────────────────────────────────────────────────────
export const getStudies   = (params = '') => apiFetch(`/api/studies${params}`)
export const getMyStudies = (params = '') => apiFetch(`/api/studies/mine${params}`)
export const getStudy     = (slug)        => apiFetch(`/api/studies/${slug}`)

// ─── Studies (admin) ─────────────────────────────────────────────────────────
export const createStudy = (data) =>
  apiFetch('/api/studies', { method: 'POST', body: JSON.stringify(data) })

export const updateStudy = (id, data) =>
  apiFetch(`/api/studies/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteStudy = (id) =>
  apiFetch(`/api/studies/${id}`, { method: 'DELETE' })

export const togglePublish = (id) =>
  apiFetch(`/api/studies/${id}/publish`, { method: 'PATCH' })

// ─── Charts (admin) ───────────────────────────────────────────────────────────
export const createChart = (studyId, data) =>
  apiFetch(`/api/studies/${studyId}/charts`, { method: 'POST', body: JSON.stringify(data) })

export const updateChart = (studyId, chartId, data) =>
  apiFetch(`/api/studies/${studyId}/charts/${chartId}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteChart = (studyId, chartId) =>
  apiFetch(`/api/studies/${studyId}/charts/${chartId}`, { method: 'DELETE' })

export const replacePoints = (studyId, chartId, points) =>
  apiFetch(`/api/studies/${studyId}/charts/${chartId}/points`, {
    method: 'PUT',
    body: JSON.stringify({ points }),
  })