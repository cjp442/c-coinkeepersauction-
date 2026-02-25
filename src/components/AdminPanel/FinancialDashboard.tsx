import React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Transaction {
  id: string
  user_id: string
  type: string
  amount: number
  tax_amount: number
  net_amount: number
  description: string
  created_at: string
}

export default function FinancialDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('coin_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setTransactions(data || [])
        setLoading(false)
      })
  }, [])

  const totalRevenue = transactions
    .filter(t => t.type === 'purchase')
    .reduce((acc, t) => acc + t.net_amount, 0)

  const totalTax = transactions.reduce((acc, t) => acc + (t.tax_amount || 0), 0)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-amber-400">Financial Dashboard</h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-700 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-400">{totalRevenue}</div>
          <div className="text-sm text-slate-400">Total Token Revenue</div>
        </div>
        <div className="bg-slate-700 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-amber-400">{totalTax}</div>
          <div className="text-sm text-slate-400">Total Tax Collected</div>
        </div>
        <div className="bg-slate-700 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-400">{transactions.length}</div>
          <div className="text-sm text-slate-400">Total Transactions</div>
        </div>
      </div>
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="text-left py-2">Type</th>
              <th className="text-right py-2">Amount</th>
              <th className="text-right py-2">Tax</th>
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-700/30">
                <td className="py-2 capitalize">{t.type}</td>
                <td className="py-2 text-right">{t.net_amount}</td>
                <td className="py-2 text-right text-red-400">{t.tax_amount}</td>
                <td className="py-2 text-slate-400">{t.description}</td>
                <td className="py-2 text-right text-slate-400">{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
