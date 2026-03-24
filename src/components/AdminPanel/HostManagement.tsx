import { useEffect, useState } from 'react'
import { gameService } from '../../services/gameService'
import { HostRoom } from '../../types/game'
import { RefreshCw, Radio, WifiOff } from 'lucide-react'

export default function HostManagement() {
  const [rooms, setRooms] = useState<HostRoom[]>([])
  const [loading, setLoading] = useState(true)

  const loadRooms = async () => {
    setLoading(true)
    try {
      const data = await gameService.getHostRooms()
      setRooms(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRooms() }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-amber-400">Host Room Management</h2>
        <button
          onClick={loadRooms}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-sm text-slate-300 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="bg-slate-800 h-14 rounded" />))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-3 pr-4">Room Name</th>
                <th className="pb-3 pr-4">Host</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Viewers</th>
                <th className="pb-3">Stream URL</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id} className="border-b border-slate-800 hover:bg-slate-800">
                  <td className="py-3 pr-4 font-medium">{room.name}</td>
                  <td className="py-3 pr-4 text-slate-300">{room.hostName}</td>
                  <td className="py-3 pr-4">
                    {room.isLive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-green-900 text-green-300">
                        <Radio size={10} />
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-slate-700 text-slate-400">
                        <WifiOff size={10} />
                        Offline
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-slate-300">{room.viewerCount}</td>
                  <td className="py-3 text-slate-400 truncate max-w-xs font-mono text-xs">
                    {room.streamUrl ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rooms.length === 0 && <p className="text-center text-slate-500 py-8">No host rooms found</p>}
        </div>
      )}
    </div>
  )
}
