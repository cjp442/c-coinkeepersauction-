import { useEffect, useState } from 'react'
import { tokenService } from '../../services/tokenService'
import { CoinTransaction } from '../../types/token'
import { X } from 'lucide-react'

interface UserLedgerProps {
  userId: string
  username: string
  onClose: () => void
}

const typeColors: Record<string, string> = {
  purchase: 'bg-green-900 text-green-300',
  spend: 'bg-red-900 text-red-300',
  transfer_in: 'bg-blue-900 text-blue-300',
  transfer_out: 'bg-orange-900 text-orange-300',
  earn: 'bg-purple-900 text-purple-300',
  tax: 'bg-yellow-900 text-yellow-300',
}

export default function UserLedger({ userId, username, onClose }: UserLedgerProps) {
  const [transactions, setTransactions] = useState<CoinTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tokenService.getTransactionHistory(userId, 100)
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userId])

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-amber-400">
          Ledger: <span className="text-white">{username}</span>
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="bg-slate-800 h-12 rounded" />))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Tax</th>
                <th className="pb-3 pr-4">Net</th>
                <th className="pb-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-800">
                  <td className="py-2 pr-4 text-slate-400 whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${typeColors[t.type] ?? 'bg-slate-700 text-slate-300'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="py-2 pr-4 font-mono text-white">{t.amount}</td>
                  <td className="py-2 pr-4 font-mono text-yellow-400">{t.taxAmount}</td>
                  <td className="py-2 pr-4 font-mono text-green-400">{t.netAmount}</td>
                  <td className="py-2 text-slate-400 truncate max-w-xs">{t.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && <p className="text-center text-slate-500 py-8">No transactions found</p>}
        </div>
      )}
    </div>
  )
}
