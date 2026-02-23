import { useState } from 'react'
import { X, AlertCircle, CheckCircle } from 'lucide-react'
import { useTokens } from '../../contexts/TokenContext'

interface DecorItem {
  id: string
  name: string
  description: string
  price: number
  emoji: string
}

const DECOR_ITEMS: DecorItem[] = [
  { id: 'd1', name: 'Velvet Sofa', description: 'A plush sofa for your lounge.', price: 120, emoji: '🛋️' },
  { id: 'd2', name: 'Neon Sign', description: 'Glowing neon art for the wall.', price: 80, emoji: '🌟' },
  { id: 'd3', name: 'Arcade Cabinet', description: 'Classic retro arcade machine.', price: 350, emoji: '🕹️' },
  { id: 'd4', name: 'Potted Plant', description: 'Fresh greenery for any room.', price: 40, emoji: '🪴' },
  { id: 'd5', name: 'Disco Ball', description: 'Light up the dance floor.', price: 200, emoji: '🪩' },
  { id: 'd6', name: 'Bar Counter', description: 'Serve drinks in style.', price: 500, emoji: '🍹' },
  { id: 'd7', name: 'Trophy Case', description: 'Show off your achievements.', price: 150, emoji: '🏆' },
  { id: 'd8', name: 'Lava Lamp', description: 'Retro groovy vibe.', price: 60, emoji: '🔴' },
]

interface Props {
  onClose?: () => void
}

export default function DecorShop({ onClose }: Props) {
  const { tokens, deductTokens } = useTokens()
  const [owned, setOwned] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [lastPurchased, setLastPurchased] = useState<string | null>(null)

  const handleBuy = async (item: DecorItem) => {
    setError(null)
    setLastPurchased(null)
    if (!tokens || tokens.balance < item.price) {
      setError(`Not enough tokens to buy ${item.name}. You need ${item.price} tokens.`)
      return
    }
    await deductTokens(item.price, `Purchased decor: ${item.name}`)
    setOwned((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? 0) + 1 }))
    setLastPurchased(item.id)
    setTimeout(() => setLastPurchased(null), 2000)
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-amber-400">🛍️ Decor Shop</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Balance: <span className="text-amber-400 font-semibold">{tokens?.balance.toLocaleString() ?? 0} tokens</span>
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Error / Success messages */}
        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {DECOR_ITEMS.map((item) => {
            const ownedCount = owned[item.id] ?? 0
            const canAfford = (tokens?.balance ?? 0) >= item.price
            const justBought = lastPurchased === item.id
            return (
              <div
                key={item.id}
                className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col items-center text-center gap-2 hover:border-slate-500 transition-colors"
              >
                <span className="text-4xl">{item.emoji}</span>
                <p className="font-semibold text-white text-sm leading-tight">{item.name}</p>
                <p className="text-slate-400 text-xs leading-tight">{item.description}</p>
                <p className="text-amber-400 font-bold text-sm">{item.price} tokens</p>
                {ownedCount > 0 && (
                  <p className="text-xs text-slate-500">Owned: {ownedCount}</p>
                )}
                {justBought ? (
                  <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                    <CheckCircle size={13} /> Added!
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    className={`w-full py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Buy
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
