import { useState, useEffect } from 'react'
import { X, ShoppingBag } from 'lucide-react'
import { gameService } from '../services/gameService'
import { tokenService } from '../services/tokenService'
import { useAuth } from '../contexts/AuthContext'
import { useTokens } from '../contexts/TokenContext'
import { DecorItem } from '../types/game'

interface DecorShopProps {
  isOpen: boolean
  onClose: () => void
}

type Category = 'all' | 'furniture' | 'decoration' | 'wall' | 'floor'

export default function DecorShop({ isOpen, onClose }: DecorShopProps) {
  const { user } = useAuth()
  const { tokens } = useTokens()
  const [items, setItems] = useState<DecorItem[]>([])
  const [owned, setOwned] = useState<string[]>([])
  const [category, setCategory] = useState<Category>('all')
  const [loading, setLoading] = useState(false)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !user) return
    setLoading(true)
    setError(null)
    Promise.all([
      gameService.getDecorItems(),
      gameService.getPurchasedDecor(user.id),
    ])
      .then(([allItems, purchasedIds]) => {
        setItems(allItems)
        setOwned(purchasedIds)
      })
      .catch(() => setError('Failed to load shop items.'))
      .finally(() => setLoading(false))
  }, [isOpen, user])

  const handleBuy = async (item: DecorItem) => {
    if (!user) return
    setPurchasing(item.id)
    setError(null)
    try {
      await gameService.purchaseDecor(user.id, item.id)
      await tokenService.spendTokens(user.id, item.price, `Decor: ${item.name}`, item.id)
      setOwned(prev => [...prev, item.id])
    } catch {
      setError(`Failed to purchase "${item.name}".`)
    } finally {
      setPurchasing(null)
    }
  }

  const categories: Category[] = ['all', 'furniture', 'decoration', 'wall', 'floor']

  const filtered = category === 'all' ? items : items.filter(i => i.category === category)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-amber-400" size={22} />
            <h2 className="text-xl font-bold text-amber-400">Decor Shop</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">
              Balance: <span className="text-amber-400 font-bold">🪙 {tokens?.balance ?? 0}</span>
            </span>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 px-6 py-3 border-b border-slate-700 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition whitespace-nowrap ${
                category === cat
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded px-4 py-2">
              {error}
            </div>
          )}
          {loading ? (
            <p className="text-slate-400 text-center py-12">Loading items...</p>
          ) : filtered.length === 0 ? (
            <p className="text-slate-400 text-center py-12">No items in this category.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filtered.map(item => {
                const isOwned = owned.includes(item.id)
                const isBuying = purchasing === item.id
                return (
                  <div
                    key={item.id}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-white text-sm leading-tight">{item.name}</span>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full capitalize shrink-0">
                        {item.category}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="text-amber-400 font-bold text-sm">🪙 {item.price}</span>
                      {isOwned ? (
                        <span className="text-xs bg-green-900/40 text-green-400 border border-green-700 px-2 py-1 rounded">
                          Owned
                        </span>
                      ) : (
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={isBuying}
                          className="text-xs bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-3 py-1 rounded transition"
                        >
                          {isBuying ? 'Buying...' : 'Buy'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
