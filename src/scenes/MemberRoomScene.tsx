import React, { useState } from 'react'
import { Html } from '@react-three/drei'

interface MemberRoomSceneProps {
  onBack: () => void
}

const MemberRoomScene: React.FC<MemberRoomSceneProps> = ({ onBack }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={0x2a1810} metallic={0.1} roughness={0.8} />
      </mesh>
      {[...Array(6)].map((_, i) => {
        const row = Math.floor(i / 3)
        const col = i % 3
        const x = (col - 1) * 5
        const z = 3 + row * 4
        return (
          <group key={i} position={[x, 0.3, z]}>
            <mesh castShadow receiveShadow onClick={() => setSelectedItem(`lounge${i}`)}>
              <boxGeometry args={[1.2, 0.6, 1.2]} />
              <meshStandardMaterial color={selectedItem === `lounge${i}` ? 0xffd700 : 0x8b6914} emissive={selectedItem === `lounge${i}` ? 0xffd700 : 0x3d3d1f} emissiveIntensity={selectedItem === `lounge${i}` ? 0.6 : 0.1} />
            </mesh>
            <Html position={[0, 1.2, 0]} scale={0.5}>
              <div style={{ color: selectedItem === `lounge${i}` ? '#000' : '#fff', backgroundColor: selectedItem === `lounge${i}` ? '#ffd700' : 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', fontWeight: 'bold' }}>
                Lounge {i + 1}
              </div>
            </Html>
          </group>
        )
      })}
      <Html position={[0, 3.5, -9.5]} scale={2}>
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: '#ffd700', padding: '15px 30px', borderRadius: '8px', textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: '20px', fontWeight: 'bold', boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)' }}>
          👥 MEMBERS LOUNGE
        </div>
      </Html>
      <Html position={[0, 0.3, 10]} scale={1.5}>
        <button onClick={onBack} style={{ padding: '12px 30px', backgroundColor: '#ffd700', color: '#000', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
          ← BACK
        </button>
      </Html>
      <pointLight position={[-4, 3, 2]} intensity={0.9} color={0xffd700} castShadow />
      <pointLight position={[4, 3, 2]} intensity={0.9} color={0xffd700} castShadow />
    </group>
  )
}

export default MemberRoomScene