import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { AdminTransaction } from '../../types/admin'

export default function FinancialDashboard() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getTransactions().then(setTransactions).catch(console.error).finally(() => setLoading(false))
  }, [])

  const totalRevenue = transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0)
  const totalTaxes = transactions.reduce((sum, t) => sum + (t.taxAmount || 0), 0)

  const typeColors: Record<string, string> = {
    purchase: 'text-green-400', spend: 'text-red-400',
    transfer_in: 'text-blue-400', transfer_out: 'text-orange-400',
    earn: 'text-purple-400', tax: 'text-yellow-400',
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-amber-400">Financial Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm">Total Purchases</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{totalRevenue.toLocaleString()} coins</p>
        </div>
        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm">Total Taxes Collected</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{totalTaxes.toLocaleString()} coins</p>
        </div>
        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm">Total Transactions</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{transactions.length.toLocaleString()}</p>
        </div>
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
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Tax</th>
                <th className="pb-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className="border-b border-slate-800 hover:bg-slate-800">
                  <td className="py-2 pr-4 text-slate-400">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="py-2 pr-4 font-medium">{tx.username}</td>
                  <td className="py-2 pr-4"><span className={`font-mono text-xs ${typeColors[tx.type] || 'text-white'}`}>{tx.type}</span></td>
                  <td className="py-2 pr-4 font-mono">{tx.amount}</td>
                  <td className="py-2 pr-4 text-yellow-400 font-mono">{tx.taxAmount}</td>
                  <td className="py-2 text-slate-400 truncate max-w-xs">{tx.description}</td>
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
