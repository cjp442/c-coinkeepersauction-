import { useState, ElementType } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import AdminDashboardPanel from '../components/AdminPanel/AdminDashboard'
import MemberManagement from '../components/AdminPanel/MemberManagement'
import FinancialDashboard from '../components/AdminPanel/FinancialDashboard'
import HostManagement from '../components/AdminPanel/HostManagement'
import BanManagement from '../components/AdminPanel/BanManagement'
import SystemLogs from '../components/AdminPanel/SystemLogs'
import { LayoutDashboard, Users, DollarSign, FileText, Radio, Ban, Shield } from 'lucide-react'

type AdminTab = 'dashboard' | 'members' | 'financial' | 'hosts' | 'bans' | 'system'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <Shield className="mx-auto mb-4 text-red-500" size={48} />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-6">You must be an admin to view this page.</p>
        <button onClick={() => navigate('/')} className="bg-amber-600 hover:bg-amber-700 px-6 py-2 rounded">Go Home</button>
      </div>
    )
  }

  const tabs: { key: AdminTab; label: string; icon: ElementType }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'members', label: 'Members', icon: Users },
    { key: 'financial', label: 'Financial', icon: DollarSign },
    { key: 'hosts', label: 'Hosts', icon: Radio },
    { key: 'bans', label: 'Bans', icon: Ban },
    { key: 'system', label: 'System Logs', icon: FileText },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-amber-400">Admin Control Panel</h1>
        <div className="text-sm text-slate-400">Logged in as <span className="text-white font-medium">{user.username}</span></div>
      </div>
      <div className="flex gap-2 mb-8 border-b border-slate-700 pb-0">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === tab.key ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {activeTab === 'dashboard' && <AdminDashboardPanel />}
        {activeTab === 'members' && <MemberManagement />}
        {activeTab === 'financial' && <FinancialDashboard />}
        {activeTab === 'hosts' && <HostManagement />}
        {activeTab === 'bans' && <BanManagement />}
        {activeTab === 'system' && <SystemLogs />}
      </div>
    </div>
  )
}
