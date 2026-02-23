import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTokens } from '../contexts/TokenContext'
import { tokenService } from '../services/tokenService'
import { CoinTransaction } from '../types/token'

export default function ProfilePage() {
  const { user } = useAuth()
  const { tokens } = useTokens()
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<CoinTransaction[]>([])
  const [txLoading, setTxLoading] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/settings')
      return
    }
    setTxLoading(true)
    setTxError(null)
    tokenService
      .getTransactionHistory(user.id, 20)
      .then(setTransactions)
      .catch(() => setTxError('Failed to load transaction history.'))
      .finally(() => setTxLoading(false))
  }, [user, navigate])

  if (!user) return null

  const isCredit = (type: CoinTransaction['type']) =>
    type === 'earn' || type === 'transfer_in'

  const txColorClass = (type: CoinTransaction['type']) =>
    isCredit(type) ? 'text-green-400' : 'text-red-400'

  const txBadgeClass = (type: CoinTransaction['type']) =>
    isCredit(type) ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'

  const roleBadgeClass: Record<string, string> = {
    admin: 'bg-red-900/40 text-red-400 border border-red-700',
    host: 'bg-purple-900/40 text-purple-400 border border-purple-700',
    vip: 'bg-amber-900/40 text-amber-400 border border-amber-700',
    user: 'bg-slate-700 text-slate-300',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Profile header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{user.username}</h1>
            <p className="text-slate-400 text-sm mb-3">{user.email}</p>
            <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${roleBadgeClass[user.role] ?? roleBadgeClass.user}`}>
              {user.role}
            </span>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-amber-400 mb-1">
              🪙 {tokens?.balance ?? 0}
            </div>
            <div className="text-xs text-slate-400">Keepers Coins</div>
            {tokens && tokens.safe_balance > 0 && (
              <div className="text-xs text-slate-400 mt-1">
                Safe: 🪙 {tokens.safe_balance}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-500">
          Member since {new Date(user.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => navigate('/game')}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2 rounded-lg transition"
        >
          Enter Game
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2 rounded-lg transition"
        >
          Settings
        </button>
      </div>

      {/* Transaction history */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-amber-400">Recent Transactions</h2>
        </div>
        {txError && (
          <div className="px-6 py-4 text-red-400 text-sm">{txError}</div>
        )}
        {txLoading ? (
          <div className="px-6 py-8 text-slate-400 text-sm text-center">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="px-6 py-8 text-slate-400 text-sm text-center">No transactions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                    <td className="px-6 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-slate-200">{tx.description}</td>
                    <td className="px-6 py-3">
                      <span className={`capitalize text-xs px-2 py-0.5 rounded-full ${txBadgeClass(tx.type)}`}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`px-6 py-3 text-right font-semibold ${txColorClass(tx.type)}`}>
                      {isCredit(tx.type) ? '+' : '-'}
                      🪙 {tx.netAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
