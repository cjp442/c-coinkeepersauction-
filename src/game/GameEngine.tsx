import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, Html } from '@react-three/drei'
import GamePhysics from './utils/GamePhysics'
import LobbyScene from './scenes/LobbyScene'
import HostRoomScene from './scenes/HostRoomScene'
import MemberRoomScene from './scenes/MemberRoomScene'
import { useGameStore } from './utils/GameState'

interface GameEngineProps {
  onExitGame?: () => void
}

function LoadingScreen() {
  return (
    <Html center>
      <div className="text-white text-2xl font-bold animate-pulse">Loading 3D World...</div>
    </Html>
  )
}

export default function GameEngine({ onExitGame }: GameEngineProps) {
  const { currentScene, currentRoomId, cameraMode, setCameraMode, setScene } = useGameStore()

  const handleSceneChange = (scene: 'lobby' | 'host_room' | 'member_room', roomId: string) => {
    setScene(scene, roomId || null)
  }

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2 flex-col">
        <div className="bg-black bg-opacity-60 text-white px-3 py-2 rounded text-sm">
          <div className="font-bold text-amber-400">
            {currentScene === 'lobby' ? '🍺 Saloon Lobby' : currentScene === 'host_room' ? '🎭 Host Stage' : '🏠 Member Room'}
          </div>
          <div className="text-xs text-gray-300 mt-1">WASD: Move | Shift: Run | E: Interact | C: Camera</div>
          <div className="text-xs text-gray-300">Click canvas to capture mouse | ESC to release</div>
        </div>
        <button
          onClick={() => setCameraMode(cameraMode === 'first_person' ? 'third_person' : 'first_person')}
          className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-sm"
        >
          📷 {cameraMode === 'first_person' ? '1st Person' : '3rd Person'}
        </button>
        {currentScene !== 'lobby' && (
          <button onClick={() => handleSceneChange('lobby', '')} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm">
            🚪 Back to Lobby
          </button>
        )}
        {onExitGame && (
          <button onClick={onExitGame} className="bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
            ✕ Exit Game
          </button>
        )}
      </div>
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black bg-opacity-60 text-amber-400 px-3 py-2 rounded text-sm font-bold">
          {currentScene === 'lobby' && '🍺 The Keepers Saloon'}
          {currentScene === 'host_room' && `🎭 Host Stage ${currentRoomId}`}
          {currentScene === 'member_room' && `🏠 Member Room ${currentRoomId}`}
        </div>
      </div>
      <Canvas
        shadows
        camera={{ position: [0, 3, 8], fov: 75, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#1a0d00' }}
      >
        <fog attach="fog" args={['#1a0d00', 20, 60]} />
        <Suspense fallback={<LoadingScreen />}>
          <GamePhysics>
            {currentScene === 'lobby' && <LobbyScene onSceneChange={handleSceneChange} />}
            {currentScene === 'host_room' && <HostRoomScene roomId={currentRoomId || 'host-1'} onSceneChange={handleSceneChange} />}
            {currentScene === 'member_room' && <MemberRoomScene roomId={currentRoomId || 'member-1'} onSceneChange={handleSceneChange} />}
          </GamePhysics>
          <Stars radius={80} depth={50} count={3000} factor={4} />
        </Suspense>
      </Canvas>
    </div>
  )
}
