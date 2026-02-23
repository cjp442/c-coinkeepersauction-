import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { AdminStats } from '../../types/admin'
import { Users, DollarSign, Radio, ShoppingBag } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getStats().then(setStats).catch(console.error).finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-400' },
    { label: 'Active Hosts', value: stats?.totalHosts ?? 0, icon: Radio, color: 'text-green-400' },
    { label: 'Total Revenue', value: `$${((stats?.totalRevenue ?? 0) / 100).toFixed(2)}`, icon: DollarSign, color: 'text-amber-400' },
    { label: 'Tokens in Circulation', value: stats?.totalTokensInCirculation ?? 0, icon: ShoppingBag, color: 'text-purple-400' },
    { label: 'Active Auctions', value: stats?.activeAuctions ?? 0, icon: ShoppingBag, color: 'text-red-400' },
    { label: 'Live Streams', value: stats?.activeStreams ?? 0, icon: Radio, color: 'text-cyan-400' },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="bg-slate-800 h-28 rounded-lg" />))}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-amber-400">Dashboard Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-slate-800 p-5 rounded-lg border border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
              <card.icon className={`${card.color} opacity-50`} size={32} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
