import React, { useState } from 'react'

const SEGMENTS = ['50 Tokens', '100 Tokens', '250 Tokens', 'Try Again', '10 Tokens', '500 Tokens']

const SpinWheel: React.FC = () => {
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setResult(null)
    setTimeout(() => {
      const prize = SEGMENTS[Math.floor(Math.random() * SEGMENTS.length)]
      setResult(prize)
      setSpinning(false)
    }, 1500)
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '140px',
        right: '20px',
        zIndex: 200,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        border: '2px solid #ff6b35',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
        minWidth: '160px',
      }}
    >
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>🎡 Spin & Win</div>
      <button
        onClick={spin}
        disabled={spinning}
        style={{
          padding: '8px 16px',
          backgroundColor: spinning ? '#555' : '#ff6b35',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: spinning ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          fontSize: '13px',
        }}
      >
        {spinning ? 'Spinning…' : 'Spin!'}
      </button>
      {result && (
        <div style={{ marginTop: '8px', color: '#ffd700', fontWeight: 'bold' }}>
          🎉 {result}
        </div>
      )}
    </div>
  )
}

export default SpinWheel
