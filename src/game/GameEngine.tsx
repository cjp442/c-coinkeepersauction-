import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import LobbyScene from '../scenes/LobbyScene'
import HostRoomScene from '../scenes/HostRoomScene'
import MemberRoomScene from '../scenes/MemberRoomScene'
import ChatSystem from '../components/ChatSystem'
import PlayerProfile from '../components/PlayerProfile'
import VoiceChat from '../components/VoiceChat'
import SpinningWheel from '../components/SpinningWheel'
import BlackjackGame from '../components/BlackjackGame'

type Scene = 'lobby' | 'host' | 'member'

const GameEngine: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<Scene>('lobby')
  const [lightingMode, setLightingMode] = useState<'bright' | 'ambient'>('bright')
  const [showWheel, setShowWheel] = useState(false)
  const [showBlackjack, setShowBlackjack] = useState(false)

  const renderScene = () => {
    switch (currentScene) {
      case 'host':
        return <HostRoomScene onBack={() => setCurrentScene('lobby')} />
      case 'member':
        return <MemberRoomScene onBack={() => setCurrentScene('lobby')} />
      case 'lobby':
      default:
        return (
          <LobbyScene
            onHostDoor={() => setCurrentScene('host')}
            onMemberDoor={() => setCurrentScene('member')}
          />
        )
    }
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas shadows gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={60} />
        <ambientLight intensity={lightingMode === 'bright' ? 0.85 : 0.55} />
        <directionalLight
          position={[15, 25, 15]}
          intensity={lightingMode === 'bright' ? 1.3 : 0.7}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
        />
        <pointLight position={[8, 8, 8]} intensity={0.8} color="#fffacd" castShadow />
        <pointLight position={[-8, 8, 8]} intensity={0.6} color="#fffacd" castShadow />
        {renderScene()}
        <ChatSystem />
        <PlayerProfile />
        <OrbitControls enableZoom enablePan enableRotate autoRotate={false} maxDistance={15} minDistance={2} />
      </Canvas>

      {/* Scene indicator */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, color: '#fff', backgroundColor: 'rgba(0,0,0,0.8)', padding: '12px 20px', borderRadius: '6px', fontFamily: 'Arial', border: '2px solid #ffd700', boxShadow: '0 0 15px rgba(255,215,0,0.3)' }}>
        📍 {currentScene.toUpperCase()}
      </div>

      {/* Voice chat (top-right) */}
      <VoiceChat />

      {/* Game buttons (bottom-left) */}
      <div style={{ position: 'absolute', bottom: '70px', left: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {currentScene === 'member' && (
          <button
            onClick={() => setShowWheel(true)}
            style={{ padding: '10px 20px', backgroundColor: '#7c3aed', color: '#fff', border: '2px solid #a78bfa', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
          >
            🎡 Spin Wheel
          </button>
        )}
        <button
          onClick={() => setShowBlackjack(true)}
          style={{ padding: '10px 20px', backgroundColor: '#14532d', color: '#fff', border: '2px solid #ffd700', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
        >
          🃏 Play 21
        </button>
      </div>

      {/* Lighting toggle (bottom-right) */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 100 }}>
        <button
          onClick={() => setLightingMode(lightingMode === 'bright' ? 'ambient' : 'bright')}
          style={{ padding: '12px 24px', backgroundColor: lightingMode === 'bright' ? '#ffd700' : '#333', color: lightingMode === 'bright' ? '#000' : '#fff', border: `2px solid ${lightingMode === 'bright' ? '#ffd700' : '#fff'}`, borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
        >
          💡 {lightingMode.toUpperCase()}
        </button>
      </div>

      {/* Banner */}
      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, backgroundColor: 'rgba(255,107,53,0.95)', color: '#000', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>
        🔥 KEEPERS AUCTION - Ultimate 3D Experience 🔥
      </div>

      {showWheel && <SpinningWheel onClose={() => setShowWheel(false)} />}
      {showBlackjack && <BlackjackGame onClose={() => setShowBlackjack(false)} />}
    </div>
  )
}

export default GameEngine
