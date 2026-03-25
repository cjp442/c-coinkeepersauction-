import React from 'react';
import { OrbitControls, Text } from '@react-three/drei';
import LobbyLighting from '../lighting/LobbyLighting';
import Door from '../objects/Door';

type Scene = 'lobby' | 'host' | 'member';

interface LobbySceneProps {
  onNavigate: (scene: Scene) => void;
}

const LobbyScene: React.FC<LobbySceneProps> = ({ onNavigate }) => {
  return (
    <>
      <LobbyLighting />
      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={4}
        maxDistance={14}
        target={[0, 2, -4]}
      />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#6B3A1F"
          roughness={0.7}
          metalness={0.1}
          emissive="#2a1008"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 4, -10]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial
          color="#8B7355"
          roughness={0.9}
          emissive="#3a2a10"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-10, 4, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial
          color="#7A6344"
          roughness={0.9}
          emissive="#2a1a08"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[10, 4, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial
          color="#7A6344"
          roughness={0.9}
          emissive="#2a1a08"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#5C4A2A"
          roughness={1}
          emissive="#1a0e04"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Bar counter */}
      <mesh position={[-6, 0.6, 2]} castShadow receiveShadow>
        <boxGeometry args={[5, 1.2, 1.5]} />
        <meshStandardMaterial
          color="#4A2C0A"
          roughness={0.6}
          metalness={0.15}
          emissive="#1a0e04"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Lobby sign */}
      <Text
        position={[0, 6.5, -9.8]}
        fontSize={0.6}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        Keeper's Auction House
      </Text>

      {/* Host Door */}
      <Door
        position={[-3.5, 1.35, -9.9]}
        label="Host"
        color="#8B4513"
        onClick={() => onNavigate('host')}
      />

      {/* Members Door */}
      <Door
        position={[3.5, 1.35, -9.9]}
        label="Members"
        color="#2E5E2E"
        onClick={() => onNavigate('member')}
      />
    </>
  );
};

export default LobbyScene;
