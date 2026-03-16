import { adminService } from '../../services/adminService'
import { useEffect, useState } from 'react'
import { AdminLog } from '../../types/admin'

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getLogs().then((data) => { setLogs(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const actionColor = (action: string) => {
    if (action.toLowerCase().includes('ban')) return 'text-red-400'
    if (action.toLowerCase().includes('delete')) return 'text-orange-400'
    if (action.toLowerCase().includes('role')) return 'text-blue-400'
    if (action.toLowerCase().includes('login')) return 'text-green-400'
    return 'text-slate-300'
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-amber-400">Audit Logs</h2>
      {loading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-slate-800 h-12 rounded" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-3 pr-4">Timestamp</th>
                <th className="pb-3 pr-4">Admin</th>
                <th className="pb-3 pr-4">Action</th>
                <th className="pb-3 pr-4">Target</th>
                <th className="pb-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No audit logs yet. Admin actions will appear here.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800">
                    <td className="py-3 pr-4 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 font-medium">{log.adminUsername}</td>
                    <td className={`py-3 pr-4 font-semibold ${actionColor(log.action)}`}>
                      {log.action}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{log.targetId ?? '—'}</td>
                    <td className="py-3 text-slate-400 text-xs">{log.details ?? ''}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default SystemLogs
