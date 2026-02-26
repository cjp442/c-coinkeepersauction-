import React from 'react';
import { OrbitControls, Text } from '@react-three/drei';

type Scene = 'lobby' | 'host' | 'member';

interface HostRoomSceneProps {
  onNavigate: (scene: Scene) => void;
}

const HostRoomScene: React.FC<HostRoomSceneProps> = ({ onNavigate }) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} color="#ffe8cc" />
      <spotLight
        position={[0, 8, 0]}
        intensity={4}
        color="#aaccff"
        angle={0.5}
        penumbra={0.4}
        castShadow
      />
      <directionalLight position={[-5, 6, 4]} intensity={1} color="#ffe8cc" />

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={4}
        maxDistance={16}
        target={[0, 2, 0]}
      />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#2C1A0E"
          roughness={0.6}
          metalness={0.1}
          emissive="#0d0804"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Back wall with screen */}
      <mesh position={[0, 4, -9]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial
          color="#1A1A2E"
          roughness={0.8}
          emissive="#0a0a20"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Wall screen / display */}
      <mesh position={[0, 4, -8.8]}>
        <planeGeometry args={[10, 5.5]} />
        <meshStandardMaterial
          color="#0a2040"
          emissive="#0a3060"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* Screen label */}
      <Text
        position={[0, 4, -8.5]}
        fontSize={0.5}
        color="#00CCFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000033"
      >
        Live Auction
      </Text>

      {/* Chairs */}
      {[...Array(10)].map((_, index) => {
        const col = index % 5;
        const row = Math.floor(index / 5);
        return (
          <group key={index} position={[col * 2 - 4, 0, row * 2 + 1]}>
            {/* Chair seat */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[0.7, 0.1, 0.7]} />
              <meshStandardMaterial
                color="#4A2C0A"
                roughness={0.7}
                emissive="#1a0e04"
                emissiveIntensity={0.15}
              />
            </mesh>
            {/* Chair back */}
            <mesh position={[0, 0.9, -0.3]} castShadow>
              <boxGeometry args={[0.7, 0.8, 0.1]} />
              <meshStandardMaterial
                color="#4A2C0A"
                roughness={0.7}
                emissive="#1a0e04"
                emissiveIntensity={0.15}
              />
            </mesh>
          </group>
        );
      })}

      {/* Room title */}
      <Text
        position={[0, 7, -8.8]}
        fontSize={0.55}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        Host Room
      </Text>

      {/* Back to Lobby button */}
      <group
        position={[0, 1.2, 7]}
        onClick={() => onNavigate('lobby')}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <mesh>
          <boxGeometry args={[3, 0.8, 0.2]} />
          <meshStandardMaterial
            color="#8B4513"
            emissive="#8B4513"
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

export default HostRoomScene;