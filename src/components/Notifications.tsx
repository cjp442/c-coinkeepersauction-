import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface Notification {
  id: number
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
}

let notificationId = 0
const listeners: Array<(n: Notification) => void> = []

export function showNotification(type: Notification['type'], message: string) {
  const n: Notification = { id: ++notificationId, type, message }
  listeners.forEach(l => l(n))
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const handler = (n: Notification) => {
      setNotifications(prev => [...prev, n])
      setTimeout(() => {
        setNotifications(prev => prev.filter(x => x.id !== n.id))
      }, 4000)
    }
    listeners.push(handler)
    return () => {
      const idx = listeners.indexOf(handler)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [])

  const colorMap: Record<Notification['type'], string> = {
    info: 'bg-blue-600',
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-amber-600',
  }

  return (
    <div className="fixed top-4 right-4 z-[200] space-y-2 max-w-sm">
      {notifications.map(n => (
        <div key={n.id} className={`${colorMap[n.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3`}>
          <span className="text-sm">{n.message}</span>
          <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
