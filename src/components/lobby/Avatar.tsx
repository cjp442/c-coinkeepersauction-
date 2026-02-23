/**
 * Avatar
 *
 * Procedural low-poly humanoid model built from box/cylinder primitives.
 * Supports idle, walk, sit, and wave animations driven by useFrame.
 *
 * When GLB avatar assets are available (see public/assets/models/README.md),
 * swap the procedural geometry for:
 *
 *   const { scene, animations } = useGLTF('/assets/models/avatar/avatar_base_male.glb')
 *   const { actions } = useAnimations(animations, scene)
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type AvatarAnimation = 'idle' | 'walk' | 'run' | 'sit' | 'wave'

interface AvatarProps {
  position?: [number, number, number]
  rotationY?: number
  skinColor?: string
  clothingColor?: string
  hairColor?: string
  animation?: AvatarAnimation
}

export default function Avatar({
  position = [0, 0, 0],
  rotationY = 0,
  skinColor = '#F0C090',
  clothingColor = '#8B4513',
  hairColor = '#3D1C00',
  animation = 'idle',
}: AvatarProps) {
  const rootRef = useRef<THREE.Group>(null)
  const torsoRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  const leftForearmRef = useRef<THREE.Group>(null)
  const rightForearmRef = useRef<THREE.Group>(null)

  // Avatar proportions (approximate humanoid at ~1.8 units tall)
  const HEAD = 0.21
  const TORSO_H = 0.62
  const TORSO_W = 0.34
  const UPPER_LIMB: [number, number, number] = [0.11, 0.38, 0.11]
  const LOWER_LIMB: [number, number, number] = [0.1, 0.36, 0.1]
  const LEG_W = 0.13

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Reset all rotations each frame then apply animation
    const zero = new THREE.Euler(0, 0, 0)
    const limbRefs = [leftArmRef, rightArmRef, leftLegRef, rightLegRef,
      leftForearmRef, rightForearmRef]
    limbRefs.forEach((r) => {
      if (r.current) r.current.rotation.copy(zero)
    })
    if (rootRef.current) rootRef.current.position.set(...position)
    if (torsoRef.current) torsoRef.current.rotation.set(0, 0, 0)

    switch (animation) {
      case 'idle': {
        // Subtle breathing
        const breathe = Math.sin(t * 1.4) * 0.012
        if (torsoRef.current) torsoRef.current.scale.y = 1 + breathe
        if (rootRef.current) rootRef.current.position.y = position[1] + Math.sin(t * 1.4) * 0.01
        // Subtle arm sway
        const sway = Math.sin(t * 0.8) * 0.05
        if (leftArmRef.current) leftArmRef.current.rotation.z = sway
        if (rightArmRef.current) rightArmRef.current.rotation.z = -sway
        break
      }
      case 'walk': {
        const s = Math.sin(t * 5)
        if (leftArmRef.current)  leftArmRef.current.rotation.x  =  s * 0.45
        if (rightArmRef.current) rightArmRef.current.rotation.x = -s * 0.45
        if (leftForearmRef.current)  leftForearmRef.current.rotation.x  = Math.max(0, s * 0.25)
        if (rightForearmRef.current) rightForearmRef.current.rotation.x = Math.max(0, -s * 0.25)
        if (leftLegRef.current)  leftLegRef.current.rotation.x  = -s * 0.5
        if (rightLegRef.current) rightLegRef.current.rotation.x =  s * 0.5
        // Bob
        if (rootRef.current) rootRef.current.position.y = position[1] + Math.abs(Math.sin(t * 10)) * 0.04
        break
      }
      case 'run': {
        const s = Math.sin(t * 8)
        if (leftArmRef.current)  leftArmRef.current.rotation.x  =  s * 0.7
        if (rightArmRef.current) rightArmRef.current.rotation.x = -s * 0.7
        if (leftLegRef.current)  leftLegRef.current.rotation.x  = -s * 0.75
        if (rightLegRef.current) rightLegRef.current.rotation.x =  s * 0.75
        if (torsoRef.current) torsoRef.current.rotation.x = 0.12
        if (rootRef.current) rootRef.current.position.y = position[1] + Math.abs(Math.sin(t * 16)) * 0.08
        break
      }
      case 'sit': {
        // Thighs horizontal, shins vertical
        if (leftLegRef.current)  leftLegRef.current.rotation.x  = -Math.PI / 2
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI / 2
        if (leftForearmRef.current)  leftForearmRef.current.rotation.x = Math.PI / 2
        if (rightForearmRef.current) rightForearmRef.current.rotation.x = Math.PI / 2
        if (rootRef.current) rootRef.current.position.y = position[1] - 0.38
        break
      }
      case 'wave': {
        // Right arm raised and waving
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -Math.PI / 2.2
          rightArmRef.current.rotation.x = Math.sin(t * 4) * 0.25
        }
        if (rightForearmRef.current) {
          rightForearmRef.current.rotation.z = Math.sin(t * 4) * 0.3
        }
        break
      }
    }
  })

  // Upper arm pivot is at shoulder (top of upper arm)
  const shoulderY = TORSO_H - 0.08
  const shoulderX = TORSO_W / 2 + UPPER_LIMB[0] / 2 + 0.02

  return (
    <group ref={rootRef} position={position} rotation={[0, rotationY, 0]}>
      {/* ── Head ──────────────────────────────────────────────────── */}
      <group ref={headRef} position={[0, TORSO_H + HEAD + 0.04, 0]}>
        <mesh castShadow>
          <boxGeometry args={[HEAD * 2, HEAD * 2, HEAD * 2]} />
          <meshStandardMaterial color={skinColor} roughness={0.82} />
        </mesh>
        {/* Hair */}
        <mesh position={[0, HEAD * 1.05, 0]}>
          <boxGeometry args={[HEAD * 2.05, HEAD * 0.45, HEAD * 2.05]} />
          <meshStandardMaterial color={hairColor} roughness={0.88} />
        </mesh>
        {/* Eyes */}
        {([-0.07, 0.07] as number[]).map((ex, i) => (
          <mesh key={i} position={[ex, 0.02, HEAD - 0.02]}>
            <boxGeometry args={[0.04, 0.03, 0.02]} />
            <meshStandardMaterial color="#1A0A00" roughness={1} />
          </mesh>
        ))}
      </group>

      {/* ── Torso ─────────────────────────────────────────────────── */}
      <group ref={torsoRef}>
        <mesh position={[0, TORSO_H / 2, 0]} castShadow>
          <boxGeometry args={[TORSO_W, TORSO_H, 0.2]} />
          <meshStandardMaterial color={clothingColor} roughness={0.82} />
        </mesh>
        {/* Belt */}
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[TORSO_W + 0.01, 0.07, 0.22]} />
          <meshStandardMaterial color="#2A1000" roughness={0.75} metalness={0.2} />
        </mesh>
      </group>

      {/* ── Left arm ─────────────────────────────────────────────── */}
      {/* Pivot at shoulder */}
      <group ref={leftArmRef} position={[-shoulderX, shoulderY, 0]}>
        <mesh position={[0, -UPPER_LIMB[1] / 2, 0]} castShadow>
          <boxGeometry args={UPPER_LIMB} />
          <meshStandardMaterial color={clothingColor} roughness={0.82} />
        </mesh>
        {/* Forearm pivot at elbow */}
        <group ref={leftForearmRef} position={[0, -UPPER_LIMB[1], 0]}>
          <mesh position={[0, -LOWER_LIMB[1] / 2, 0]} castShadow>
            <boxGeometry args={LOWER_LIMB} />
            <meshStandardMaterial color={skinColor} roughness={0.82} />
          </mesh>
        </group>
      </group>

      {/* ── Right arm ────────────────────────────────────────────── */}
      <group ref={rightArmRef} position={[shoulderX, shoulderY, 0]}>
        <mesh position={[0, -UPPER_LIMB[1] / 2, 0]} castShadow>
          <boxGeometry args={UPPER_LIMB} />
          <meshStandardMaterial color={clothingColor} roughness={0.82} />
        </mesh>
        <group ref={rightForearmRef} position={[0, -UPPER_LIMB[1], 0]}>
          <mesh position={[0, -LOWER_LIMB[1] / 2, 0]} castShadow>
            <boxGeometry args={LOWER_LIMB} />
            <meshStandardMaterial color={skinColor} roughness={0.82} />
          </mesh>
        </group>
      </group>

      {/* ── Left leg ─────────────────────────────────────────────── */}
      {/* Pivot at hip */}
      <group ref={leftLegRef} position={[-LEG_W * 0.7, 0, 0]}>
        <mesh position={[0, -UPPER_LIMB[1] / 2, 0]} castShadow>
          <boxGeometry args={[LEG_W, UPPER_LIMB[1], LEG_W]} />
          <meshStandardMaterial color="#2C1810" roughness={0.82} />
        </mesh>
        {/* Shin */}
        <mesh position={[0, -UPPER_LIMB[1] - LOWER_LIMB[1] / 2, 0]} castShadow>
          <boxGeometry args={[LEG_W - 0.02, LOWER_LIMB[1], LEG_W - 0.02]} />
          <meshStandardMaterial color="#1E1008" roughness={0.82} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -UPPER_LIMB[1] - LOWER_LIMB[1] - 0.04, 0.06]} castShadow>
          <boxGeometry args={[LEG_W, 0.08, 0.22]} />
          <meshStandardMaterial color="#0A0500" roughness={0.88} />
        </mesh>
      </group>

      {/* ── Right leg ────────────────────────────────────────────── */}
      <group ref={rightLegRef} position={[LEG_W * 0.7, 0, 0]}>
        <mesh position={[0, -UPPER_LIMB[1] / 2, 0]} castShadow>
          <boxGeometry args={[LEG_W, UPPER_LIMB[1], LEG_W]} />
          <meshStandardMaterial color="#2C1810" roughness={0.82} />
        </mesh>
        <mesh position={[0, -UPPER_LIMB[1] - LOWER_LIMB[1] / 2, 0]} castShadow>
          <boxGeometry args={[LEG_W - 0.02, LOWER_LIMB[1], LEG_W - 0.02]} />
          <meshStandardMaterial color="#1E1008" roughness={0.82} />
        </mesh>
        <mesh position={[0, -UPPER_LIMB[1] - LOWER_LIMB[1] - 0.04, 0.06]} castShadow>
          <boxGeometry args={[LEG_W, 0.08, 0.22]} />
          <meshStandardMaterial color="#0A0500" roughness={0.88} />
        </mesh>
      </group>
    </group>
  )
}
