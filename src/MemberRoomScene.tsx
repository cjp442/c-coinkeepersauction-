import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface MemberRoomSceneProps {
  onBack: () => void;
}

const MemberRoomScene: React.FC<MemberRoomSceneProps> = ({ onBack }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const decorItems = [
    { id: 'painting1', position: [-8, 2, -11] as [number, number, number], label: '🎨 Painting' },
    { id: 'painting2', position: [8, 2, -11] as [number, number, number], label: '🎨 Painting' },
    { id: 'sculpture', position: [0, 1, -11] as [number, number, number], label: '🗿 Sculpture' },
  ];

  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color={0x2a1810}
          metallic={0.1}
          roughness={0.8}
          emissive={0x1a0f0a}
        />
      </mesh>

      <mesh position={[0, 2, -10]} castShadow receiveShadow>
        <boxGeometry args={[20, 4, 0.5]} />
        <meshStandardMaterial
          color={0x1a0f0a}
          metallic={0.1}
          roughness={0.9}
        />
      </mesh>

      <mesh position={[-10, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 4, 20]} />
        <meshStandardMaterial
          color={0x1a0f0a}
          metallic={0.1}
          roughness={0.9}
        />
      </mesh>

      <mesh position={[10, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 4, 20]} />
        <meshStandardMaterial
          color={0x1a0f0a}
          metallic={0.1}
          roughness={0.9}
        />
      </mesh>

      <mesh position={[0, 3.9, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color={0x0a0605}
          metallic={0.1}
          roughness={0.9}
          emissive={0x1a1a1a}
        />
      </mesh>

      {[...Array(6)].map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = (col - 1) * 5;
        const z = 3 + row * 4;

        return (
          <group key={i} position={[x, 0.3, z]}>
            <mesh
              castShadow
              receiveShadow
              onClick={() => setSelectedItem(`lounge${i}`)}
            >
              <boxGeometry args={[1.2, 0.6, 1.2]} />
              <meshStandardMaterial
                color={selectedItem === `lounge${i}` ? 0xffd700 : 0x8b6914}
                emissive={selectedItem === `lounge${i}` ? 0xffd700 : 0x3d3d1f}
                emissiveIntensity={selectedItem === `lounge${i}` ? 0.6 : 0.1}
                metallic={0.4}
                roughness={0.5}
              />
            </mesh>

            <mesh position={[-0.7, 0.3, 0]} castShadow>
              <boxGeometry args={[0.2, 0.8, 1]} />
              <meshStandardMaterial color={0x8b6914} metallic={0.4} roughness={0.5} />
            </mesh>
            <mesh position={[0.7, 0.3, 0]} castShadow>
              <boxGeometry args={[0.2, 0.8, 1]} />
              <meshStandardMaterial color={0x8b6914} metallic={0.4} roughness={0.5} />
            </mesh>

            <Html position={[0, 1.2, 0]} scale={0.5}>
              <div
                style={{
                  color: selectedItem === `lounge${i}` ? '#000' : '#fff',
                  backgroundColor: selectedItem === `lounge${i}` ? '#ffd700' : 'rgba(0,0,0,0.7)',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                Lounge {i + 1}
              </div>
            </Html>
          </group>
        );
      })}

      {decorItems.map((item) => (
        <group
          key={item.id}
          position={item.position}
          onClick={() => setSelectedItem(item.id)}
        >
          <mesh castShadow>
            <boxGeometry args={[0.8, 1.5, 0.2]} />
            <meshStandardMaterial
              color={selectedItem === item.id ? 0xffd700 : 0xcd853f}
              emissive={selectedItem === item.id ? 0xffd700 : 0x8b6914}
              emissiveIntensity={selectedItem === item.id ? 0.5 : 0.2}
              metallic={0.6}
              roughness={0.4}
            />
          </mesh>

          <Html position={[0, -1, 0.15]} scale={0.6}>
            <div
              style={{
                color: '#fff',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '4px 8px',
                borderRadius: '3px',
                fontSize: '11px',
                fontWeight: 'bold',
              }}
            >
              {item.label}
            </div>
          </Html>
        </group>
      ))}

      <mesh position={[0, 0.4, -6]} castShadow receiveShadow>
        <boxGeometry args={[8, 0.8, 1]} />
        <meshStandardMaterial
          color={0x4a3c28}
          emissive={0x2a2418}
          emissiveIntensity={0.3}
          metallic={0.5}
          roughness={0.5}
        />
      </mesh>

      <mesh position={[0, 1.2, -6]} castShadow receiveShadow>
        <boxGeometry args={[8, 0.1, 1]} />
        <meshStandardMaterial
          color={0xcd853f}
          emissive={0x8b6914}
          emissiveIntensity={0.2}
          metallic={0.8}
          roughness={0.3}
        />
      </mesh>

      <pointLight position={[-4, 3, 2]} intensity={0.9} color={0xffd700} castShadow />
      <pointLight position={[4, 3, 2]} intensity={0.9} color={0xffd700} castShadow />
      <pointLight position={[0, 3, -4]} intensity={0.8} color={0xfffacd} castShadow />

      <Html position={[0, 3.5, -9.5]} scale={2}>
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#ffd700',
            padding: '15px 30px',
            borderRadius: '8px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            fontWeight: 'bold',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
          }}
        >
          👥 MEMBERS LOUNGE
        </div>
      </Html>

      <Html position={[0, 0.3, 10]} scale={1.5}>
        <button
          onClick={onBack}
          style={{
            padding: '12px 30px',
            backgroundColor: '#ffd700',
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

      {selectedItem && (
        <Html position={[0, -0.7, 0]} scale={1}>
          <div
            style={{
              backgroundColor: 'rgba(255, 215, 0, 0.9)',
              color: '#000',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            {selectedItem.startsWith('lounge') ? `You selected ${selectedItem.replace(/[0-9]/g, (n) => String(Number(n) + 1))}` : `You selected an item`}
          </div>
        </Html>
      )}
    </group>
  );
};

export default MemberRoomScene;