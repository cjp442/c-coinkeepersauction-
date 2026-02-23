import React from 'react'

interface LogEntry {
  action: string
  user: string
  timestamp: string
  target: string
  details: string
}

const SystemLogs: React.FC = () => {
  const logs: LogEntry[] = [
    { action: 'User Login', user: 'user123', timestamp: '2026-02-23 12:00:00', target: 'user123', details: 'User logged into the system.' },
    { action: 'Change Password', user: 'admin', timestamp: '2026-02-23 12:20:00', target: 'user123', details: 'User123 changed their password.' },
    { action: 'Delete User', user: 'admin', timestamp: '2026-02-23 12:30:00', target: 'user456', details: 'User456 was deleted from the system.' },
    { action: 'Update Profile', user: 'user123', timestamp: '2026-02-23 12:40:00', target: 'user123', details: 'User123 updated their profile information.' },
    { action: 'Create User', user: 'admin', timestamp: '2026-02-23 12:45:00', target: 'user789', details: 'User789 was created in the system.' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-amber-400">Admin Action Logs</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-700">
              <th className="pb-3 pr-4">Action</th>
              <th className="pb-3 pr-4">User</th>
              <th className="pb-3 pr-4">Timestamp</th>
              <th className="pb-3 pr-4">Target</th>
              <th className="pb-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} className="border-b border-slate-800 hover:bg-slate-800">
                <td className="py-3 pr-4 font-medium text-white">{log.action}</td>
                <td className="py-3 pr-4 text-slate-400">{log.user}</td>
                <td className="py-3 pr-4 text-slate-400">{log.timestamp}</td>
                <td className="py-3 pr-4 text-slate-400">{log.target}</td>
                <td className="py-3 text-slate-300">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SystemLogs
