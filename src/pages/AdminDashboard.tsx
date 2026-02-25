import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import AdminDashboardPanel from '../components/AdminPanel/AdminDashboard'
import MemberManagement from '../components/AdminPanel/MemberManagement'
import FinancialDashboard from '../components/AdminPanel/FinancialDashboard'
import { adminService } from '../services/adminService'
import { LayoutDashboard, Users, DollarSign, FileText, Shield, Settings } from 'lucide-react'
import { useEffect } from 'react'

type AdminTab = 'dashboard' | 'members' | 'financial' | 'logs' | 'settings'

function SiteSettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})

  useEffect(() => {
    adminService.getSiteSettings().then(s => {
      setSettings(s)
      setEditValues(s)
    }).catch(console.error)
  }, [])

  const handleSave = async (key: string) => {
    setSaving(key)
    try {
      await adminService.updateSiteSettings(key, editValues[key])
      setSettings(prev => ({ ...prev, [key]: editValues[key] }))
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(null)
    }
  }

  const settingLabels: Record<string, string> = {
    token_rate_usd: 'Token Rate (USD per token)',
    token_package_100: '100 Token Package Price (USD)',
    token_package_500: '500 Token Package Price (USD)',
    token_package_1000: '1000 Token Package Price (USD)',
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-amber-400">Site Settings</h2>
      <div className="space-y-4 max-w-lg">
        {Object.keys(settingLabels).map(key => (
          <div key={key} className="bg-slate-800 p-4 rounded-lg">
            <label className="block text-sm text-slate-400 mb-1">{settingLabels[key]}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editValues[key] ?? settings[key] ?? ''}
                onChange={e => setEditValues(prev => ({ ...prev, [key]: e.target.value }))}
                className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              />
              <button
                onClick={() => handleSave(key)}
                disabled={saving === key}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded transition disabled:opacity-50"
              >
                {saving === key ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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

  const tabs: { key: AdminTab; label: string; icon: React.ElementType }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'members', label: 'Members', icon: Users },
    { key: 'financial', label: 'Financial', icon: DollarSign },
    { key: 'logs', label: 'Audit Logs', icon: FileText },
    { key: 'settings', label: 'Settings', icon: Settings },
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
        {activeTab === 'logs' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-amber-400">Audit Logs</h2>
            <p className="text-slate-400">Audit log viewer coming soon. All admin actions are being recorded in the database.</p>
          </div>
        )}
        {activeTab === 'settings' && <SiteSettingsTab />}
      </div>
    </div>
  )
}
