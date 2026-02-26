import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const Saloon = () => {
    // Set up your 3D saloon environment here
    return (
        <mesh>
            <boxBufferGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={'orange'} />
        </mesh>
    );
};

const ThreeDScene = () => {
    return (
        <Canvas>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <Saloon />
            <OrbitControls />
        </Canvas>
    );
};

export default ThreeDScene;