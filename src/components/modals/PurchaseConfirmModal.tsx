import { useState } from 'react'
import { ShoppingCart, AlertTriangle } from 'lucide-react'
import { useTokens } from '../../contexts/TokenContext'

interface PurchaseConfirmModalProps {
  isOpen: boolean
  itemName: string
  amount: number
  tokenCost: number
  onConfirm: () => void
  onClose: () => void
}

export default function PurchaseConfirmModal({
  isOpen,
  itemName,
  amount,
  tokenCost,
  onConfirm,
  onClose,
}: PurchaseConfirmModalProps) {
  const [loading, setLoading] = useState(false)
  const { tokens } = useTokens()

  if (!isOpen) return null

  const balance = tokens?.balance ?? 0
  const insufficient = balance < tokenCost

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
            <ShoppingCart className="h-5 w-5 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Confirm Purchase</h2>
        </div>

        <div className="mb-4 rounded-lg bg-slate-700/60 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Item</span>
            <span className="font-medium text-white">{itemName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Quantity</span>
            <span className="font-medium text-white">{amount}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-slate-600 pt-2">
            <span className="text-slate-400">Cost</span>
            <span className="font-bold text-amber-400">{tokenCost} tokens</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Your balance</span>
            <span className={`font-medium ${insufficient ? 'text-red-400' : 'text-green-400'}`}>
              {balance} tokens
            </span>
          </div>
        </div>

        {insufficient && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-400">Insufficient token balance to complete this purchase.</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={insufficient || loading}
            className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-slate-900 transition hover:bg-amber-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Processing…' : 'Confirm Purchase'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-600 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
