import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTokens } from '../contexts/TokenContext'
import AuthModal from '../components/AuthModal'
import TokenShop from '../components/TokenShop'
import { User, Mail, Shield, Coins } from 'lucide-react'

type SettingsTab = 'profile' | 'tokens'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { tokens } = useTokens()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [showAuth, setShowAuth] = useState(false)

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-3xl font-bold mb-3">Settings</h1>
        <p className="text-slate-400 mb-6">Please log in to manage your account settings.</p>
        <button
          onClick={() => setShowAuth(true)}
          className="bg-amber-600 hover:bg-amber-700 px-8 py-3 rounded-lg font-bold transition"
        >
          Login / Create Account
        </button>
        {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  const tabs = [
    { key: 'profile' as SettingsTab, label: 'Profile', icon: User },
    { key: 'tokens' as SettingsTab, label: 'Buy Coins', icon: Coins },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>

      {/* Tab bar */}
      <div className="flex gap-2 mb-8 border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition ${
              activeTab === tab.key
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-amber-400">Account Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-slate-700 rounded-lg p-4">
                <User className="text-slate-400" size={20} />
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Username</div>
                  <div className="font-medium">{user.username}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-700 rounded-lg p-4">
                <Mail className="text-slate-400" size={20} />
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Email</div>
                  <div className="font-medium">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-700 rounded-lg p-4">
                <Shield className="text-slate-400" size={20} />
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Role</div>
                  <div className="font-medium capitalize">{user.role}</div>
                </div>
              </div>
              {tokens && (
                <div className="flex items-center gap-3 bg-slate-700 rounded-lg p-4">
                  <span className="text-xl">🪙</span>
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Token Balance</div>
                    <div className="font-medium text-amber-400">
                      {tokens.balance.toLocaleString()} Tokens
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-amber-400">Quick Links</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/profile"
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm transition"
              >
                View Profile
              </Link>
              <button
                onClick={() => setActiveTab('tokens')}
                className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                🪙 Buy More Tokens
              </button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h2>
            <button
              onClick={() => logout()}
              className="bg-red-900 hover:bg-red-800 text-red-200 px-6 py-2 rounded-lg text-sm transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Buy Coins tab */}
      {activeTab === 'tokens' && <TokenShop />}
    </div>
  )
}
