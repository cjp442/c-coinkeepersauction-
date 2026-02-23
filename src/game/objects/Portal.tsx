import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { Portal as PortalType } from '../../types/game'

interface PortalProps {
  portal: PortalType
  onEnter: (portal: PortalType) => void
  playerPosition: { x: number; y: number; z: number }
}

export default function Portal({ portal, onEnter, playerPosition: _playerPosition }: PortalProps) {
  const [, setHovered] = useState(false)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (glowRef.current) {
      glowRef.current.rotation.z = t * 0.5
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.4 + Math.sin(t * 2) * 0.2
    }
  })

  const color = portal.targetScene === 'host_room' ? '#ff6600' :
    portal.targetScene === 'member_room' ? '#6600ff' : '#00ff66'

  return (
    <group
      position={[portal.position.x, portal.position.y, portal.position.z]}
      rotation={[0, portal.rotation, 0]}
    >
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1.6, 3.2, 0.1]} />
        <meshStandardMaterial color="#4a3020" roughness={0.8} />
      </mesh>
      <mesh ref={glowRef} position={[0, 1.5, 0.05]}>
        <planeGeometry args={[1.4, 3]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[0, 3.3, 0]} fontSize={0.25} color="white" anchorX="center" anchorY="middle">
        {portal.name}
      </Text>
      <Text position={[0, -0.3, 0.2]} fontSize={0.18} color="#ffcc00" anchorX="center" anchorY="middle">
        Press E to Enter
      </Text>
      <mesh
        visible={false}
        onClick={() => portal.isActive && onEnter(portal)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[2, 3.5, 1]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  )
}
