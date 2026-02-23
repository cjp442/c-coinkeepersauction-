/**
 * GameLobbyPage
 *
 * React-Three-Fiber Canvas wrapper for the 3D saloon lobby.
 *
 * UX flow:
 *   1. User sees a "Click to Enter" overlay.
 *   2. Clicking locks the pointer and starts first-person navigation.
 *   3. WASD/arrow keys move the camera; mouse controls look direction.
 *   4. Walking near a portal door reveals a glowing prompt.
 *   5. Pressing E enters that room (currently shows a toast notification;
 *      replace with useNavigate() once room pages exist).
 */
import { Suspense, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader } from '@react-three/drei'
import LobbyScene from '../components/lobby/LobbyScene'

export default function GameLobbyPage() {
  const [isLocked, setIsLocked]   = useState(false)
  const [nearDoor, setNearDoor]   = useState<'member' | 'host' | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  const showNotification = useCallback((msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const handlePortalEnter = useCallback((type: 'member' | 'host') => {
    showNotification(
      type === 'host'
        ? '🎤 Entering Host Room…'
        : '🎮 Entering Member Room…',
    )
  }, [showNotification])

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#0A0400' }}>
      {/* ── Click-to-start overlay ───────────────────────────────── */}
      {!isLocked && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 4, 0, 0.78)',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              color: '#fff',
              fontFamily: 'sans-serif',
            }}
          >
            <h1
              style={{
                fontSize: '2.2rem',
                fontWeight: 700,
                color: '#FFB347',
                marginBottom: '0.5rem',
                letterSpacing: '0.05em',
              }}
            >
              🍺 The Keeper's Saloon
            </h1>
            <p style={{ color: '#C8A06A', marginBottom: '1.8rem', fontSize: '1.05rem' }}>
              Your gateway to auctions, games &amp; live rooms
            </p>
            <div
              style={{
                display: 'inline-block',
                padding: '0.75rem 2rem',
                background: '#8B3A00',
                borderRadius: '0.5rem',
                color: '#FFD700',
                fontWeight: 600,
                fontSize: '1.1rem',
                boxShadow: '0 0 20px rgba(255,165,0,0.4)',
              }}
            >
              Click anywhere to enter
            </div>
            <p style={{ marginTop: '1.5rem', color: '#888', fontSize: '0.85rem' }}>
              WASD / ↑↓←→ to move &nbsp;·&nbsp; Mouse to look &nbsp;·&nbsp; E to interact &nbsp;·&nbsp; ESC to unlock mouse
            </p>
          </div>
        </div>
      )}

      {/* ── In-game HUD (visible when locked) ───────────────────── */}
      {isLocked && (
        <>
          {/* Crosshair */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <div style={{ width: 12, height: 12, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 5, left: 0, width: 12, height: 2, background: 'rgba(255,255,255,0.8)' }} />
              <div style={{ position: 'absolute', top: 0, left: 5, width: 2, height: 12, background: 'rgba(255,255,255,0.8)' }} />
            </div>
          </div>

          {/* Controls hint (bottom-left) */}
          <div
            style={{
              position: 'absolute',
              bottom: '1.2rem',
              left: '1.2rem',
              color: 'rgba(255,255,255,0.55)',
              fontSize: '0.78rem',
              fontFamily: 'sans-serif',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            WASD to move · Mouse to look · E to enter door · ESC to unlock
          </div>

          {/* Door interaction prompt (bottom-centre) */}
          {nearDoor && (
            <div
              style={{
                position: 'absolute',
                bottom: '3.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.7)',
                border: `1px solid ${nearDoor === 'host' ? '#FFD700' : '#33AAFF'}`,
                borderRadius: '0.4rem',
                padding: '0.45rem 1.2rem',
                color: nearDoor === 'host' ? '#FFD700' : '#33AAFF',
                fontFamily: 'sans-serif',
                fontSize: '0.9rem',
                fontWeight: 600,
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              [E] Enter {nearDoor === 'host' ? 'Host Room' : 'Member Room'}
            </div>
          )}
        </>
      )}

      {/* ── Toast notification ───────────────────────────────────── */}
      {notification && (
        <div
          style={{
            position: 'absolute',
            top: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid #FFB347',
            borderRadius: '0.5rem',
            padding: '0.6rem 1.5rem',
            color: '#FFD700',
            fontFamily: 'sans-serif',
            fontSize: '1rem',
            fontWeight: 600,
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          {notification}
        </div>
      )}

      {/* ── Three.js Canvas ──────────────────────────────────────── */}
      <Canvas
        shadows
        camera={{ position: [0, 1.7, 10], fov: 75, near: 0.1, far: 80 }}
        gl={{ antialias: true, toneMapping: 4 /* ACESFilmic */ }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <LobbyScene
            onLockChange={setIsLocked}
            onPortalEnter={handlePortalEnter}
            onNearDoor={setNearDoor}
          />
        </Suspense>
      </Canvas>

      {/* Drei loading indicator */}
      <Loader />
    </div>
  )
}
