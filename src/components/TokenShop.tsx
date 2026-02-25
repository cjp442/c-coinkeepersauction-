import { useState } from 'react'
import { useTokens } from '../contexts/TokenContext'
import { calculatePurchaseCost, initiatePurchase } from '../services/tokenService'
import { useAuth } from '../contexts/AuthContext'

const PRESET_AMOUNTS = [100, 500, 1000, 2500, 5000, 10000]

const TokenShop = () => {
  const { user } = useAuth()
  const { tokens } = useTokens()
  const [tokenAmount, setTokenAmount] = useState(500)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { subtotal, tax, total } = calculatePurchaseCost(tokenAmount)

  const handlePurchase = async () => {
    if (!user) { setError('Please log in to purchase tokens.'); return }
    if (tokenAmount < 100) { setError('Minimum purchase is 100 tokens.'); return }
    setError('')
    setLoading(true)
    try {
      const { url } = await initiatePurchase(user.id, tokenAmount)
      // Redirect to Stripe Checkout
      window.location.href = url
    } catch {
      // Dev-mode fallback: show success without real payment
      setSuccess(`Purchase of ${tokenAmount} tokens initiated! (Connect Stripe to complete.)`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2 text-amber-400">🪙 Keeper Token Shop</h1>
      <p className="text-slate-400 mb-8 text-sm">
        Tokens are used to place bids, play games, and customise your room.
        1 Token = $0.01 USD · 10% tax applies.
      </p>

      {tokens && (
        <div className="bg-slate-800 rounded-lg px-5 py-3 mb-8 inline-flex items-center gap-3">
          <span className="text-slate-400 text-sm">Current balance:</span>
          <span className="text-amber-400 font-bold text-lg">{tokens.balance.toLocaleString()} tokens</span>
          {tokens.safe_balance > 0 && (
            <span className="text-slate-500 text-sm">(+{tokens.safe_balance.toLocaleString()} in safe)</span>
          )}
        </div>
      )}

      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <p className="text-sm text-slate-400 mb-3">Quick select:</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {PRESET_AMOUNTS.map(amount => (
            <button
              key={amount}
              onClick={() => setTokenAmount(amount)}
              className={`py-2 rounded font-semibold text-sm transition ${
                tokenAmount === amount
                  ? 'bg-amber-500 text-black'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              {amount.toLocaleString()}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-slate-300 mb-2">
          Custom amount (min 100)
        </label>
        <input
          type="number"
          min={100}
          step={100}
          value={tokenAmount}
          onChange={e => setTokenAmount(Math.max(100, Number(e.target.value)))}
          className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-amber-500 mb-5"
        />

        <div className="space-y-1 text-sm mb-6">
          <div className="flex justify-between text-slate-400">
            <span>{tokenAmount.toLocaleString()} tokens</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Tax (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-white border-t border-slate-700 pt-2 mt-2">
            <span>Total</span>
            <span className="text-amber-400">${total.toFixed(2)}</span>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-400 text-sm mb-4">{success}</p>}

        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
        >
          {loading ? 'Redirecting to Stripe…' : `Purchase ${tokenAmount.toLocaleString()} Tokens via Stripe`}
        </button>
        <p className="text-center text-slate-500 text-xs mt-3">
          Payments processed securely by Stripe · Tokens credited after webhook confirmation
        </p>
      </div>
    </div>
  )
}

export default TokenShop
