import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTokens } from '../contexts/TokenContext'
import { Menu, Radio, Gamepad2, Gavel, User, Shield } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { user, logout } = useAuth()
  const { tokens } = useTokens()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-slate-900 border-b border-amber-900/50 sticky top-0 z-50">
      {/* Top accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700" />

      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand */}
        <Link to="/" className="flex flex-col leading-tight">
          <span className="text-xl font-bold text-amber-400 tracking-wide">
            🃏 The Keeper's Saloon
          </span>
          <span className="text-xs text-amber-700 tracking-widest uppercase">Est. 2026 · 21+ Only</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
          <Link to="/live" className="flex items-center gap-1.5 hover:text-amber-400 transition text-slate-300">
            <Radio size={15} className="text-red-500" />
            Live Streams
          </Link>
          <Link to="/auctions" className="flex items-center gap-1.5 hover:text-amber-400 transition text-slate-300">
            <Gavel size={15} />
            Auctions
          </Link>
          <Link to="/games" className="flex items-center gap-1.5 hover:text-amber-400 transition text-slate-300">
            <Gamepad2 size={15} />
            Games
          </Link>
          <Link to="/game" className="flex items-center gap-1.5 hover:text-amber-400 transition text-slate-300">
            🎮 3D Lobby
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-1.5 hover:text-red-400 transition text-red-500">
              <Shield size={15} />
              Admin
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Token balance */}
          {tokens && user && (
            <div className="hidden sm:flex items-center gap-1 bg-amber-900/40 border border-amber-700/50 px-3 py-1 rounded-full text-sm">
              <span className="text-amber-400 font-bold">🪙 {tokens.balance.toLocaleString()}</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="flex items-center gap-1.5 text-sm hover:text-amber-400 transition text-slate-300">
                <User size={15} />
                <span className="hidden sm:inline">{user.username}</span>
                {user.role === 'vip' && <span className="text-xs bg-amber-600 px-1.5 py-0.5 rounded text-white">VIP</span>}
              </Link>
              <button
                onClick={() => logout()}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm transition text-slate-300"
              >
                Leave
              </button>
            </div>
          ) : (
            <Link
              to="/settings"
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-sm transition"
            >
              Enter Saloon
            </Link>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-slate-800 border-t border-slate-700 p-4 space-y-3 text-sm">
          <Link to="/live" className="flex items-center gap-2 hover:text-amber-400 py-1">
            <Radio size={15} className="text-red-500" /> Live Streams
          </Link>
          <Link to="/auctions" className="flex items-center gap-2 hover:text-amber-400 py-1">
            <Gavel size={15} /> Auctions
          </Link>
          <Link to="/games" className="flex items-center gap-2 hover:text-amber-400 py-1">
            <Gamepad2 size={15} /> Games
          </Link>
          <Link to="/game" className="flex items-center gap-2 hover:text-amber-400 py-1">
            🎮 3D Lobby
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-2 hover:text-red-400 py-1 text-red-400">
              <Shield size={15} /> Admin
            </Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 hover:text-amber-400 py-1">
                <User size={15} /> Profile
              </Link>
              <button onClick={() => logout()} className="text-slate-400 hover:text-white py-1">
                Leave Saloon
              </button>
            </>
          ) : (
            <Link to="/settings" className="block py-1 text-amber-400 font-semibold">
              Enter Saloon →
            </Link>
          )}
        </nav>
      )}

      {/* Bottom accent bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-800/40 to-transparent" />
    </header>
  )
}
