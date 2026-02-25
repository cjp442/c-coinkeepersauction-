import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface AdminLog {
  id: string
  admin_id: string
  action: string
  target_id: string
  target_type: string
  details: string
  created_at: string
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setLogs(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-amber-400">System Logs</h2>
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-slate-400">No admin logs found.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="text-left py-2">Action</th>
              <th className="text-left py-2">Target</th>
              <th className="text-left py-2">Details</th>
              <th className="text-right py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-700/30">
                <td className="py-2 font-medium">{log.action}</td>
                <td className="py-2 text-slate-400">{log.target_type} {log.target_id?.slice(0, 8)}</td>
                <td className="py-2 text-slate-400">{log.details}</td>
                <td className="py-2 text-right text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
