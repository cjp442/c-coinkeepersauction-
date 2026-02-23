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
  id: 'exit-to-lobby',
  name: 'Back to Lobby',
  position: { x: 0, y: 0, z: 6 },
  rotation: Math.PI,
  targetScene: 'lobby',
  targetRoomId: '',
  isActive: true,
}

const ROOM_CHAIRS: GameChair[] = [
  { id: 'mr-chair-1', position: { x: -3, y: 0, z: -1 }, rotation: 0.5, isOccupied: false },
  { id: 'mr-chair-2', position: { x: 3, y: 0, z: -1 }, rotation: -0.5, isOccupied: false },
  { id: 'mr-sofa-1', position: { x: 0, y: 0, z: 1 }, rotation: Math.PI, isOccupied: false },
]

interface MemberRoomSceneProps {
  roomId: string
  onSceneChange: (scene: 'lobby' | 'host_room' | 'member_room', roomId: string) => void
}

export default function MemberRoomScene({ roomId, onSceneChange }: MemberRoomSceneProps) {
  const { playerPosition, playerRotation, isSitting } = useGameStore()
  const [animState, setAnimState] = useState<AnimationState>('idle')
  const [chairs, setChairs] = useState<GameChair[]>(ROOM_CHAIRS)

  return (
    <>
      <ambientLight intensity={0.5} color="#ffeecc" />
      <pointLight position={[0, 5, 0]} intensity={2} color="#ffaa44" distance={15} />
      <pointLight position={[-4, 3, -3]} intensity={1} color="#ff8833" distance={8} />
      <pointLight position={[4, 3, -3]} intensity={1} color="#ff8833" distance={8} />
      <PlayerController
        onAnimationChange={setAnimState}
        portals={[EXIT_PORTAL]}
        chairs={chairs}
        onPortalEnter={(p) => onSceneChange(p.targetScene, p.targetRoomId)}
        onSit={(c) => setChairs(prev => prev.map(ch => ch.id === c.id ? { ...ch, isOccupied: true } : ch))}
        onStand={() => setChairs(prev => prev.map(c => c.isOccupied ? { ...c, isOccupied: false } : c))}
      />
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[16, 0.1, 16]} />
          <meshStandardMaterial color="#663322" roughness={0.9} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 0.001, 0]}>
        <boxGeometry args={[10, 0.01, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={1} />
      </mesh>
      <mesh position={[0, 3, -7]}><boxGeometry args={[16, 6, 0.3]} /><meshStandardMaterial color="#f5deb3" /></mesh>
      <mesh position={[0, 3, 7]}><boxGeometry args={[16, 6, 0.3]} /><meshStandardMaterial color="#f5deb3" /></mesh>
      <mesh position={[-7, 3, 0]}><boxGeometry args={[0.3, 6, 16]} /><meshStandardMaterial color="#f5deb3" /></mesh>
      <mesh position={[7, 3, 0]}><boxGeometry args={[0.3, 6, 16]} /><meshStandardMaterial color="#f5deb3" /></mesh>
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[16, 0.3, 16]} />
        <meshStandardMaterial color="#fffff0" />
      </mesh>
      <group position={[0, 0, -6.5]}>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[2.5, 2, 0.5]} />
          <meshStandardMaterial color="#8b7355" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.7, 0.1]}>
          <boxGeometry args={[1.5, 1.2, 0.3]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
        <pointLight position={[0, 0.8, -0.2]} intensity={2} color="#ff5500" distance={6} />
      </group>
      <mesh position={[0, 0.55, -1.5]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.1, 1.2]} />
        <meshStandardMaterial color="#6b4c2a" roughness={0.6} />
      </mesh>
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
      <Text position={[0, 5, -6.6]} fontSize={0.4} color="#8b4513" anchorX="center">{`Room: ${roomId}`}</Text>
      <Portal portal={EXIT_PORTAL} onEnter={(p) => onSceneChange(p.targetScene, p.targetRoomId)} playerPosition={playerPosition} />
      <Avatar position={playerPosition} rotation={playerRotation} animState={animState} isLocalPlayer />
    </>
  )
}
