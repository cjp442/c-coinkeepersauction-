import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { AdminLog } from '../../types/admin'
import { RefreshCw } from 'lucide-react'

export default function SystemLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await adminService.getAdminLogs(200)
      setLogs(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadLogs() }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-amber-400">System Logs</h2>
        <button
          onClick={loadLogs}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-sm text-slate-300 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
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
                <th className="pb-3 pr-4">Date / Time</th>
                <th className="pb-3 pr-4">Admin</th>
                <th className="pb-3 pr-4">Action</th>
                <th className="pb-3 pr-4">Target</th>
                <th className="pb-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-b border-slate-800 hover:bg-slate-800">
                  <td className="py-2 pr-4 text-slate-400 whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 pr-4 font-medium">{l.adminUsername}</td>
                  <td className="py-2 pr-4">
                    <span className="font-mono text-xs text-amber-300">{l.action}</span>
                  </td>
                  <td className="py-2 pr-4 text-slate-400 text-xs">
                    {l.targetType && l.targetId ? `${l.targetType}:${l.targetId}` : '—'}
                  </td>
                  <td className="py-2 text-slate-400 truncate max-w-xs">{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <p className="text-center text-slate-500 py-8">No logs found</p>}
        </div>
      )}
    </div>
  )
}
