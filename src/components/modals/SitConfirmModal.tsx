import { Tv } from 'lucide-react'

interface SitConfirmModalProps {
  isOpen: boolean
  streamTitle?: string
  hostName?: string
  onConfirm: () => void
  onClose: () => void
}

export default function SitConfirmModal({
  isOpen,
  streamTitle,
  hostName,
  onConfirm,
  onClose,
}: SitConfirmModalProps) {
  if (!isOpen) return null

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
            <Tv className="h-5 w-5 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Watch Stream?</h2>
        </div>

        <p className="mb-2 text-slate-300">
          Sit down to watch{' '}
          {streamTitle ? (
            <span className="font-semibold text-amber-400">"{streamTitle}"</span>
          ) : (
            'this stream'
          )}
          {hostName && (
            <>
              {' '}hosted by{' '}
              <span className="font-semibold text-amber-400">{hostName}</span>
            </>
          )}
          ?
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-slate-900 transition hover:bg-amber-400 active:scale-95"
          >
            Take a Seat
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-600 active:scale-95"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  )
}
