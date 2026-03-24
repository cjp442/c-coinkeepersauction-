import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Save } from 'lucide-react'
import { gameService } from '../services/gameService'
import { useAuth } from '../contexts/AuthContext'
import { DecorItem, DecorPlacement, MemberRoom } from '../types/game'

interface RoomCustomizerProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
}

export default function RoomCustomizer({ isOpen, onClose, roomId }: RoomCustomizerProps) {
  const { user } = useAuth()
  const [ownedItems, setOwnedItems] = useState<DecorItem[]>([])
  const [placements, setPlacements] = useState<DecorPlacement[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isOpen || !user) return
    setLoading(true)
    setError(null)
    Promise.all([
      gameService.getDecorItems(),
      gameService.getPurchasedDecor(user.id),
      gameService.getMemberRoom(user.id),
    ])
      .then(([allItems, purchasedIds, room]: [DecorItem[], string[], MemberRoom | null]) => {
        const purchased = allItems.filter(item => purchasedIds.includes(item.id))
        setOwnedItems(purchased)
        setPlacements(room?.decor ?? [])
      })
      .catch(() => setError('Failed to load room data.'))
      .finally(() => setLoading(false))
  }, [isOpen, user])

  const handlePlace = (item: DecorItem) => {
    const newPlacement: DecorPlacement = {
      itemId: item.id,
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
    }
    setPlacements(prev => [...prev, newPlacement])
    setSuccess(false)
  }

  const handleRemove = (index: number) => {
    setPlacements(prev => prev.filter((_, i) => i !== index))
    setSuccess(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await gameService.updateRoomDecor(roomId, placements)
      setSuccess(true)
    } catch {
      setError('Failed to save room layout.')
    } finally {
      setSaving(false)
    }
  }

  const getItemName = (itemId: string) =>
    ownedItems.find(i => i.id === itemId)?.name ?? itemId

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-amber-400">Customize Your Room</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">
          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded px-4 py-2">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-400 text-sm bg-green-900/20 border border-green-800 rounded px-4 py-2">
              Room saved successfully!
            </div>
          )}

          {loading ? (
            <p className="text-slate-400 text-center py-8">Loading...</p>
          ) : (
            <>
              {/* Owned items */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
                  Your Items
                </h3>
                {ownedItems.length === 0 ? (
                  <p className="text-slate-500 text-sm">
                    No decor items owned yet. Visit the Decor Shop!
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {ownedItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
                      >
                        <div>
                          <span className="text-white text-sm font-medium">{item.name}</span>
                          <span className="ml-2 text-xs text-slate-400 capitalize">{item.category}</span>
                        </div>
                        <button
                          onClick={() => handlePlace(item)}
                          className="flex items-center gap-1 text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded transition"
                        >
                          <Plus size={12} />
                          Place
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Placed items */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
                  Placed Items ({placements.length})
                </h3>
                {placements.length === 0 ? (
                  <p className="text-slate-500 text-sm">No items placed yet.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {placements.map((placement, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
                      >
                        <div className="text-sm">
                          <span className="text-white font-medium">{getItemName(placement.itemId)}</span>
                          <span className="ml-2 text-xs text-slate-400">
                            x:{placement.position.x} y:{placement.position.y} z:{placement.position.z}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemove(index)}
                          className="text-slate-400 hover:text-red-400 transition"
                          aria-label="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded transition"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
