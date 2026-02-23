/**
 * PortalDoor
 *
 * An ornate wooden portal door set into a wall opening.
 *
 * Features:
 *   – carved door frame
 *   – door panel with raised moulding
 *   – colour-coded emissive glow that intensifies when the player is near
 *   – floating label sign above the door
 *   – calls onEnter() when the player presses E within interaction range
 *
 * Props:
 *   position   – world-space [x, y, z] of the door centre (at floor level)
 *   rotationY  – door facing angle in radians (default 0 = faces +Z)
 *   type       – 'member' | 'host' (determines accent colour)
 *   label      – text shown on the sign above the door
 *   isNear     – controlled externally: true when camera is within range
 *   onEnter    – callback fired when E is pressed while isNear
 */
import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface PortalDoorProps {
  position: [number, number, number]
  rotationY?: number
  type: 'member' | 'host'
  /** text displayed on the sign above the door (reserved for future Text component) */
  label: string
  isNear: boolean
  onEnter: () => void
}

const DOOR_ACCENT: Record<'member' | 'host', string> = {
  member: '#33AAFF',
  host: '#FFD700',
}

export default function PortalDoor({
  position,
  rotationY = 0,
  type,
  label,
  isNear,
  onEnter,
}: PortalDoorProps) {
  // `label` is stored in the prop interface for future use with a Text
  // component (see public/assets/models/README.md).
  void label
  const glowRef = useRef<THREE.Mesh>(null)
  const glowIntensity = useRef(0)
  const accentColor = DOOR_ACCENT[type]

  // Listen for E key when near
  useEffect(() => {
    if (!isNear) return
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'KeyE') onEnter()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isNear, onEnter])

  // Animate glow intensity
  useFrame((_, delta) => {
    const target = isNear ? 1.0 : 0.2
    glowIntensity.current = THREE.MathUtils.lerp(glowIntensity.current, target, delta * 4)

    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = glowIntensity.current * 2.2
    }
  })

  // Label rows for the sign – reserved for future Text component use
  // const labelLines = label.split(' ')

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* ── Door frame ──────────────────────────────────────────── */}
      {/* Left jamb */}
      <mesh position={[-1.0, 1.5, 0]}>
        <boxGeometry args={[0.2, 3.0, 0.28]} />
        <meshStandardMaterial color="#3A1E08" roughness={0.75} />
      </mesh>
      {/* Right jamb */}
      <mesh position={[1.0, 1.5, 0]}>
        <boxGeometry args={[0.2, 3.0, 0.28]} />
        <meshStandardMaterial color="#3A1E08" roughness={0.75} />
      </mesh>
      {/* Lintel */}
      <mesh position={[0, 3.1, 0]}>
        <boxGeometry args={[2.4, 0.2, 0.28]} />
        <meshStandardMaterial color="#3A1E08" roughness={0.75} />
      </mesh>

      {/* ── Door panel ──────────────────────────────────────────── */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1.7, 2.8, 0.1]} />
        <meshStandardMaterial color="#5A3010" roughness={0.8} />
      </mesh>
      {/* Upper raised panel */}
      <mesh position={[0, 2.1, 0.06]}>
        <boxGeometry args={[1.2, 1.0, 0.04]} />
        <meshStandardMaterial color="#6B3A14" roughness={0.78} />
      </mesh>
      {/* Lower raised panel */}
      <mesh position={[0, 0.9, 0.06]}>
        <boxGeometry args={[1.2, 1.0, 0.04]} />
        <meshStandardMaterial color="#6B3A14" roughness={0.78} />
      </mesh>
      {/* Door knob */}
      <mesh position={[0.65, 1.5, 0.1]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#B8860B" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ── Accent glow plane (face of door) ────────────────────── */}
      <mesh ref={glowRef} position={[0, 1.5, 0.06]}>
        <planeGeometry args={[1.65, 2.75]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.2}
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Glow point light */}
      <pointLight
        position={[0, 1.5, 0.5]}
        color={accentColor}
        intensity={isNear ? 1.5 : 0.4}
        distance={4}
        decay={2}
      />

      {/* ── Sign above door ─────────────────────────────────────── */}
      {/* Sign backing */}
      <mesh position={[0, 3.55, 0]}>
        <boxGeometry args={[1.8, 0.55, 0.1]} />
        <meshStandardMaterial color="#2A1000" roughness={0.85} />
      </mesh>
      {/* Sign accent strip */}
      <mesh position={[0, 3.55, 0.06]}>
        <planeGeometry args={[1.7, 0.45]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* ── Prompt indicator (floats above sign when near) ──────── */}
      {isNear && (
        <mesh position={[0, 4.3, 0]}>
          <boxGeometry args={[0.9, 0.35, 0.06]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={1.5}
            transparent
            opacity={0.95}
          />
        </mesh>
      )}
    </group>
  )
}
