import React, { useState } from 'react';
import { OrbitControls, Text } from '@react-three/drei';

type Scene = 'lobby' | 'host' | 'member';

interface MemberRoomSceneProps {
  memberId?: string;
  onNavigate: (scene: Scene) => void;
}

const MemberRoomScene: React.FC<MemberRoomSceneProps> = ({ memberId, onNavigate }) => {
  const [layout, setLayout] = useState<'default' | 'cozy' | 'grand'>('default');

  const floorColors: Record<string, string> = {
    default: '#4A3520',
    cozy: '#6B4C2A',
    grand: '#2C1F0E',
  };

  const wallColors: Record<string, string> = {
    default: '#5C4A30',
    cozy: '#7A5C3A',
    grand: '#3A2A18',
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} color="#ffeedd" />
      <pointLight position={[0, 6, 0]} intensity={3} color="#ffcc88" distance={18} decay={2} />
      <pointLight position={[-5, 3, 3]} intensity={1.2} color="#ff8844" distance={8} decay={2} />
      <pointLight position={[5, 3, 3]} intensity={1.2} color="#ff8844" distance={8} decay={2} />
      <directionalLight position={[3, 6, 3]} intensity={0.8} color="#ffe8cc" />

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={14}
        target={[0, 2, 0]}
      />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial
          color={floorColors[layout]}
          roughness={0.6}
          metalness={0.1}
          emissive={floorColors[layout]}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 4, -8]} receiveShadow>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial
          color={wallColors[layout]}
          roughness={0.85}
          emissive={wallColors[layout]}
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-8, 4, 0]} receiveShadow>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial
          color={wallColors[layout]}
          roughness={0.85}
          emissive={wallColors[layout]}
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[8, 4, 0]} receiveShadow>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial
          color={wallColors[layout]}
          roughness={0.85}
          emissive={wallColors[layout]}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Central display table */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 1, 2]} />
        <meshStandardMaterial
          color="#3A2210"
          roughness={0.5}
          metalness={0.2}
          emissive="#1a0e04"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Room title */}
      <Text
        position={[0, 7, -7.8]}
        fontSize={0.55}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        Member Room {memberId ? `— ${memberId}` : ''}
      </Text>

      {/* Layout selection buttons */}
      {(['default', 'cozy', 'grand'] as const).map((layoutOption, i) => (
        <group
          key={layoutOption}
          position={[-2 + i * 2, 2.5, -7.5]}
          onClick={() => setLayout(layoutOption)}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <mesh>
            <boxGeometry args={[1.6, 0.6, 0.15]} />
            <meshStandardMaterial
              color={layout === layoutOption ? '#FFD700' : '#5C3317'}
              emissive={layout === layoutOption ? '#AA8800' : '#1a0e04'}
              emissiveIntensity={0.35}
              roughness={0.5}
              metalness={0.2}
            />
          </mesh>
          <Text
            position={[0, 0, 0.1]}
            fontSize={0.22}
            color={layout === layoutOption ? '#000000' : '#FFFFFF'}
            anchorX="center"
            anchorY="middle"
          >
            {layoutOption.charAt(0).toUpperCase() + layoutOption.slice(1)}
          </Text>
        </group>
      ))}

      {/* Back to Lobby button */}
      <group
        position={[0, 1.2, 6]}
        onClick={() => onNavigate('lobby')}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <mesh>
          <boxGeometry args={[3, 0.8, 0.2]} />
          <meshStandardMaterial
            color="#2E5E2E"
            emissive="#2E5E2E"
            emissiveIntensity={0.3}
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>
        <Text
          position={[0, 0, 0.15]}
          fontSize={0.3}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          ← Back to Lobby
        </Text>
      </group>
    </>
  );
};

export default MemberRoomScene;
