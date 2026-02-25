import React, { useState } from 'react';
import { Text } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

interface DoorProps {
  position: [number, number, number];
  label: string;
  color?: string;
  onClick: () => void;
}

const Door: React.FC<DoorProps> = ({ position, label, color = '#8B4513', onClick }) => {
  const [hovered, setHovered] = useState(false);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick();
  };

  const emissiveIntensity = hovered ? 0.4 : 0.1;
  const doorColor = new THREE.Color(color);

  return (
    <group position={position}>
      {/* Door frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.7, 2.7, 0.12]} />
        <meshStandardMaterial
          color="#5C3317"
          roughness={0.6}
          metalness={0.3}
          emissive="#2a1a08"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Door panel */}
      <mesh
        position={[0, 0, 0.07]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[1.5, 2.5, 0.08]} />
        <meshStandardMaterial
          color={doorColor}
          roughness={0.5}
          metalness={0.2}
          emissive={doorColor}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      {/* Door knob */}
      <mesh position={[0.55, 0, 0.16]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.9}
          roughness={0.1}
          emissive="#AA8800"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Label above door */}
      <Text
        position={[0, 1.6, 0.2]}
        fontSize={0.28}
        color={hovered ? '#FFD700' : '#FFFFFF'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {label}
      </Text>
      {/* Click hint shown on hover */}
      {hovered && (
        <Text
          position={[0, -1.5, 0.2]}
          fontSize={0.18}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#000000"
        >
          Click to Enter
        </Text>
      )}
    </group>
  );
};

export default Door;
