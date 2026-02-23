import { useState } from 'react'
import { RigidBody } from '@react-three/rapier'
import { Text } from '@react-three/drei'
import Chair from '../objects/Chair'
import Portal from '../objects/Portal'
import Avatar from '../player/Avatar'
import PlayerController from '../player/PlayerController'
import { useGameStore } from '../utils/GameState'
import { GameChair, Portal as PortalType } from '../../types/game'
import { AnimationState } from '../player/AnimationManager'

const EXIT_PORTAL: PortalType = {
  id: 'exit-lobby',
  name: 'Back to Lobby',
  position: { x: 0, y: 0, z: 7 },
  rotation: Math.PI,
  targetScene: 'lobby',
  targetRoomId: '',
  isActive: true,
}

const AUDIENCE_CHAIRS: GameChair[] = Array.from({ length: 15 }, (_, i) => ({
  id: `audience-${i}`,
  position: { x: -7 + (i % 5) * 3.5, y: 0, z: 2 + Math.floor(i / 5) * 2 },
  rotation: Math.PI,
  isOccupied: false,
}))

interface HostRoomSceneProps {
  roomId: string
  onSceneChange: (scene: 'lobby' | 'host_room' | 'member_room', roomId: string) => void
}

export default function HostRoomScene({ roomId, onSceneChange }: HostRoomSceneProps) {
  const { playerPosition, playerRotation, isSitting } = useGameStore()
  const [animState, setAnimState] = useState<AnimationState>('idle')
  const [chairs, setChairs] = useState<GameChair[]>(AUDIENCE_CHAIRS)

  const handlePortalEnter = (portal: PortalType) => {
    onSceneChange(portal.targetScene, portal.targetRoomId)
  }

  return (
    <>
      <ambientLight intensity={0.4} color="#aabbff" />
      <spotLight position={[0, 8, -6]} intensity={4} color="#ffffff" angle={0.5} penumbra={0.2} castShadow />
      <pointLight position={[-4, 5, -5]} intensity={1.5} color="#ff4444" />
      <pointLight position={[4, 5, -5]} intensity={1.5} color="#4444ff" />
      <PlayerController
        onAnimationChange={setAnimState}
        portals={[EXIT_PORTAL]}
        chairs={chairs}
        onPortalEnter={handlePortalEnter}
        onSit={(c) => setChairs(prev => prev.map(ch => ch.id === c.id ? { ...ch, isOccupied: true } : ch))}
        onStand={() => setChairs(prev => prev.map(c => c.isOccupied ? { ...c, isOccupied: false } : c))}
      />
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[22, 0.1, 20]} />
          <meshStandardMaterial color="#111133" roughness={0.6} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 4, -9]}><boxGeometry args={[22, 8, 0.3]} /><meshStandardMaterial color="#1a1a3a" /></mesh>
      <mesh position={[0, 4, 9]}><boxGeometry args={[22, 8, 0.3]} /><meshStandardMaterial color="#1a1a3a" /></mesh>
      <mesh position={[-10, 4, 0]}><boxGeometry args={[0.3, 8, 20]} /><meshStandardMaterial color="#1a1a3a" /></mesh>
      <mesh position={[10, 4, 0]}><boxGeometry args={[0.3, 8, 20]} /><meshStandardMaterial color="#1a1a3a" /></mesh>
      <mesh position={[0, 0.3, -6]} receiveShadow castShadow>
        <boxGeometry args={[14, 0.6, 5]} />
        <meshStandardMaterial color="#2a2a4a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 4.5, -8.5]}>
        <boxGeometry args={[12, 5, 0.1]} />
        <meshStandardMaterial color="#000011" emissive="#001133" emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, 4.5, -8.3]} fontSize={0.5} color="#4488ff" anchorX="center">LIVE STREAM</Text>
      <Text position={[0, 3.8, -8.3]} fontSize={0.3} color="#888888" anchorX="center">{`Room: ${roomId}`}</Text>
      <mesh position={[5.8, 7.5, -8.4]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <pointLight position={[5.8, 7.5, -8.4]} intensity={0.5} color="#ff0000" distance={2} />
      {chairs.map(chair => (
        <Chair
          key={chair.id}
          chair={chair}
          onSit={(c) => setChairs(prev => prev.map(ch => ch.id === c.id ? { ...ch, isOccupied: true } : ch))}
          onStand={() => setChairs(prev => prev.map(c => c.isOccupied ? { ...c, isOccupied: false } : c))}
          isCurrentPlayerSitting={isSitting}
          playerPosition={playerPosition}
        />
      ))}
      <Portal portal={EXIT_PORTAL} onEnter={handlePortalEnter} playerPosition={playerPosition} />
      <Avatar position={playerPosition} rotation={playerRotation} animState={animState} isLocalPlayer />
    </>
  )
}
