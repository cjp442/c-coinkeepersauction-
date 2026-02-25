import React, { useState } from 'react'

const VoiceChat: React.FC = () => {
  const [muted, setMuted] = useState(true)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        zIndex: 200,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        border: '2px solid #ffd700',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
      }}
    >
      <span>🎤 Voice Chat</span>
      <button
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
        aria-pressed={!muted}
        style={{
          padding: '6px 12px',
          backgroundColor: muted ? '#555' : '#ffd700',
          color: muted ? '#fff' : '#000',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '12px',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.7)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {muted ? 'Unmute' : 'Mute'}
      </button>
    </div>
  )
}

export default VoiceChat
