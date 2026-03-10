import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-white font-semibold text-lg">
        <span className="text-emerald-400 text-xl">📍</span>
        Warble
      </Link>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-slate-400 text-sm hidden sm:block">
              {user.username}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm px-3 py-1.5 rounded text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
