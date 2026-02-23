import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { GameChair } from '../../types/game'

interface ChairProps {
  chair: GameChair
  onSit: (chair: GameChair) => void
  onStand: () => void
  isCurrentPlayerSitting: boolean
  playerPosition: { x: number; y: number; z: number }
}

export default function Chair({ chair, onSit, onStand, isCurrentPlayerSitting, playerPosition }: ChairProps) {
  const [showHint, setShowHint] = useState(false)

  useFrame(() => {
    const dx = playerPosition.x - chair.position.x
    const dz = playerPosition.z - chair.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    setShowHint(dist < 2.5 && !chair.isOccupied)
  })

  const handleClick = () => {
    if (isCurrentPlayerSitting) {
      onStand()
    } else if (!chair.isOccupied) {
      onSit(chair)
    }
  }

  const legPositions: [number, number, number][] = [
    [-0.25, 0, -0.25],
    [0.25, 0, -0.25],
    [-0.25, 0, 0.25],
    [0.25, 0, 0.25],
  ]

  return (
    <group
      position={[chair.position.x, chair.position.y, chair.position.z]}
      rotation={[0, chair.rotation, 0]}
    >
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.6, 0.08, 0.6]} />
        <meshStandardMaterial color="#6b4c2a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.9, -0.26]}>
        <boxGeometry args={[0.6, 0.8, 0.08]} />
        <meshStandardMaterial color="#6b4c2a" roughness={0.7} />
      </mesh>
      {legPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 6]} />
          <meshStandardMaterial color="#4a3020" roughness={0.8} />
        </mesh>
      ))}
      <mesh visible={false} onClick={handleClick}>
        <cylinderGeometry args={[1.2, 1.2, 1.5, 8]} />
        <meshBasicMaterial />
      </mesh>
      {showHint && (
        <Text position={[0, 1.5, 0]} fontSize={0.2} color="#ffcc00" anchorX="center" anchorY="middle">
          {isCurrentPlayerSitting ? 'E - Stand Up' : 'E - Sit Down'}
        </Text>
      )}
      {chair.isOccupied && (
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#ff4444" />
        </mesh>
      )}
    </group>
  )
}
