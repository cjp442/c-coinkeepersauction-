import React, { useState } from 'react'
import { Html } from '@react-three/drei'

interface LobbySceneProps {
  onHostDoor: () => void
  onMemberDoor: () => void
}

const LobbyScene: React.FC<LobbySceneProps> = ({ onHostDoor, onMemberDoor }) => {
  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={0x2a2a2a} metallic={0.2} roughness={0.8} emissive={0x1a1a1a} />
      </mesh>
      <mesh position={[-3, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 2.5, 0.1]} />
        <meshStandardMaterial color={0x8b4513} metallic={0.3} roughness={0.7} emissive={0x000000} />
      </mesh>
      <mesh position={[3, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 2.5, 0.1]} />
        <meshStandardMaterial color={0x8b4513} metallic={0.3} roughness={0.7} emissive={0x000000} />
      </mesh>
      <Html position={[-3, 1, 0.15]} scale={0.6}>
        <button onClick={onHostDoor} style={{ padding: '20px 40px', backgroundColor: '#ff6b35', color: '#000', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 107, 53, 0.5)' }}>
          🏠 HOST ROOM
        </button>
      </Html>
      <Html position={[3, 1, 0.15]} scale={0.6}>
        <button onClick={onMemberDoor} style={{ padding: '20px 40px', backgroundColor: '#ffd700', color: '#000', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 215, 0, 0.5)' }}>
          👥 MEMBERS ROOM
        </button>
      </Html>
      <Html position={[0, 3, 0]} scale={2}>
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', color: '#ffd700', padding: '20px 40px', borderRadius: '8px', textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: '24px', fontWeight: 'bold', boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)' }}>
          ✨ KEEPERS AUCTION LOBBY ✨
        </div>
      </Html>
      <pointLight position={[-3, 3, 2]} intensity={1} color={0xff6b35} castShadow />
      <pointLight position={[3, 3, 2]} intensity={1} color={0xffd700} castShadow />
    </group>
  )
}

export default LobbyScene