import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTokens } from '../contexts/TokenContext'
import { Menu } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { user, logout } = useAuth()
  const { tokens } = useTokens()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-amber-500">
          CoinKeepers<span className="text-white">Auction</span>
        </Link>

        <nav className="hidden md:flex gap-8 items-center">
          <Link to="/auctions" className="hover:text-amber-500 transition">
            Auctions
          </Link>
          <Link to="/game" className="hover:text-amber-500 transition">
            🎮 Game Lobby
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="hover:text-amber-500 transition">
              Admin
            </Link>
          )}
          {user && (
            <Link to="/settings" className="hover:text-amber-500 transition">
              Settings
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {tokens && (
            <div className="text-sm bg-amber-600 px-3 py-1 rounded">
              {tokens.balance} Tokens
            </div>
          )}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">{user.username}</span>
              <button
                onClick={() => logout()}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/settings"
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 rounded transition"
            >
              Login
            </Link>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="md:hidden bg-slate-700 p-4 space-y-2">
          <Link to="/auctions" className="block hover:text-amber-500">
            Auctions
          </Link>
          <Link to="/game" className="block hover:text-amber-500">
            🎮 Game Lobby
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="block hover:text-amber-500">
              Admin
            </Link>
          )}
          {user && (
            <Link to="/settings" className="block hover:text-amber-500">
              Settings
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
