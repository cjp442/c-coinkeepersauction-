import { useState, useCallback } from 'react'

interface NotificationItem {
  id: number
  type: 'success' | 'info' | 'danger' | 'warning'
  message: string
}

const TYPE_STYLES: Record<NotificationItem['type'], string> = {
  success: 'bg-green-700 border-green-600 text-green-100',
  info: 'bg-blue-700 border-blue-600 text-blue-100',
  danger: 'bg-red-700 border-red-600 text-red-100',
  warning: 'bg-amber-700 border-amber-600 text-amber-100',
}

let _addNotification: ((type: NotificationItem['type'], message: string) => void) | null = null

export function notifyPurchaseSuccess(message: string) { _addNotification?.('success', message) }
export function notifyPlayerJoined(message: string) { _addNotification?.('info', message) }
export function notifyStreamStarted(message: string) { _addNotification?.('success', message) }
export function notifyError(message: string) { _addNotification?.('danger', message) }
export function notifyAdminAction(message: string) { _addNotification?.('warning', message) }

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const addNotification = useCallback((type: NotificationItem['type'], message: string) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  // Wire up module-level helpers
  _addNotification = addNotification

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`border rounded-lg px-4 py-3 text-sm font-medium shadow-lg animate-fade-in ${TYPE_STYLES[n.type]}`}
        >
          {n.message}
        </div>
      ))}
    </div>
  )
}
