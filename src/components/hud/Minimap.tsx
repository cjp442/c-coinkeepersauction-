interface Player {
  id: string
  x: number
  y: number
  name: string
}

interface MinimapProps {
  roomName?: string
  players?: Player[]
}

const GRID_COLS = 10
const GRID_ROWS = 8
const CELL_SIZE = 12
const EDGE_PADDING = 4

export default function Minimap({ roomName, players = [] }: MinimapProps) {
  const width = GRID_COLS * CELL_SIZE
  const height = GRID_ROWS * CELL_SIZE

  // Treat the first player in the list as "current player"
  const currentId = players[0]?.id

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-2 pointer-events-auto">
      {roomName && (
        <p className="text-xs text-slate-400 mb-1 truncate max-w-[120px]">{roomName}</p>
      )}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block"
        aria-label="Minimap"
      >
        {/* Grid lines */}
        {Array.from({ length: GRID_COLS + 1 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * CELL_SIZE}
            y1={0}
            x2={i * CELL_SIZE}
            y2={height}
            stroke="#334155"
            strokeWidth={0.5}
          />
        ))}
        {Array.from({ length: GRID_ROWS + 1 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={i * CELL_SIZE}
            x2={width}
            y2={i * CELL_SIZE}
            stroke="#334155"
            strokeWidth={0.5}
          />
        ))}

        {/* Player dots */}
        {players.map((p) => {
          const cx = Math.min(Math.max(p.x * width, EDGE_PADDING), width - EDGE_PADDING)
          const cy = Math.min(Math.max(p.y * height, EDGE_PADDING), height - EDGE_PADDING)
          const isCurrent = p.id === currentId
          return (
            <g key={p.id}>
              <circle
                cx={cx}
                cy={cy}
                r={isCurrent ? 4 : 3}
                fill={isCurrent ? '#f59e0b' : '#ffffff'}
                opacity={0.9}
              />
              <title>{p.name}</title>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
