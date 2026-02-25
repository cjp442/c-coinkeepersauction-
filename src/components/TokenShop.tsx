import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTokens } from '../contexts/TokenContext'
import AgeGateModal from './AgeGateModal'
import { X } from 'lucide-react'

const PACKAGES = [
  { id: '100', tokens: 100, label: '100 Tokens', price: '$10.00' },
  { id: '500', tokens: 500, label: '500 Tokens', price: '$45.00' },
  { id: '1000', tokens: 1000, label: '1,000 Tokens', price: '$80.00' },
]

interface TokenShopProps {
  isOpen: boolean
  onClose: () => void
}

export default function TokenShop({ isOpen, onClose }: TokenShopProps) {
  const { user } = useAuth()
  const { tokens } = useTokens()
  const [showAgeGate, setShowAgeGate] = useState(false)

  if (!isOpen) return null

  const handleBuy = (packageId: string) => {
    if (!user) return
    if (!(user as any).age_verified) {
      setShowAgeGate(true)
      return
    }
    alert(`Token purchase for package ${packageId} — integrate Stripe checkout here.`)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-8 rounded-lg max-w-md w-full mx-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-2 text-amber-400">Buy Keeper Coins</h2>
        {tokens && (
          <p className="text-slate-400 text-sm mb-6">Current balance: <span className="text-white font-bold">{tokens.balance}</span> tokens</p>
        )}
        <div className="space-y-3">
          {PACKAGES.map(pkg => (
            <div key={pkg.id} className="flex items-center justify-between bg-slate-700 px-4 py-3 rounded-lg">
              <div>
                <div className="font-semibold">{pkg.label}</div>
                <div className="text-slate-400 text-sm">{pkg.price}</div>
              </div>
              <button
                onClick={() => handleBuy(pkg.id)}
                className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded text-sm font-semibold transition"
              >
                Buy
              </button>
            </div>
          ))}
        </div>
      </div>
      {showAgeGate && <AgeGateModal onClose={() => setShowAgeGate(false)} />}
    </div>
  )
}
