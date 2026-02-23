import { useState } from 'react'

interface DecorItem {
  id: number
  x: number
  y: number
  width: number
  height: number
}

export default function RoomCustomizer() {
  const [decorItems, setDecorItems] = useState<DecorItem[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const addDecor = () => {
    setDecorItems(prev => [...prev, { id: Date.now(), x: 100, y: 100, width: 80, height: 80 }])
  }

  const removeDecor = (id: number) => {
    setDecorItems(prev => prev.filter(item => item.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const saveDesign = () => {
    console.log('Design saved:', decorItems)
    alert('Room design saved!')
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-amber-400">Room Customizer</h2>
      <div className="flex gap-3 mb-4">
        <button
          onClick={addDecor}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium"
        >
          + Add Decor
        </button>
        <button
          onClick={saveDesign}
          className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
        >
          Save Design
        </button>
      </div>

      <div
        className="relative bg-slate-900 border border-slate-700 rounded-lg overflow-hidden"
        style={{ width: 800, height: 600 }}
      >
        {decorItems.map(item => (
          <div
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            className={`absolute flex items-center justify-center bg-slate-700 rounded cursor-pointer text-xs text-slate-300 select-none ${
              selectedId === item.id ? 'ring-2 ring-amber-500' : ''
            }`}
            style={{ left: item.x, top: item.y, width: item.width, height: item.height }}
          >
            <span>Decor {item.id % 1000}</span>
            <button
              onClick={e => { e.stopPropagation(); removeDecor(item.id) }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}
        {decorItems.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-600 text-sm">
            Click "Add Decor" to start customizing
          </div>
        )}
      </div>
    </div>
  )
}
