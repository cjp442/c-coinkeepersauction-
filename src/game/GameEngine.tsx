import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Group } from 'three'
import LobbyScene from './scenes/LobbyScene'
import Avatar from './player/Avatar'
import PlayerController from './player/PlayerController'

export default function GameEngine() {
  const avatarRef = useRef<Group>(null)

  const handleCanvasClick = () => {
    document.getElementById('game-canvas')?.requestPointerLock()
  }

  return (
    <div
      id="game-canvas"
      style={{ width: '100%', height: '100%' }}
      onClick={handleCanvasClick}
    >
      <Canvas
        camera={{ position: [0, 4, 8], fov: 75, near: 0.1, far: 1000 }}
        shadows
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Scene */}
        <LobbyScene />

        {/* Player */}
        <Avatar ref={avatarRef} />
        <PlayerController avatarRef={avatarRef} />
      </Canvas>
    </div>
  )
}
