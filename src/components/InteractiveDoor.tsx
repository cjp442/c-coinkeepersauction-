import React, { useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface InteractiveDoorProps {
  position: [number, number, number];
  label: string;
  destination: string;
  onClick: () => void;
}

const InteractiveDoor: React.FC<InteractiveDoorProps> = ({ position, label, destination, onClick }) => {
  const doorRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useFrame(() => {
    if (doorRef.current) {
      doorRef.current.rotation.y = isClicked ? Math.PI / 4 : 0;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={doorRef}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onClick={() => {
          setIsClicked(!isClicked);
          setTimeout(onClick, 500);
        }}
        castShadow
      >
        <boxGeometry args={[1, 2.5, 0.1]} />
        <meshStandardMaterial
          color={isHovered ? '#ff6b35' : '#8b4513'}
          metallic={0.3}
          roughness={0.7}
          emissive={isHovered ? '#ff6b35' : '#000000'}
          emissiveIntensity={isHovered ? 0.5 : 0}
        />
      </mesh>

      <Html position={[0, 0.5, 0.2]} scale={0.5}>
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '16px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: isHovered ? '0 0 20px rgba(255, 107, 53, 0.8)' : 'none',
          }}
        >
          {label}
        </div>
      </Html>

      <Html position={[0, -1, 0.2]} scale={0.4}>
        <div
          style={{
            backgroundColor: 'rgba(255, 215, 0, 0.9)',
            color: '#000',
            padding: '4px 8px',
            borderRadius: '3px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          → {destination}
        </div>
      </Html>
    </group>
  );
};

export default InteractiveDoor;