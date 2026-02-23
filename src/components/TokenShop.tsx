import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTokens } from '../contexts/TokenContext'
import { tokenService } from '../services/tokenService'

interface TokenShopProps {
  isOpen: boolean
  onClose: () => void
}

const TAX_RATE = 0.005
const COIN_AMOUNTS = [10, 50, 100, 500, 1000] as const

export default function TokenShop({ isOpen, onClose }: TokenShopProps) {
  const { user } = useAuth()
  const { tokens } = useTokens()
  const [selected, setSelected] = useState<number>(100)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const usdPrice = (amount: number) => (amount * 1).toFixed(2)
  const taxAmount = (amount: number) => (amount * TAX_RATE).toFixed(3)

  const handlePurchase = async () => {
    if (!user) return
    setLoading(true)
    setStatus('idle')
    setErrorMsg('')
    try {
      await tokenService.purchaseTokens({
        userId: user.id,
        amount: selected,
        paymentMethod: 'stripe',
        paymentReference: `pending-${Date.now()}`,
      })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Purchase failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gray-900 border border-amber-800/50 rounded-2xl shadow-2xl p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-amber-400 mb-1">🪙 Token Shop</h2>
        <p className="text-gray-400 text-sm mb-4">
          Current balance:&nbsp;
          <span className="text-amber-300 font-semibold">{tokens?.balance ?? 0} coins</span>
        </p>

        {/* Amount grid */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {COIN_AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => { setSelected(amount); setStatus('idle') }}
              className={`rounded-xl border p-3 text-center transition-all ${
                selected === amount
                  ? 'border-amber-500 bg-amber-900/40 text-amber-300'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-amber-700'
              }`}
            >
              <div className="text-lg font-bold">🪙 {amount}</div>
              <div className="text-xs text-gray-400">${usdPrice(amount)}</div>
              <div className="text-xs text-gray-500">tax ${taxAmount(amount)}</div>
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4 text-sm">
          <div className="flex justify-between text-gray-300 mb-1">
            <span>Coins</span>
            <span className="text-amber-300 font-semibold">🪙 {selected}</span>
          </div>
          <div className="flex justify-between text-gray-400 mb-1">
            <span>Price</span>
            <span>${usdPrice(selected)} USD</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Tax ({(TAX_RATE * 100).toFixed(1)}%)</span>
            <span>${taxAmount(selected)}</span>
          </div>
        </div>

        {/* Status messages */}
        {status === 'success' && (
          <p className="text-green-400 text-sm mb-3 text-center">
            ✅ Purchase successful! Coins added to your balance.
          </p>
        )}
        {status === 'error' && (
          <p className="text-red-400 text-sm mb-3 text-center">❌ {errorMsg}</p>
        )}

        {/* Purchase button */}
        <button
          onClick={handlePurchase}
          disabled={loading || !user}
          className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Processing…' : `Purchase 🪙 ${selected}`}
        </button>

        <p className="text-center text-xs text-gray-500 mt-3">
          💳 Stripe integration coming soon
        </p>
      </div>
    </div>
  )
}
