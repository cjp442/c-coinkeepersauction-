import { useState } from 'react'
import { useTokens } from '../contexts/TokenContext'

const COIN_PACKAGES = [
  { amount: 100, price: 1.00 },
  { amount: 500, price: 4.50 },
  { amount: 1000, price: 8.00 },
  { amount: 5000, price: 35.00 },
]

const TAX_RATE = 0.1

export default function TokenShop() {
  const { tokens, addTokens } = useTokens()
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const pkg = selected !== null ? COIN_PACKAGES[selected] : null
  const tax = pkg ? +(pkg.price * TAX_RATE).toFixed(2) : 0
  const total = pkg ? +(pkg.price + tax).toFixed(2) : 0

  const handlePurchase = async () => {
    if (!pkg) return
    await addTokens(pkg.amount, `Purchased ${pkg.amount} tokens`)
    setConfirmed(true)
    setTimeout(() => { setConfirmed(false); setSelected(null) }, 3000)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Token Shop</h2>
      <p className="text-slate-400 text-sm mb-6">
        Balance: <span className="text-amber-400 font-bold">{tokens?.balance ?? 0} tokens</span>
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {COIN_PACKAGES.map((p, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`p-4 rounded-xl border-2 text-left transition ${
              selected === i
                ? 'border-amber-500 bg-amber-900/30'
                : 'border-slate-700 bg-slate-800 hover:border-amber-600'
            }`}
          >
            <p className="text-amber-400 font-bold text-xl">{p.amount.toLocaleString()} tokens</p>
            <p className="text-slate-300 text-sm">${p.price.toFixed(2)}</p>
          </button>
        ))}
      </div>

      {pkg && (
        <div className="bg-slate-800 rounded-xl p-4 mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Subtotal</span>
            <span className="text-white">${pkg.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Tax (10%)</span>
            <span className="text-white">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-slate-700 pt-2">
            <span className="text-white">Total</span>
            <span className="text-amber-400">${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {confirmed ? (
        <div className="w-full py-3 bg-green-700 text-white font-bold rounded-lg text-center">
          ✓ {pkg?.amount} tokens added!
        </div>
      ) : (
        <button
          onClick={handlePurchase}
          disabled={selected === null}
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
        >
          Purchase Tokens
        </button>
      )}
    </div>
  )
}
