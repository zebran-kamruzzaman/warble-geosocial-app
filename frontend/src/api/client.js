// All communication with the .NET API goes through this file.
// No other file knows the API URL or constructs fetch calls.

const API_URL = import.meta.env.VITE_API_URL

// Token is stored in localStorage so it survives page refreshes.
// On app load, useAuth reads it back out and restores the session.
let _token = localStorage.getItem('geosocial_token')

export const setToken = (token) => {
  _token = token
  if (token) {
    localStorage.setItem('geosocial_token', token)
  } else {
    localStorage.removeItem('geosocial_token')
  }
}

export const getToken = () => _token

// Builds request headers. Adds Authorization if a token exists.
const headers = () => ({
  'Content-Type': 'application/json',
  ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
})

// Auth
export async function register(username, email, password) {
  const res = await fetch(`${API_URL}/api/users/register`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ username, email, password }),
  })
  return res
}

// Returns { ok: true, token, username } or { ok: false, message }
export async function login(email, password) {
  const res = await fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (res.ok) setToken(data.token)
  return { ok: res.ok, ...data }
}

// Posts
export async function createPost(content, latitude, longitude) {
  const res = await fetch(`${API_URL}/api/posts`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ content, latitude, longitude }),
  })
  return res
}

// radius is in metres. Default 5000m (5km) gives a useful city-scale view.
export async function getNearbyPosts(lat, lng, radius = 5000) {
  const res = await fetch(
    `${API_URL}/api/posts/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
  )
  if (!res.ok) return []
  return res.json()
}
