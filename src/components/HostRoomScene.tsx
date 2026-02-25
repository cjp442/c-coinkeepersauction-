import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface HostRoomSceneProps {
  onBack: () => void;
}

const HostRoomScene: React.FC<HostRoomSceneProps> = ({ onBack }) => {
  const [selectedChair, setSelectedChair] = useState<number | null>(null);

  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial
          color={0x1a0f0a}
          metalness={0.15}
          roughness={0.85}
          emissive={0x0a0605}
        />
      </mesh>

      <mesh position={[0, 0.05, -8]} receiveShadow castShadow>
        <boxGeometry args={[8, 0.1, 4]} />
        <meshStandardMaterial
          color={0xff6b35}
          emissive={0xff6b35}
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      <mesh position={[0, 2, -10]} castShadow receiveShadow>
        <boxGeometry args={[10, 4, 0.5]} />
        <meshStandardMaterial
          color={0x0a0605}
          metalness={0.2}
          roughness={0.8}
          emissive={0x2d1810}
        />
      </mesh>

      <mesh position={[0, 2.2, -9.7]} castShadow>
        <boxGeometry args={[6, 2.5, 0.2]} />
        <meshStandardMaterial
          color={0x1a1a1a}
          emissive={0x00ffff}
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <pointLight position={[-2, 3, -8]} intensity={1.2} color={0xff6b35} castShadow />
      <pointLight position={[2, 3, -8]} intensity={1.2} color={0xff6b35} castShadow />
      <pointLight position={[0, 3.5, -7]} intensity={1} color={0xffd700} castShadow />

      {[...Array(10)].map((_, i) => {
        const angle = (Math.PI / 10) * i - Math.PI / 20;
        const radius = 6;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius + 2;

        return (
          <group key={i} position={[x, 0.4, z]}>
            <mesh
              castShadow
              receiveShadow
              onClick={() => setSelectedChair(i)}
            >
              <boxGeometry args={[0.6, 0.8, 0.6]} />
              <meshStandardMaterial
                color={selectedChair === i ? 0xffd700 : 0x8b4513}
                emissive={selectedChair === i ? 0xffd700 : 0x2d1810}
                emissiveIntensity={selectedChair === i ? 0.5 : 0.1}
                metalness={0.3}
                roughness={0.6}
              />
            </mesh>

            <mesh position={[0, 0.6, -0.2]} castShadow>
              <boxGeometry args={[0.6, 0.8, 0.1]} />
              <meshStandardMaterial
                color={selectedChair === i ? 0xffd700 : 0x8b4513}
                metalness={0.3}
                roughness={0.6}
              />
            </mesh>

            <Html position={[0, 1.2, 0]} scale={0.6}>
              <div
                style={{
                  color: selectedChair === i ? '#000' : '#fff',
                  backgroundColor: selectedChair === i ? '#ffd700' : 'rgba(0,0,0,0.7)',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                Seat {i + 1}
              </div>
            </Html>
          </group>
        );
      })}

      <mesh position={[0, 2, 10]} castShadow receiveShadow>
        <boxGeometry args={[25, 4, 0.5]} />
        <meshStandardMaterial
          color={0x1a0a05}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>

      <mesh position={[-12.5, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 4, 25]} />
        <meshStandardMaterial
          color={0x1a0a05}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>

      <mesh position={[12.5, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 4, 25]} />
        <meshStandardMaterial
          color={0x1a0a05}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>

      <mesh position={[0, 3.9, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial
          color={0x0a0605}
          metalness={0.1}
          roughness={0.9}
          emissive={0x1a1a1a}
        />
      </mesh>

      <Html position={[0, 3.5, -9.5]} scale={2}>
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#ff6b35',
            padding: '15px 30px',
            borderRadius: '8px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            fontWeight: 'bold',
            boxShadow: '0 0 20px rgba(255, 107, 53, 0.6)',
          }}
        >
          🎤 HOST ROOM - LIVE STREAMING AREA
        </div>
      </Html>

      <Html position={[0, 0.3, 11]} scale={1.5}>
        <button
          onClick={onBack}
          style={{
            padding: '12px 30px',
            backgroundColor: '#ff6b35',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          }}
        >
          ← BACK TO LOBBY
        </button>
      </Html>

      {selectedChair !== null && (
        <Html position={[0, -0.7, 0]} scale={1}>
          <div
            style={{
              backgroundColor: 'rgba(255, 107, 53, 0.9)',
              color: '#000',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            You selected Seat {selectedChair + 1}
          </div>
        </Html>
      )}
    </group>
  );
};

export default HostRoomScene;