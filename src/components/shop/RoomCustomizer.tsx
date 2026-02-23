import { useState } from 'react'
import { X, RotateCw, Save } from 'lucide-react'

interface DecorItem {
  id: string
  name: string
  emoji: string
  color: string
}

const OWNED_ITEMS: DecorItem[] = [
  { id: 'i1', name: 'Velvet Sofa', emoji: '🛋️', color: 'bg-purple-700' },
  { id: 'i2', name: 'Neon Sign', emoji: '🌟', color: 'bg-yellow-700' },
  { id: 'i3', name: 'Arcade Cabinet', emoji: '🕹️', color: 'bg-blue-700' },
  { id: 'i4', name: 'Potted Plant', emoji: '🪴', color: 'bg-green-700' },
  { id: 'i5', name: 'Disco Ball', emoji: '🪩', color: 'bg-pink-700' },
]

interface PlacedItem {
  itemId: string
  emoji: string
  color: string
  rotation: number
}

const GRID_SIZE = 10

interface Props {
  roomId?: string
  onClose?: () => void
}

// TODO: use roomId to load/save room-specific decor layouts via API
export default function RoomCustomizer({ roomId: _roomId, onClose }: Props) {
  const [selectedItem, setSelectedItem] = useState<DecorItem | null>(null)
  const [rotation, setRotation] = useState(0)
  const [grid, setGrid] = useState<(PlacedItem | null)[][]>(
    () => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))
  )

  const handleCellClick = (row: number, col: number) => {
    if (!selectedItem) return
    setGrid((prev) => {
      const next = prev.map((r) => [...r])
      next[row][col] = { itemId: selectedItem.id, emoji: selectedItem.emoji, color: selectedItem.color, rotation }
      return next
    })
  }

  const handleSelectItem = (item: DecorItem) => {
    setSelectedItem(item)
    setRotation(0)
  }

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360)
  }

  const handleSave = () => {
    const placed = grid.flatMap((row, r) =>
      row.map((cell, c) => (cell ? { row: r, col: c, ...cell } : null)).filter(Boolean)
    )
    console.log('Room design saved:', placed)
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-amber-400">🏠 Room Customizer</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-3 py-1.5 rounded-lg transition-colors"
          >
            <Save size={14} /> Save Room Design
          </button>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors ml-1">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 flex gap-6">
        {/* Sidebar */}
        <div className="w-44 shrink-0">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">Your Items</p>
          <div className="space-y-2">
            {OWNED_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                  selectedItem?.id === item.id
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span className="text-lg">{item.emoji}</span>
                <span className="truncate">{item.name}</span>
              </button>
            ))}
          </div>

          {selectedItem && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Selected</p>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center">
                <span className="text-3xl" style={{ display: 'inline-block', transform: `rotate(${rotation}deg)` }}>
                  {selectedItem.emoji}
                </span>
                <p className="text-xs text-slate-400 mt-1">{selectedItem.name}</p>
              </div>
              <button
                onClick={handleRotate}
                className="w-full flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 rounded-lg transition-colors"
              >
                <RotateCw size={14} /> Rotate
              </button>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">
            {selectedItem ? `Placing: ${selectedItem.emoji} – click a cell` : 'Select an item to place'}
          </p>
          <div
            className="grid border border-slate-700 rounded-lg overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`aspect-square flex items-center justify-center border border-slate-800 text-base transition-colors ${
                    cell ? cell.color : 'bg-slate-800 hover:bg-slate-700'
                  } ${selectedItem && !cell ? 'cursor-crosshair' : ''}`}
                >
                  {cell && (
                    <span style={{ transform: `rotate(${cell.rotation}deg)`, display: 'inline-block' }}>
                      {cell.emoji}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2 text-right">10 × 10 grid · click placed item to replace</p>
        </div>
      </div>
    </div>
  )
}
