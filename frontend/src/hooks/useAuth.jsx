import { createContext, useContext, useState } from 'react'
import { setToken, getToken } from '../api/client'

// Auth context makes the current user available to any component in the tree
// without passing props through every level.
const AuthContext = createContext(null)

// Reads the stored username from localStorage to restore the session on reload.
// The token itself is already restored in client.js; here we just restore
// the display name so the navbar shows the right username.
function getStoredUser() {
  const username = localStorage.getItem('geosocial_username')
  const token = getToken()
  if (username && token) return { username, token }
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)

  // Called after a successful login API response.
  // Decodes the username from the token payload (middle base64 segment).
  const login = (token) => {
    const payload = JSON.parse(atob(token.split('.')[1]))
    // The claim key matches what UserService sets: ClaimTypes.Name
    const username =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      payload.unique_name ||
      payload.name ||
      'User'

    setToken(token)
    localStorage.setItem('geosocial_username', username)
    setUser({ username, token })
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('geosocial_username')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
