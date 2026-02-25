import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTokens } from '../contexts/TokenContext'
import { supabase } from '../lib/supabase'
import AgeGateModal from './AgeGateModal'
import { X, Coins, ShieldCheck } from 'lucide-react'

interface TokenPurchaseModalProps {
  onClose: () => void
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  created_at: string
}

const PACKAGES = [
  { id: '100', tokens: 100, label: '100 Tokens', priceKey: 'token_package_100' },
  { id: '500', tokens: 500, label: '500 Tokens', priceKey: 'token_package_500' },
  { id: '1000', tokens: 1000, label: '1,000 Tokens', priceKey: 'token_package_1000' },
]

export default function TokenPurchaseModal({ onClose }: TokenPurchaseModalProps) {
  const { user } = useAuth()
  const { tokens } = useTokens()
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [showAgeGate, setShowAgeGate] = useState(false)
  const [pendingPackage, setPendingPackage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (data) setPrices(Object.fromEntries(data.map((r: any) => [r.key, r.value])))
    })

    if (user) {
      supabase
        .from('coin_transactions')
        .select('id, type, amount, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
        .then(({ data }) => setTransactions(data || []))
    }
  }, [user?.id])

  const handleBuy = async (packageId: string) => {
    if (!user) return
    if (!(user as any).age_verified) {
      setPendingPackage(packageId)
      setShowAgeGate(true)
      return
    }
    await doPurchase(packageId)
  }

  const doPurchase = async (packageId: string) => {
    setPurchasing(packageId)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tokens-purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ packageId }),
      })
      const json = await res.json()
      if (json.clientSecret) {
        // In production, use Stripe.js to complete payment
        alert(`Payment intent created. Complete payment with client secret: ${json.clientSecret.slice(0, 20)}...`)
      } else {
        setError(json.error || 'Failed to initiate purchase.')
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred.')
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-xl p-6 max-w-lg w-full relative shadow-2xl max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <Coins className="text-amber-500" size={32} />
            <div>
              <h2 className="text-xl font-bold">Token Wallet</h2>
              <p className="text-slate-400 text-sm">Manage your CoinKeepers tokens</p>
            </div>
          </div>

          {tokens && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">{tokens.balance}</div>
                <div className="text-xs text-slate-400 mt-1">Wallet Balance</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{tokens.safe_balance}</div>
                <div className="text-xs text-slate-400 mt-1">Safe Balance</div>
              </div>
            </div>
          )}

          {(user as any)?.age_verified && (
            <div className="flex items-center gap-2 text-green-400 text-sm mb-4">
              <ShieldCheck size={16} />
              Age verified
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-400 rounded p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <h3 className="font-semibold mb-3">Buy Tokens</h3>
          <div className="space-y-3 mb-6">
            {PACKAGES.map(pkg => (
              <div key={pkg.id} className="flex items-center justify-between bg-slate-700 rounded-lg p-4">
                <div>
                  <div className="font-medium">{pkg.label}</div>
                  <div className="text-sm text-slate-400">
                    ${prices[pkg.priceKey] ?? '—'} USD
                  </div>
                </div>
                <button
                  onClick={() => handleBuy(pkg.id)}
                  disabled={purchasing === pkg.id}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded transition text-sm font-medium disabled:opacity-50"
                >
                  {purchasing === pkg.id ? 'Processing...' : 'Buy'}
                </button>
              </div>
            ))}
          </div>

          {transactions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Recent Transactions</h3>
              <div className="space-y-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-700">
                    <div>
                      <span className="text-slate-300">{tx.description || tx.type}</span>
                      <div className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</div>
                    </div>
                    <span className={tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showAgeGate && (
        <AgeGateModal
          onClose={() => { setShowAgeGate(false); setPendingPackage(null) }}
          onVerified={() => {
            setShowAgeGate(false)
            if (pendingPackage) doPurchase(pendingPackage)
            setPendingPackage(null)
          }}
        />
      )}
    </>
  )
}
