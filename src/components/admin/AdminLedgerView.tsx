import { useState, useMemo } from 'react'
import { X, Download, ChevronUp, ChevronDown } from 'lucide-react'

interface LedgerEntry {
  id: string
  dateTime: string
  type: 'deposit' | 'withdrawal' | 'purchase' | 'sale' | 'game_win' | 'game_loss'
  description: string
  amount: number
  balanceAfter: number
}

const MOCK_LEDGER: LedgerEntry[] = [
  { id: 'l1',  dateTime: '2024-07-01 09:00', type: 'deposit',    description: 'Initial deposit',             amount:  500.00, balanceAfter:  500.00 },
  { id: 'l2',  dateTime: '2024-07-02 11:15', type: 'purchase',   description: 'VIP membership upgrade',      amount: -150.00, balanceAfter:  350.00 },
  { id: 'l3',  dateTime: '2024-07-03 14:30', type: 'game_win',   description: 'Poker table win',             amount:  220.00, balanceAfter:  570.00 },
  { id: 'l4',  dateTime: '2024-07-04 10:05', type: 'game_loss',  description: 'Darts tournament loss',       amount:  -50.00, balanceAfter:  520.00 },
  { id: 'l5',  dateTime: '2024-07-05 16:45', type: 'sale',       description: 'Auction item sold',           amount:  310.00, balanceAfter:  830.00 },
  { id: 'l6',  dateTime: '2024-07-06 08:20', type: 'withdrawal', description: 'Withdrawal to wallet',        amount: -200.00, balanceAfter:  630.00 },
  { id: 'l7',  dateTime: '2024-07-07 13:00', type: 'purchase',   description: 'Room decoration pack',        amount:  -80.00, balanceAfter:  550.00 },
  { id: 'l8',  dateTime: '2024-07-08 17:30', type: 'deposit',    description: 'Token top-up',                amount:  300.00, balanceAfter:  850.00 },
  { id: 'l9',  dateTime: '2024-07-09 12:10', type: 'game_win',   description: 'Pool championship bonus',     amount:  175.00, balanceAfter: 1025.00 },
  { id: 'l10', dateTime: '2024-07-10 09:45', type: 'purchase',   description: 'Premium avatar accessory',    amount:  -35.00, balanceAfter:  990.00 },
  { id: 'l11', dateTime: '2024-07-11 15:00', type: 'game_loss',  description: 'Spin wheel — no win',         amount:  -20.00, balanceAfter:  970.00 },
  { id: 'l12', dateTime: '2024-07-12 11:22', type: 'sale',       description: 'Rare item auction sale',      amount:  450.00, balanceAfter: 1420.00 },
]

type SortKey = 'dateTime' | 'amount'
type SortDir = 'asc' | 'desc'
type TypeFilter = 'all' | LedgerEntry['type']

const POSITIVE_TYPES: LedgerEntry['type'][] = ['deposit', 'sale', 'game_win']

const TYPE_BADGE: Record<LedgerEntry['type'], string> = {
  deposit:    'bg-amber-500/20 text-amber-400',
  withdrawal: 'bg-red-500/20 text-red-400',
  purchase:   'bg-blue-500/20 text-blue-400',
  sale:       'bg-green-500/20 text-green-400',
  game_win:   'bg-purple-500/20 text-purple-400',
  game_loss:  'bg-orange-500/20 text-orange-400',
}

interface Props {
  userId?: string
  userName?: string
  onClose?: () => void
}

// TODO: use userId to fetch real ledger data from API for the specific user
export default function AdminLedgerView({ userId: _userId, userName = 'Unknown User', onClose }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('dateTime')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const totalSpent = MOCK_LEDGER.filter((e) => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0)
  const currentBalance = MOCK_LEDGER[MOCK_LEDGER.length - 1]?.balanceAfter ?? 0

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = useMemo(() => {
    return typeFilter === 'all' ? MOCK_LEDGER : MOCK_LEDGER.filter((e) => e.type === typeFilter)
  }, [typeFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const cmp =
        sortKey === 'amount'
          ? a.amount - b.amount
          : a.dateTime.localeCompare(b.dateTime)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const handleExport = () => {
    console.log('Exporting ledger for', userName, sorted)
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="text-slate-600" />
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-amber-500" />
      : <ChevronDown size={12} className="text-amber-500" />
  }

  const ALL_TYPES: TypeFilter[] = ['all', 'deposit', 'withdrawal', 'purchase', 'sale', 'game_win', 'game_loss']

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">{userName}</h2>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-slate-400">
              Total spent: <span className="text-red-400 font-medium">${totalSpent.toFixed(2)}</span>
            </span>
            <span className="text-xs text-slate-400">
              Balance: <span className="text-green-400 font-medium">${currentBalance.toFixed(2)}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
              Active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded transition-colors"
          >
            <Download size={12} /> Export
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded transition-colors"
              aria-label="Close ledger"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 border-b border-slate-700 flex flex-wrap gap-1">
        {ALL_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`text-xs px-2.5 py-1 rounded capitalize transition-colors ${
              typeFilter === t
                ? 'bg-amber-500 text-slate-900 font-semibold'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/50 text-xs text-slate-400 uppercase">
            <tr>
              <th
                onClick={() => handleSort('dateTime')}
                className="px-4 py-3 text-left cursor-pointer hover:text-amber-500 select-none"
              >
                <span className="flex items-center gap-1">Date / Time <SortIcon col="dateTime" /></span>
              </th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th
                onClick={() => handleSort('amount')}
                className="px-4 py-3 text-right cursor-pointer hover:text-amber-500 select-none"
              >
                <span className="flex items-center justify-end gap-1">Amount <SortIcon col="amount" /></span>
              </th>
              <th className="px-4 py-3 text-right">Balance After</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {sorted.map((entry) => {
              const isPositive = POSITIVE_TYPES.includes(entry.type)
              return (
                <tr key={entry.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-2.5 text-slate-400 text-xs whitespace-nowrap">{entry.dateTime}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${TYPE_BADGE[entry.type]}`}>
                      {entry.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">{entry.description}</td>
                  <td className={`px-4 py-2.5 text-right font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}${Math.abs(entry.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-300">${entry.balanceAfter.toFixed(2)}</td>
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No transactions for this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
