import React, { useState } from 'react'
import { Html } from '@react-three/drei'

const PlayerProfile: React.FC = () => {
  const [playerLevel] = useState(1)
  const [points] = useState(0)

  return (
    <Html position={[9, 1, 0]} scale={0.5}>
      <div style={{ width: '250px', backgroundColor: 'rgba(0, 0, 0, 0.9)', border: '2px solid #ff6b35', borderRadius: '8px', padding: '15px', color: '#fff', fontFamily: 'Arial', boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff6b35' }}>
            🎮 PLAYER PROFILE
          </div>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', marginBottom: '5px' }}>
            <strong>Level:</strong> <span style={{ color: '#ffd700' }}>{playerLevel}</span>
          </div>
          <div style={{ width: '100%', height: '20px', backgroundColor: '#333', borderRadius: '10px', overflow: 'hidden', border: '1px solid #ff6b35' }}>
            <div style={{ width: `${(points % 100) * 1}%`, height: '100%', background: 'linear-gradient(90deg, #ff6b35, #ffd700)' }} />
          </div>
        </div>
        <div style={{ marginBottom: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px' }}>
            <strong>Points:</strong> <span style={{ color: '#ffd700' }}>{points}</span> / 100
          </div>
        </div>
      </div>
    </Html>
  )
}

export default PlayerProfile