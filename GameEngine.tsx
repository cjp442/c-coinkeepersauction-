import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, PerspectiveCamera } from '@react-three/drei';
import LobbyScene from './scenes/LobbyScene';
import HostRoomScene from './scenes/HostRoomScene';
import MemberRoomScene from './scenes/MemberRoomScene';
import * as THREE from 'three';

interface GameEngineProps {
  onSceneChange?: (scene: string) => void;
}

const GameEngine: React.FC<GameEngineProps> = ({ onSceneChange }) => {
  const [currentScene, setCurrentScene] = useState<'lobby' | 'host' | 'member'>('lobby');
  const [lightingMode, setLightingMode] = useState<'bright' | 'ambient'>('bright');

  const handleSceneChange = (scene: 'lobby' | 'host' | 'member') => {
    setCurrentScene(scene);
    onSceneChange?.(scene);
  };

  const renderScene = () => {
    switch (currentScene) {
      case 'host':
        return <HostRoomScene onBack={() => handleSceneChange('lobby')} />;
      case 'member':
        return <MemberRoomScene onBack={() => handleSceneChange('lobby')} />;
      case 'lobby':
      default:
        return (
          <LobbyScene
            onHostDoor={() => handleSceneChange('host')}
            onMemberDoor={() => handleSceneChange('member')}
          />
        );
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={60} />
        
        <ambientLight intensity={lightingMode === 'bright' ? 0.8 : 0.5} color={0xffffff} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={lightingMode === 'bright' ? 1.2 : 0.6}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          color={0xffffff}
        />
        <pointLight position={[5, 5, 5]} intensity={0.7} color={0xfffacd} />
        <pointLight position={[-5, 5, 5]} intensity={0.5} color={0xfffacd} />
        
        {renderScene()}

        <OrbitControls enableZoom enablePan enableRotate />
      </Canvas>

      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 100,
          display: 'flex',
          gap: '10px',
          flexDirection: 'column',
        }}
      >
        <button
          onClick={() => setLightingMode(lightingMode === 'bright' ? 'ambient' : 'bright')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Lighting: {lightingMode.toUpperCase()}
        </button>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 100,
          color: '#fff',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '10px 20px',
          borderRadius: '4px',
          fontFamily: 'Arial',
        }}
      >
        Current Scene: <strong>{currentScene.toUpperCase()}</strong>
      </div>
    </div>
  );
};

export default GameEngine;