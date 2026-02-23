import { useState } from 'react'
import { CreditCard, X, Loader2, CheckCircle } from 'lucide-react'
import { useTokens } from '../../contexts/TokenContext'

interface TokenPackage {
  id: string
  tokens: number
  price: number
  label: string
  popular?: boolean
}

const PACKAGES: TokenPackage[] = [
  { id: 'pkg-100', tokens: 100, price: 1.0, label: 'Starter' },
  { id: 'pkg-500', tokens: 500, price: 4.5, label: 'Value', popular: true },
  { id: 'pkg-1000', tokens: 1000, price: 9.0, label: 'Premium' },
  { id: 'pkg-5000', tokens: 5000, price: 40.0, label: 'Elite' },
]

const TAX_RATE = 0.085

type PaymentMethod = 'card' | 'paypal'

interface Props {
  onClose?: () => void
}

export default function TokenShop({ onClose }: Props) {
  const { addTokens } = useTokens()
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage>(PACKAGES[1])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const tax = selectedPackage.price * TAX_RATE
  const total = selectedPackage.price + tax

  const handleBuyClick = () => {
    setConfirming(true)
  }

  const handleConfirm = async () => {
    setLoading(true)
    setConfirming(false)
    await new Promise((r) => setTimeout(r, 1200))
    await addTokens(selectedPackage.tokens, `Purchased ${selectedPackage.tokens} tokens`)
    setLoading(false)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
    }, 2500)
  }

  const handleCancel = () => {
    setConfirming(false)
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-amber-400">🪙 Token Shop</h2>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Package Selector */}
        <div>
          <p className="text-sm text-slate-400 mb-3 uppercase tracking-wide font-semibold">Select Package</p>
          <div className="grid grid-cols-2 gap-3">
            {PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => {
                  setSelectedPackage(pkg)
                  setConfirming(false)
                  setSuccess(false)
                }}
                className={`relative rounded-xl border p-4 text-left transition-all ${
                  selectedPackage.id === pkg.id
                    ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-500'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2 right-3 bg-amber-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                <p className="text-2xl font-bold text-white">{pkg.tokens.toLocaleString()}</p>
                <p className="text-sm text-slate-400">{pkg.label}</p>
                <p className="text-amber-400 font-semibold mt-1">${pkg.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <p className="text-sm text-slate-400 mb-3 uppercase tracking-wide font-semibold">Payment Method</p>
          <div className="flex gap-3">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition-all ${
                paymentMethod === 'card'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
              }`}
            >
              <CreditCard size={16} />
              Credit Card
            </button>
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition-all ${
                paymentMethod === 'paypal'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className="font-bold text-blue-400">Pay</span>
              <span className="font-bold text-blue-600">Pal</span>
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-slate-800 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal</span>
            <span>${selectedPackage.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Tax (8.5%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-700">
            <span>Total</span>
            <span className="text-amber-400">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Area */}
        {success ? (
          <div className="flex items-center gap-3 bg-green-500/10 border border-green-500 rounded-xl px-4 py-3 text-green-400 font-semibold">
            <CheckCircle size={20} />
            {selectedPackage.tokens.toLocaleString()} tokens added to your account!
          </div>
        ) : confirming ? (
          <div className="bg-slate-800 border border-amber-500/50 rounded-xl p-4">
            <p className="text-white font-semibold mb-1">Confirm Purchase?</p>
            <p className="text-slate-400 text-sm mb-4">
              {selectedPackage.tokens.toLocaleString()} tokens via {paymentMethod === 'card' ? 'Credit Card' : 'PayPal'} for ${total.toFixed(2)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-2 rounded-lg transition-colors"
              >
                Yes, Buy Now
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                No, Cancel
              </button>
            </div>
          </div>
        ) : loading ? (
          <button disabled className="w-full flex items-center justify-center gap-2 bg-amber-500/50 text-slate-900 font-bold py-3 rounded-xl cursor-not-allowed">
            <Loader2 size={18} className="animate-spin" />
            Processing…
          </button>
        ) : (
          <button
            onClick={handleBuyClick}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-xl transition-colors"
          >
            Buy {selectedPackage.tokens.toLocaleString()} Tokens
          </button>
        )}
      </div>
    </div>
  )
}
