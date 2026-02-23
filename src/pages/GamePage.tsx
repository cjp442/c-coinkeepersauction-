import GameEngine from '../game/GameEngine'

export default function GamePage() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
      <GameEngine />

      {/* HUD Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: 14,
            background: 'rgba(0,0,0,0.4)',
            padding: '6px 10px',
            borderRadius: 4,
          }}
        >
          WASD to move · Click to capture mouse
        </div>
      </div>
    </div>
  )
}
