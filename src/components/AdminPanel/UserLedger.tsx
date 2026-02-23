import { useState, useEffect } from 'react'

interface LedgerEntry {
  id: number
  type: string
  amount: number
  date: string
}

const UserLedger = () => {
  const [transactions, setTransactions] = useState<LedgerEntry[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchTransactions = () => {
    const dummyData: LedgerEntry[] = [
      { id: 1, type: 'Purchase', amount: 100, date: '2026-02-01' },
      { id: 2, type: 'Transfer', amount: 50, date: '2026-02-15' },
      { id: 3, type: 'Refund', amount: 25, date: '2026-02-20' },
    ]
    setTransactions(dummyData)
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return (!startDate || transactionDate >= start) && (!endDate || transactionDate <= end)
  })

  const exportLedger = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      filteredTransactions.map(e => `${e.id},${e.type},${e.amount},${e.date}`).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'user_ledger.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-amber-400">User Ledger</h1>
      <div className="flex gap-4 mb-4">
        <label className="text-sm text-slate-300">
          Start Date:{' '}
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="ml-2 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm" />
        </label>
        <label className="text-sm text-slate-300">
          End Date:{' '}
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="ml-2 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm" />
        </label>
        <button onClick={exportLedger}
          className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm font-medium">
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-700">
              <th className="pb-2 pr-4">ID</th>
              <th className="pb-2 pr-4">Type</th>
              <th className="pb-2 pr-4">Amount</th>
              <th className="pb-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(t => (
              <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-800">
                <td className="py-2 pr-4 text-slate-400">{t.id}</td>
                <td className="py-2 pr-4 text-white">{t.type}</td>
                <td className="py-2 pr-4 text-amber-400">{t.amount}</td>
                <td className="py-2 text-slate-400">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserLedger