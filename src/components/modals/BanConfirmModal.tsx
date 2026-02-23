import { useState } from 'react'
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react'

interface BanConfirmModalProps {
  isOpen: boolean
  userName?: string
  userId?: string
  isBanned?: boolean
  onConfirm: (reason: string, userId?: string) => void
  onClose: () => void
}

export default function BanConfirmModal({
  isOpen,
  userName,
  userId,
  isBanned,
  onConfirm,
  onClose,
}: BanConfirmModalProps) {
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const isUnban = isBanned === true
  const displayName = userName ?? 'this user'

  const handleConfirm = () => {
    if (!isUnban && !reason.trim()) return
    onConfirm(reason.trim(), userId)
    setReason('')
  }

  const handleClose = () => {
    setReason('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-slate-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isUnban ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {isUnban
              ? <ShieldCheck className="h-5 w-5 text-green-400" />
              : <ShieldAlert className="h-5 w-5 text-red-400" />
            }
          </div>
          <h2 className="text-xl font-bold text-white">
            {isUnban ? 'Unban' : 'Ban'} {displayName}?
          </h2>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-400 mt-0.5" />
          <p className="text-sm text-yellow-300">
            {isUnban
              ? `Unbanning ${displayName} will restore their full access to the platform.`
              : `Banning ${displayName} will immediately revoke their access to the platform.`
            }
          </p>
        </div>

        {!isUnban && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for ban…"
              rows={3}
              className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={!isUnban && !reason.trim()}
            className={`flex-1 rounded-lg px-4 py-2.5 font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
              isUnban
                ? 'bg-green-600 text-white hover:bg-green-500'
                : 'bg-red-600 text-white hover:bg-red-500'
            }`}
          >
            {isUnban ? 'Confirm Unban' : 'Confirm Ban'}
          </button>
          <button
            onClick={handleClose}
            className="flex-1 rounded-lg bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-600 active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
