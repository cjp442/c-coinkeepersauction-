import { useState } from 'react'

interface SpinningWheelProps {
  onClose: () => void
}

const SEGMENTS = [
  { label: '100 Tokens', color: '#d97706', tokens: 100 },
  { label: '50 Tokens', color: '#dc2626', tokens: 50 },
  { label: '200 Tokens', color: '#7c3aed', tokens: 200 },
  { label: 'Try Again', color: '#374151', tokens: 0 },
  { label: '25 Tokens', color: '#16a34a', tokens: 25 },
  { label: '500 Tokens', color: '#0891b2', tokens: 500 },
  { label: '75 Tokens', color: '#2563eb', tokens: 75 },
  { label: 'Jackpot!', color: '#b45309', tokens: 1000 },
]

const SpinningWheel: React.FC<SpinningWheelProps> = ({ onClose }) => {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<(typeof SEGMENTS)[0] | null>(null)
  const [spinsLeft, setSpinsLeft] = useState(1)

  const segmentAngle = 360 / SEGMENTS.length

  const spin = () => {
    if (spinning || spinsLeft <= 0) return
    setSpinning(true)
    setResult(null)
    const extraSpins = 5 + Math.random() * 5
    const winIndex = Math.floor(Math.random() * SEGMENTS.length)
    const targetAngle = rotation + extraSpins * 360 + (360 - winIndex * segmentAngle - segmentAngle / 2)
    setRotation(targetAngle)
    setTimeout(() => {
      setSpinning(false)
      setResult(SEGMENTS[winIndex])
      setSpinsLeft(s => s - 1)
    }, 4000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{ backgroundColor: '#1e293b', border: '2px solid #ffd700', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '90%', textAlign: 'center', color: '#fff', fontFamily: 'Arial' }}>
        <h2 style={{ color: '#ffd700', fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>🎡 Spin the Wheel</h2>
        <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '13px' }}>Daily spin — win Keeper Tokens!</p>

        {/* Wheel container */}
        <div style={{ position: 'relative', width: '280px', height: '280px', margin: '0 auto 24px' }}>
          {/* Pointer */}
          <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '26px solid #ffd700', zIndex: 10 }} />

          <svg
            width="280"
            height="280"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {SEGMENTS.map((seg, i) => {
              const startAngle = (i * segmentAngle - 90) * (Math.PI / 180)
              const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180)
              const cx = 140, cy = 140, r = 130
              const x1 = cx + r * Math.cos(startAngle)
              const y1 = cy + r * Math.sin(startAngle)
              const x2 = cx + r * Math.cos(endAngle)
              const y2 = cy + r * Math.sin(endAngle)
              const midAngle = (startAngle + endAngle) / 2
              const tx = cx + r * 0.65 * Math.cos(midAngle)
              const ty = cy + r * 0.65 * Math.sin(midAngle)
              return (
                <g key={i}>
                  <path
                    d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`}
                    fill={seg.color}
                    stroke="#1e293b"
                    strokeWidth="2"
                  />
                  <text
                    x={tx}
                    y={ty}
                    fill="#fff"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${i * segmentAngle + segmentAngle / 2}, ${tx}, ${ty})`}
                  >
                    {seg.label}
                  </text>
                </g>
              )
            })}
            <circle cx="140" cy="140" r="18" fill="#ffd700" stroke="#1e293b" strokeWidth="3" />
            <text x="140" y="140" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">★</text>
          </svg>
        </div>

        {/* Result */}
        {result && (
          <div style={{ marginBottom: '16px', padding: '14px', backgroundColor: result.tokens > 0 ? '#064e3b' : '#374151', borderRadius: '8px', border: `2px solid ${result.tokens > 0 ? '#10b981' : '#6b7280'}` }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: result.tokens > 0 ? '#6ee7b7' : '#9ca3af', margin: 0 }}>
              {result.tokens > 0 ? `🎉 You won ${result.tokens} Keeper Tokens!` : '😢 No tokens this time — try again tomorrow!'}
            </p>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={spin}
            disabled={spinning || spinsLeft <= 0}
            style={{ padding: '12px 32px', backgroundColor: spinning || spinsLeft <= 0 ? '#374151' : '#ffd700', color: spinning || spinsLeft <= 0 ? '#6b7280' : '#000', border: 'none', borderRadius: '8px', cursor: spinning || spinsLeft <= 0 ? 'not-allowed' : 'pointer', fontSize: '15px', fontWeight: 'bold' }}
          >
            {spinning ? 'Spinning…' : spinsLeft <= 0 ? 'Come Back Tomorrow' : '🎡 SPIN!'}
          </button>
          <button
            onClick={onClose}
            style={{ padding: '12px 24px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
          >
            Close
          </button>
        </div>
        {spinsLeft > 0 && !spinning && !result && (
          <p style={{ marginTop: '10px', color: '#6b7280', fontSize: '12px' }}>
            {spinsLeft} free spin{spinsLeft !== 1 ? 's' : ''} remaining today
          </p>
        )}
      </div>
    </div>
  )
}

export default SpinningWheel
