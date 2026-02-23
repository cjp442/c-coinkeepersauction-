import { useState } from 'react'
import { Text } from '@react-three/drei'
import { useTokens } from '../../contexts/TokenContext'

interface BarProps {
  position: { x: number; y: number; z: number }
  playerPosition: { x: number; y: number; z: number }
}

export default function Bar({ position, playerPosition }: BarProps) {
  const { addTokens } = useTokens()
  const [showMenu, setShowMenu] = useState(false)

  const tokenPackages = [
    { amount: 100, price: '$1.00' },
    { amount: 500, price: '$5.00' },
    { amount: 1000, price: '$10.00' },
    { amount: 5000, price: '$50.00' },
  ]

  const dx = playerPosition.x - position.x
  const dz = playerPosition.z - position.z
  const dist = Math.sqrt(dx * dx + dz * dz)
  const isNearby = dist < 3

  const handlePurchase = async (amount: number) => {
    await addTokens(amount, `Purchased ${amount} Keepers Coins`)
    setShowMenu(false)
  }

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[8, 0.15, 1.2]} />
        <meshStandardMaterial color="#5c3d1e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[8, 1.0, 1.0]} />
        <meshStandardMaterial color="#3d2810" roughness={0.8} />
      </mesh>
      {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
        <group key={i} position={[x, 0, 0.9]}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.08, 12]} />
            <meshStandardMaterial color="#2c1a0a" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.6, 6]} />
            <meshStandardMaterial color="#1a0f06" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {[-2.5, -1, 0.5, 2].map((x, i) => (
        <mesh key={i} position={[x, 1.35, -0.3]}>
          <cylinderGeometry args={[0.06, 0.08, 0.4, 8]} />
          <meshStandardMaterial
            color={(['#aa4400', '#2244aa', '#44aa22', '#aa8800'] as string[])[i]}
            transparent
            opacity={0.7}
            roughness={0.1}
          />
        </mesh>
      ))}
      <Text position={[0, 1.6, 0.4]} fontSize={0.3} color="#ffcc00" anchorX="center" anchorY="middle">
        🪙 Token Exchange
      </Text>
      {isNearby && (
        <Text
          position={[0, 2.0, 0.4]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          onClick={() => setShowMenu(!showMenu)}
        >
          Click to Purchase Tokens
        </Text>
      )}
      {isNearby && showMenu && tokenPackages.map((pkg, i) => (
        <group key={i} position={[-1.5 + i, 2.5, 0.4]}>
          <mesh onClick={() => handlePurchase(pkg.amount)}>
            <boxGeometry args={[0.8, 0.4, 0.1]} />
            <meshStandardMaterial color="#ffaa00" />
          </mesh>
          <Text position={[0, 0, 0.06]} fontSize={0.12} color="#000000" anchorX="center" anchorY="middle">
            {`${pkg.amount}c\n${pkg.price}`}
          </Text>
        </group>
      ))}
    </group>
  )
}
