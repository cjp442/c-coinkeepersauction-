import { useEffect } from 'react'
import { create } from 'zustand'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

type NotificationType = 'success' | 'error' | 'info' | 'warning'
type NotificationSubtype =
  | 'purchase_success'
  | 'player_joined'
  | 'stream_started'
  | 'admin_action'
  | null

interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  subtype: NotificationSubtype
}

interface NotificationStore {
  notifications: Notification[]
  addNotification: (
    title: string,
    message: string,
    type: NotificationType,
    subtype?: NotificationSubtype
  ) => string
  removeNotification: (id: string) => void
}

const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (title, message, type, subtype = null) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id, title, message, type, subtype },
      ],
    }))
    return id
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}))

const icons: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-400" />,
  error: <XCircle className="h-5 w-5 text-red-400" />,
  info: <Info className="h-5 w-5 text-blue-400" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
}

const borderColors: Record<NotificationType, string> = {
  success: 'border-green-500/40',
  error: 'border-red-500/40',
  info: 'border-blue-500/40',
  warning: 'border-yellow-500/40',
}

function Toast({ notification }: { notification: Notification }) {
  const removeNotification = useNotificationStore((s) => s.removeNotification)

  useEffect(() => {
    const timer = setTimeout(() => removeNotification(notification.id), 4000)
    return () => clearTimeout(timer)
  }, [notification.id, removeNotification])

  return (
    <div
      className={`flex w-80 items-start gap-3 rounded-xl border bg-slate-800 p-4 shadow-2xl animate-slide-in ${borderColors[notification.type]}`}
    >
      <div className="shrink-0 mt-0.5">{icons[notification.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-snug">{notification.title}</p>
        <p className="mt-0.5 text-xs text-slate-400 leading-snug">{notification.message}</p>
      </div>
      <button
        onClick={() => removeNotification(notification.id)}
        className="shrink-0 text-slate-500 hover:text-slate-300 transition"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function NotificationSystem() {
  const notifications = useNotificationStore((s) => s.notifications)

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end">
      {notifications.map((n) => (
        <Toast key={n.id} notification={n} />
      ))}
    </div>
  )
}

export function useNotifications() {
  const addNotification = useNotificationStore((s) => s.addNotification)
  const removeNotification = useNotificationStore((s) => s.removeNotification)

  return {
    addNotification: (title: string, message: string, type: NotificationType) =>
      addNotification(title, message, type),
    removeNotification,
  }
}

export function useGameNotifications() {
  const addNotification = useNotificationStore((s) => s.addNotification)

  return {
    notifyPurchase: (itemName: string = 'Item') =>
      addNotification(
        'Purchase Successful',
        `You purchased ${itemName}.`,
        'success',
        'purchase_success'
      ),
    notifyPlayerJoined: (playerName: string = 'A player') =>
      addNotification(
        'Player Joined',
        `${playerName} has joined the room.`,
        'info',
        'player_joined'
      ),
    notifyStreamStarted: (streamTitle: string = 'A stream') =>
      addNotification(
        'Stream Started',
        `${streamTitle} is now live.`,
        'info',
        'stream_started'
      ),
    notifyAdminAction: (message: string = 'An admin action was performed.') =>
      addNotification('Admin Action', message, 'warning', 'admin_action'),
  }
}
