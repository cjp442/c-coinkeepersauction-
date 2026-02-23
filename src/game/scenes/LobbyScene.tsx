import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useState } from 'react';

const Door = ({ position, label }) => {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  return (
    <mesh
      position={position}
      onClick={() => setClicked(!clicked)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1, 2, 0.1]} />
      <meshStandardMaterial color={clicked ? 'orange' : 'brown'} />
      {hovered && (
        <Html position={[0, 1, 0.1]}>
          <div style={{ color: 'white', background: 'rgba(0,0,0,0.7)', padding: '5px' }}>{label}</div>
        </Html>
      )}
    </mesh>
  );
};

const LobbyScene = () => {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Door position={[-2, 0, 0]} label="Door 1" />
      <Door position={[2, 0, 0]} label="Door 2" />
      <OrbitControls />
    </Canvas>
  );
};

export default LobbyScene;