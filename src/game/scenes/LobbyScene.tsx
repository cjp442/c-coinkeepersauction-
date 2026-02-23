import { useState } from 'react'
import { RigidBody } from '@react-three/rapier'
import LobbyLighting from '../lighting/LobbyLighting'
import Portal from '../objects/Portal'
import Chair from '../objects/Chair'
import Bar from '../objects/Bar'
import Avatar from '../player/Avatar'
import PlayerController from '../player/PlayerController'
import { useGameStore } from '../utils/GameState'
import { Portal as PortalType, GameChair } from '../../types/game'
import { AnimationState } from '../player/AnimationManager'

const PORTALS: PortalType[] = [
  { id: 'host-room-1', name: 'Host Stage', position: { x: -8, y: 0, z: -12 }, rotation: 0, targetScene: 'host_room', targetRoomId: 'host-1', isActive: true },
  { id: 'host-room-2', name: 'Host Stage 2', position: { x: -4, y: 0, z: -12 }, rotation: 0, targetScene: 'host_room', targetRoomId: 'host-2', isActive: true },
  { id: 'member-room-1', name: "Member's Room", position: { x: 4, y: 0, z: -12 }, rotation: 0, targetScene: 'member_room', targetRoomId: 'member-1', isActive: true },
  { id: 'member-room-2', name: 'Private Room', position: { x: 8, y: 0, z: -12 }, rotation: 0, targetScene: 'member_room', targetRoomId: 'member-2', isActive: false },
]

const CHAIRS: GameChair[] = [
  { id: 'chair-1', position: { x: -6, y: 0, z: 3 }, rotation: 0, isOccupied: false },
  { id: 'chair-2', position: { x: -4, y: 0, z: 3 }, rotation: 0, isOccupied: false },
  { id: 'chair-3', position: { x: -2, y: 0, z: 3 }, rotation: 0, isOccupied: false },
  { id: 'chair-4', position: { x: 2, y: 0, z: 3 }, rotation: 0, isOccupied: false },
  { id: 'chair-5', position: { x: 4, y: 0, z: 3 }, rotation: 0, isOccupied: false },
  { id: 'chair-6', position: { x: 6, y: 0, z: 3 }, rotation: 0, isOccupied: false },
  { id: 'barstool-1', position: { x: -6.5, y: 0, z: -1.2 }, rotation: Math.PI, isOccupied: false },
  { id: 'barstool-2', position: { x: -5.5, y: 0, z: -1.2 }, rotation: Math.PI, isOccupied: false },
]

interface LobbySceneProps {
  onSceneChange: (scene: 'lobby' | 'host_room' | 'member_room', roomId: string) => void
}

export default function LobbyScene({ onSceneChange }: LobbySceneProps) {
  const { playerPosition, playerRotation, isSitting } = useGameStore()
  const [animState, setAnimState] = useState<AnimationState>('idle')
  const [chairs, setChairs] = useState<GameChair[]>(CHAIRS)

  const handlePortalEnter = (portal: PortalType) => {
    onSceneChange(portal.targetScene, portal.targetRoomId)
  }

  const handleSit = (chair: GameChair) => {
    setChairs(prev => prev.map(c => c.id === chair.id ? { ...c, isOccupied: true } : c))
  }

  const handleStand = () => {
    setChairs(prev => prev.map(c => c.isOccupied ? { ...c, isOccupied: false } : c))
  }

  return (
    <>
      <LobbyLighting />
      <PlayerController
        onAnimationChange={setAnimState}
        portals={PORTALS}
        chairs={chairs}
        onPortalEnter={handlePortalEnter}
        onSit={handleSit}
        onStand={handleStand}
      />
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[30, 0.1, 30]} />
          <meshStandardMaterial color="#3d2810" roughness={0.9} />
        </mesh>
      </RigidBody>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`plank-${i}`} position={[0, 0.001, -7 + i * 1.5]} receiveShadow>
          <boxGeometry args={[30, 0.005, 0.05]} />
          <meshStandardMaterial color="#2a1a08" roughness={1} />
        </mesh>
      ))}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 4, -14]} receiveShadow castShadow>
          <boxGeometry args={[30, 8, 0.3]} />
          <meshStandardMaterial color="#5c3d1e" roughness={0.9} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 4, 9]} receiveShadow castShadow>
          <boxGeometry args={[30, 8, 0.3]} />
          <meshStandardMaterial color="#5c3d1e" roughness={0.9} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-13, 4, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.3, 8, 30]} />
          <meshStandardMaterial color="#4a3020" roughness={0.9} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[13, 4, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.3, 8, 30]} />
          <meshStandardMaterial color="#4a3020" roughness={0.9} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 8, 0]} receiveShadow>
        <boxGeometry args={[30, 0.3, 30]} />
        <meshStandardMaterial color="#2a1a08" roughness={1} />
      </mesh>
      <Bar position={{ x: -7, y: 0, z: -2 }} playerPosition={playerPosition} />
      {[[-4, 0, 2], [0, 0, 2], [4, 0, 2]].map((pos, i) => (
        <group key={`table-${i}`} position={pos as [number, number, number]}>
          <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.8, 0.8, 0.1, 16]} />
            <meshStandardMaterial color="#6b4c2a" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.9, 8]} />
            <meshStandardMaterial color="#4a3020" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {chairs.map(chair => (
        <Chair key={chair.id} chair={chair} onSit={handleSit} onStand={handleStand} isCurrentPlayerSitting={isSitting} playerPosition={playerPosition} />
      ))}
      {PORTALS.map(portal => (
        <Portal key={portal.id} portal={portal} onEnter={handlePortalEnter} playerPosition={playerPosition} />
      ))}
      <mesh position={[0, 0.15, -11]} receiveShadow>
        <boxGeometry args={[10, 0.3, 3]} />
        <meshStandardMaterial color="#4a3020" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.5, -12.5]}>
        <boxGeometry args={[10, 7, 0.1]} />
        <meshStandardMaterial color="#8b0000" roughness={0.9} />
      </mesh>
      {[[-5, 7, -4], [5, 7, -4], [0, 7, 2]].map((pos, i) => (
        <group key={`chandelier-${i}`} position={pos as [number, number, number]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1, 4]} />
            <meshStandardMaterial color="#888844" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.4, 0.03, 6, 12]} />
            <meshStandardMaterial color="#bbaa44" roughness={0.3} />
          </mesh>
          {[0, 1, 2, 3, 4].map(j => (
            <mesh key={j} position={[Math.sin(j * Math.PI * 2 / 5) * 0.4, 0.1, Math.cos(j * Math.PI * 2 / 5) * 0.4]}>
              <cylinderGeometry args={[0.03, 0.03, 0.15, 6]} />
              <meshStandardMaterial color="#f5f0e0" roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
      <group position={[9, 0, -5]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.4, 1.2, 0.7]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.25, 0.1]}>
          <boxGeometry args={[1.4, 0.1, 0.5]} />
          <meshStandardMaterial color="#f5f0e0" roughness={0.3} />
        </mesh>
      </group>
      <Avatar position={playerPosition} rotation={playerRotation} animState={animState} isLocalPlayer username="You" />
    </>
  )
}
