import React, { useState } from 'react'
import { Html } from '@react-three/drei'

interface HostRoomSceneProps {
  onBack: () => void
}

const HostRoomScene: React.FC<HostRoomSceneProps> = ({ onBack }) => {
  const [selectedChair, setSelectedChair] = useState<number | null>(null)

  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial color={0x1a0f0a} metallic={0.15} roughness={0.85} />
      </mesh>
      <mesh position={[0, 2, -10]} castShadow receiveShadow>
        <boxGeometry args={[10, 4, 0.5]} />
        <meshStandardMaterial color={0x0a0605} metallic={0.2} roughness={0.8} />
      </mesh>
      {[...Array(10)].map((_, i) => {
        const angle = (Math.PI / 10) * i - Math.PI / 20
        const radius = 6
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius + 2
        return (
          <group key={i} position={[x, 0.4, z]}>
            <mesh castShadow receiveShadow onClick={() => setSelectedChair(i)}>
              <boxGeometry args={[0.6, 0.8, 0.6]} />
              <meshStandardMaterial color={selectedChair === i ? 0xffd700 : 0x8b4513} emissive={selectedChair === i ? 0xffd700 : 0x2d1810} emissiveIntensity={selectedChair === i ? 0.5 : 0.1} />
            </mesh>
            <Html position={[0, 1.2, 0]} scale={0.6}>
              <div style={{ color: selectedChair === i ? '#000' : '#fff', backgroundColor: selectedChair === i ? '#ffd700' : 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', fontWeight: 'bold' }}>
                Seat {i + 1}
              </div>
            </Html>
          </group>
        )
      })}
      <Html position={[0, 3.5, -9.5]} scale={2}>
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: '#ff6b35', padding: '15px 30px', borderRadius: '8px', textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: '20px', fontWeight: 'bold', boxShadow: '0 0 20px rgba(255, 107, 53, 0.6)' }}>
          🎤 HOST ROOM - STREAMING
        </div>
      </Html>
      <Html position={[0, 0.3, 11]} scale={1.5}>
        <button onClick={onBack} style={{ padding: '12px 30px', backgroundColor: '#ff6b35', color: '#000', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
          ← BACK
        </button>
      </Html>
      <pointLight position={[-2, 3, -8]} intensity={1.2} color={0xff6b35} castShadow />
      <pointLight position={[2, 3, -8]} intensity={1.2} color={0xff6b35} castShadow />
    </group>
  )
}

export default HostRoomScene