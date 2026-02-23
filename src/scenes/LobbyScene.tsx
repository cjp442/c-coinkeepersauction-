import React from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import InteractiveDoor from '../components/InteractiveDoor';

interface LobbySceneProps {
  onHostDoor: () => void;
  onMemberDoor: () => void;
}

const LobbyScene: React.FC<LobbySceneProps> = ({ onHostDoor, onMemberDoor }) => {
  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color={0x2a2a2a}
          metallic={0.2}
          roughness={0.8}
          emissive={0x1a1a1a}
        />
      </mesh>

      <mesh position={[0, 2, -8]} castShadow receiveShadow>
        <boxGeometry args={[20, 4, 0.5]} />
        <meshStandardMaterial
          color={0x1a1a1a}
          metallic={0.1}
          roughness={0.9}
        />
      </mesh>

      <mesh position={[-10, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 4, 20]} />
        <meshStandardMaterial
          color={0x2a2a2a}
          metallic={0.1}
          roughness={0.9}
        />
      </mesh>

      <mesh position={[10, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 4, 20]} />
        <meshStandardMaterial
          color={0x2a2a2a}
          metallic={0.1}
          roughness={0.9}
        />
      </mesh>

      <InteractiveDoor
        position={[-3, 0, 0]}
        label="🏠 HOST ROOM"
        destination="Host Area"
        onClick={onHostDoor}
      />

      <InteractiveDoor
        position={[3, 0, 0]}
        label="👥 MEMBERS ROOM"
        destination="Members Area"
        onClick={onMemberDoor}
      />

      <group position={[-4, 3.5, -2]}>
        <mesh castShadow>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial
            color={0xfffacd}
            emissive={0xffd700}
            emissiveIntensity={0.8}
            metallic={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      <group position={[4, 3.5, -2]}>
        <mesh castShadow>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial
            color={0xfffacd}
            emissive={0xffd700}
            emissiveIntensity={0.8}
            metallic={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      <group position={[0, 3.8, 0]}>
        <mesh castShadow>
          <coneGeometry args={[1.2, 0.8, 32]} />
          <meshStandardMaterial
            color={0xdaa520}
            emissive={0xff8c00}
            emissiveIntensity={0.6}
            metallic={0.7}
            roughness={0.3}
          />
        </mesh>
      </group>

      {[-6, 6].map((x, i) => (
        <mesh key={i} position={[x, 1.5, -7]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 3, 32]} />
          <meshStandardMaterial
            color={0xcd853f}
            metallic={0.4}
            roughness={0.6}
          />
        </mesh>
      ))}

      <Html position={[0, 3.5, -7]} scale={2}>
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#ffd700',
            padding: '20px 40px',
            borderRadius: '8px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            fontWeight: 'bold',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
          }}
        >
          ✨ KEEPERS AUCTION LOBBY ✨
        </div>
      </Html>

      <Html position={[0, -0.5, 5]} scale={1}>
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '15px 25px',
            borderRadius: '6px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
          }}
        >
          Click on a door to enter
        </div>
      </Html>
    </group>
  );
};

export default LobbyScene;