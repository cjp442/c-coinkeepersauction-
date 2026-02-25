import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Room {
  id: string
  name: string
  description: string
  mode3d_enabled: boolean
  mode2d_enabled: boolean
  room_theme: string
}

export default function AuctionsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('host_rooms')
      .select('id, name, description, mode3d_enabled, mode2d_enabled, room_theme')
      .then(({ data }) => {
        setRooms(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Live Auctions</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading && (
          <div className="bg-slate-800 p-6 rounded-lg">
            <p className="text-slate-400">Loading auctions...</p>
          </div>
        )}
        {!loading && rooms.length === 0 && (
          <div className="bg-slate-800 p-6 rounded-lg">
            <p className="text-slate-400">No auction rooms available yet.</p>
          </div>
        )}
        {rooms.map(room => (
          <div key={room.id} className="bg-slate-800 p-6 rounded-lg relative">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold">{room.name}</h3>
              <div className="flex gap-1">
                {room.mode3d_enabled && (
                  <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded font-bold">3D</span>
                )}
                {room.mode2d_enabled && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-bold">2D</span>
                )}
              </div>
            </div>
            <p className="text-slate-400 text-sm">{room.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
