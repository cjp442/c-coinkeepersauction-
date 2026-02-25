import GameEngine from '../game/GameEngine'

export default function GamePage() {
  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      <GameEngine />
    </div>
  )
}