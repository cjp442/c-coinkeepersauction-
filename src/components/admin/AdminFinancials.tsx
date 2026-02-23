import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { DollarSign, Receipt, TrendingUp, BarChart2 } from 'lucide-react'

interface FinancialTransaction {
  id: string
  date: string
  user: string
  type: 'purchase' | 'sale' | 'withdrawal' | 'deposit'
  amount: number
  tax: number
}

const MOCK_TRANSACTIONS: FinancialTransaction[] = [
  { id: 't1',  date: '2024-07-10 14:32', user: 'darkwolf92',   type: 'purchase',   amount: 250.00, tax: 17.50 },
  { id: 't2',  date: '2024-07-10 15:01', user: 'neon_rider',   type: 'sale',       amount: 80.00,  tax: 5.60  },
  { id: 't3',  date: '2024-07-11 09:15', user: 'hostmaster_x', type: 'deposit',    amount: 500.00, tax: 0.00  },
  { id: 't4',  date: '2024-07-11 11:22', user: 'quantum_leap', type: 'purchase',   amount: 175.00, tax: 12.25 },
  { id: 't5',  date: '2024-07-11 13:44', user: 'aurora_sky',   type: 'withdrawal', amount: 300.00, tax: 0.00  },
  { id: 't6',  date: '2024-07-12 08:05', user: 'cryptic_owl',  type: 'purchase',   amount: 99.99,  tax: 7.00  },
  { id: 't7',  date: '2024-07-12 10:30', user: 'starfall99',   type: 'sale',       amount: 45.00,  tax: 3.15  },
  { id: 't8',  date: '2024-07-12 16:18', user: 'void_runner',  type: 'deposit',    amount: 200.00, tax: 0.00  },
  { id: 't9',  date: '2024-07-13 09:55', user: 'prism_blade',  type: 'purchase',   amount: 320.00, tax: 22.40 },
  { id: 't10', date: '2024-07-13 14:00', user: 'ironclad',     type: 'withdrawal', amount: 1000.00,tax: 0.00  },
]

function buildRevenueData() {
  const today = new Date('2024-07-13')
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (29 - i))
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    const revenue = Math.round(200 + Math.random() * 800 + i * 18)
    return { date: label, revenue }
  })
}

const REVENUE_DATA = buildRevenueData()

type TxFilter = 'all' | 'purchase' | 'sale' | 'withdrawal' | 'deposit'

const TYPE_BADGE: Record<FinancialTransaction['type'], string> = {
  purchase:   'bg-blue-500/20 text-blue-400',
  sale:       'bg-green-500/20 text-green-400',
  withdrawal: 'bg-red-500/20 text-red-400',
  deposit:    'bg-amber-500/20 text-amber-400',
}

export default function AdminFinancials() {
  const [filter, setFilter] = useState<TxFilter>('all')

  const totalRevenue = MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0)
  const totalTax = MOCK_TRANSACTIONS.reduce((s, t) => s + t.tax, 0)
  const avgValue = totalRevenue / MOCK_TRANSACTIONS.length

  const filtered = useMemo(() => {
    return filter === 'all' ? MOCK_TRANSACTIONS : MOCK_TRANSACTIONS.filter((t) => t.type === filter)
  }, [filter])

  const summaryCards = [
    { label: 'Total Revenue',       value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign,  color: 'text-amber-500' },
    { label: 'Tax Collected',        value: `$${totalTax.toFixed(2)}`,                                                  icon: Receipt,     color: 'text-green-400' },
    { label: 'Transactions',         value: String(MOCK_TRANSACTIONS.length),                                            icon: BarChart2,   color: 'text-blue-400'  },
    { label: 'Avg Transaction',      value: `$${avgValue.toFixed(2)}`,                                                   icon: TrendingUp,  color: 'text-purple-400'},
  ]

  const FILTERS: TxFilter[] = ['all', 'purchase', 'sale', 'withdrawal', 'deposit']

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={15} className={color} />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Revenue — Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              interval={4}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v}`}
            />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6 }}
              labelStyle={{ color: '#94a3b8', fontSize: 11 }}
              itemStyle={{ color: '#f59e0b' }}
              formatter={(value: number) => [`$${value}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#revGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent transactions */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">Recent Transactions</h3>
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-2.5 py-1 rounded capitalize transition-colors ${
                  filter === f
                    ? 'bg-amber-500 text-slate-900 font-semibold'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50 text-xs text-slate-400 uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-right">Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{t.date}</td>
                  <td className="px-4 py-2.5 font-medium text-white">{t.user}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${TYPE_BADGE[t.type]}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-white">${t.amount.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-400">${t.tax.toFixed(2)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">No transactions for this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
