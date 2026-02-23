import { useState } from 'react'
import { ArrowRight, AlertTriangle } from 'lucide-react'

interface RoomTransferModalProps {
  isOpen: boolean
  fromRoom?: string
  toRoom?: string
  onConfirm: () => void
  onClose: () => void
}

export default function RoomTransferModal({
  isOpen,
  fromRoom,
  toRoom,
  onConfirm,
  onClose,
}: RoomTransferModalProps) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-slate-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
            <ArrowRight className="h-5 w-5 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Change Room</h2>
        </div>

        <div className="mb-4 flex items-center justify-center gap-3 rounded-lg bg-slate-700/60 p-4">
          <span className="rounded-md bg-slate-600 px-3 py-1 text-sm font-medium text-white">
            {fromRoom ?? 'Current Room'}
          </span>
          <ArrowRight className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="rounded-md bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-400">
            {toRoom ?? 'New Room'}
          </span>
        </div>

        <div className="mb-6 flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-400 mt-0.5" />
          <p className="text-sm text-yellow-300">
            Any active game will be interrupted if you move to another room.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-slate-900 transition hover:bg-amber-400 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                Moving…
              </>
            ) : (
              'Continue'
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-600 active:scale-95 disabled:opacity-50"
          >
            Stay
          </button>
        </div>
      </div>
    </div>
  )
}
