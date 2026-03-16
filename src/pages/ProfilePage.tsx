import { useAuth } from '../contexts/AuthContext'
import { useTokens } from '../contexts/TokenContext'
import { Link } from 'react-router-dom'

export default function ProfilePage() {
  const { user } = useAuth()
  const { tokens } = useTokens()

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">👤</div>
        <h1 className="text-2xl font-bold mb-3">Profile</h1>
        <p className="text-slate-400 mb-6">Please log in to view your profile.</p>
        <Link
          to="/settings"
          className="bg-amber-600 hover:bg-amber-700 px-6 py-2 rounded-lg transition"
        >
          Login
        </Link>
      </div>
    )
  }

  const initials = user.username
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)

  const roleBadge: Record<string, string> = {
    admin: 'bg-red-900 text-red-300',
    host: 'bg-purple-900 text-purple-300',
    vip: 'bg-amber-900 text-amber-300',
    user: 'bg-slate-700 text-slate-300',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Avatar & name */}
      <div className="bg-slate-800 rounded-xl p-8 text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-amber-600 flex items-center justify-center text-3xl font-bold mx-auto mb-4">
          {initials || '👤'}
        </div>
        <h1 className="text-2xl font-bold">{user.username}</h1>
        <p className="text-slate-400 text-sm mt-1">{user.email}</p>
        <span
          className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${roleBadge[user.role] ?? roleBadge.user}`}
        >
          {user.role.toUpperCase()}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-amber-400">
            {tokens?.balance.toLocaleString() ?? '—'}
          </div>
          <div className="text-slate-400 text-sm mt-1">Token Balance</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold">0</div>
          <div className="text-slate-400 text-sm mt-1">Auctions Won</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 text-center col-span-2 md:col-span-1">
          <div className="text-3xl font-bold">0</div>
          <div className="text-slate-400 text-sm mt-1">Bids Placed</div>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/auctions"
            className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            View Live Auctions
          </Link>
          <Link
            to="/games"
            className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Play Games
          </Link>
          <Link
            to="/settings"
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm transition"
          >
            Account Settings
          </Link>
        </div>
      </div>
    </div>
  )
}
