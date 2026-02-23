/**
 * LobbyScene
 *
 * Main Three.js scene for the saloon lobby.
 *
 * Controls:
 *   – Click canvas to lock mouse (PointerLock)
 *   – WASD / arrow keys to move
 *   – Mouse to look (first-person)
 *   – E to interact with nearby portal doors
 *   – ESC to unlock mouse
 *
 * Architecture:
 *   – PlayerController handles camera movement and portal detection
 *   – All geometry components live as pure children in the scene graph
 */
import { useRef, useEffect, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib'
import * as THREE from 'three'

import LobbyEnvironment, { ROOM } from './LobbyEnvironment'
import BarCounter from './BarCounter'
import PortalDoor from './PortalDoor'
import LobbyFurniture from './LobbyFurniture'
import Avatar from './Avatar'

interface LobbySceneProps {
  /** Called when pointer-lock state changes */
  onLockChange: (locked: boolean) => void
  /** Called when player enters a portal */
  onPortalEnter: (type: 'member' | 'host') => void
  /** Provided by parent so HUD can show which door is nearby */
  onNearDoor: (type: 'member' | 'host' | null) => void
}

// Portal door world positions / metadata
const PORTAL_DOORS = [
  {
    id: 'member',
    type: 'member' as const,
    label: 'Member Room',
    position: [-ROOM.W / 2 + 0.15, 0, -2] as [number, number, number],
    rotationY: Math.PI / 2,
  },
  {
    id: 'host',
    type: 'host' as const,
    label: 'Host Room',
    position: [ROOM.W / 2 - 0.15, 0, -2] as [number, number, number],
    rotationY: -Math.PI / 2,
  },
] as const

// NPC avatars scattered around the lobby
const NPC_AVATARS = [
  { position: [-3, 0, -6] as [number, number, number], rotationY: 0.4,  skin: '#D4956A', clothing: '#6B2C14', animation: 'idle'  as const },
  { position: [3, 0, -6]  as [number, number, number], rotationY: -0.3, skin: '#F5DEB3', clothing: '#2C486B', animation: 'wave'  as const },
  { position: [-6, 0, 0]  as [number, number, number], rotationY: 1.2,  skin: '#8B6347', clothing: '#4A6B2C', animation: 'idle'  as const },
  { position: [6, 0, 2]   as [number, number, number], rotationY: -1.0, skin: '#FDDBB4', clothing: '#7A2C4A', animation: 'idle'  as const },
  { position: [-4, 0, 5]  as [number, number, number], rotationY: 2.1,  skin: '#C68642', clothing: '#4A4A8B', animation: 'sit'   as const },
  { position: [4, 0, 5]   as [number, number, number], rotationY: -2.0, skin: '#F0C090', clothing: '#8B4513', animation: 'sit'   as const },
] as const

/** Handles camera movement + portal proximity */
function PlayerController({
  onLockChange,
  onNearDoor,
}: Omit<LobbySceneProps, 'onPortalEnter'>) {
  const { camera } = useThree()
  const controlsRef = useRef<PointerLockControlsImpl>(null)
  const keys = useRef(new Set<string>())
  const nearDoor = useRef<'member' | 'host' | null>(null)

  const SPEED = 5.5
  const PLAYER_HEIGHT = 1.7

  // Keyboard tracking
  useEffect(() => {
    const down = (e: KeyboardEvent) => keys.current.add(e.code)
    const up   = (e: KeyboardEvent) => keys.current.delete(e.code)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup',   up)
    }
  }, [])

  useFrame((_, delta) => {
    // Only move when pointer locked
    if (!controlsRef.current?.isLocked) return

    // Build movement direction from camera orientation
    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

    const velocity = new THREE.Vector3()
    if (keys.current.has('KeyW') || keys.current.has('ArrowUp'))    velocity.add(forward)
    if (keys.current.has('KeyS') || keys.current.has('ArrowDown'))  velocity.sub(forward)
    if (keys.current.has('KeyA') || keys.current.has('ArrowLeft'))  velocity.sub(right)
    if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) velocity.add(right)

    if (velocity.lengthSq() > 0) {
      velocity.normalize().multiplyScalar(SPEED * delta)
      const next = camera.position.clone().add(velocity)
      // Room boundary clamp
      next.x = THREE.MathUtils.clamp(next.x, -ROOM.W / 2 + 0.5, ROOM.W / 2 - 0.5)
      next.z = THREE.MathUtils.clamp(next.z, -ROOM.D / 2 + 0.5, ROOM.D / 2 - 0.5)
      next.y = PLAYER_HEIGHT
      camera.position.copy(next)
    }

    // Portal proximity check
    let newNear: 'member' | 'host' | null = null
    for (const door of PORTAL_DOORS) {
      const dp = new THREE.Vector3(...door.position)
      if (camera.position.distanceTo(dp) < 3.0) {
        newNear = door.type
        break
      }
    }
    if (newNear !== nearDoor.current) {
      nearDoor.current = newNear
      onNearDoor(newNear)
    }
  })

  const handleLock = useCallback(() => onLockChange(true),  [onLockChange])
  const handleUnlock = useCallback(() => onLockChange(false), [onLockChange])

  return (
    <PointerLockControls
      ref={controlsRef}
      onLock={handleLock}
      onUnlock={handleUnlock}
    />
  )
}

export default function LobbyScene(props: LobbySceneProps) {
  const { onPortalEnter } = props

  // nearDoor is maintained in PlayerController and mirrored here via onNearDoor
  // PortalDoor components read it from a shared ref so they avoid re-renders
  const nearDoorType = useRef<'member' | 'host' | null>(null)

  const handleNearDoor = useCallback(
    (type: 'member' | 'host' | null) => {
      nearDoorType.current = type
      props.onNearDoor(type)
    },
    [props],
  )

  return (
    <>
      {/* Fog for atmosphere */}
      <fog attach="fog" args={['#1A0A02', 12, 30]} />

      {/* Player controller + pointer lock */}
      <PlayerController
        onLockChange={props.onLockChange}
        onNearDoor={handleNearDoor}
      />

      {/* Room geometry */}
      <LobbyEnvironment />

      {/* Bar counter */}
      <BarCounter />

      {/* Furniture */}
      <LobbyFurniture />

      {/* Portal doors */}
      {PORTAL_DOORS.map((door) => (
        <PortalDoorWrapper
          key={door.id}
          door={door}
          nearDoorType={nearDoorType}
          onEnter={() => onPortalEnter(door.type)}
        />
      ))}

      {/* NPC avatars */}
      {NPC_AVATARS.map((npc, i) => (
        <Avatar
          key={i}
          position={npc.position}
          rotationY={npc.rotationY}
          skinColor={npc.skin}
          clothingColor={npc.clothing}
          animation={npc.animation}
        />
      ))}
    </>
  )
}

/**
 * Thin wrapper that reads isNear from the ref each frame so PortalDoor
 * receives the correct prop without triggering extra React renders.
 */
function PortalDoorWrapper({
  door,
  nearDoorType,
  onEnter,
}: {
  door: (typeof PORTAL_DOORS)[number]
  nearDoorType: React.MutableRefObject<'member' | 'host' | null>
  onEnter: () => void
}) {
  const isNearRef = useRef(false)
  const doorRef   = useRef<THREE.Group>(null)

  // Sync isNear per frame (avoids setState in hot loop)
  useFrame(() => {
    isNearRef.current = nearDoorType.current === door.type
  })

  return (
    <group ref={doorRef}>
      <PortalDoorLive
        door={door}
        isNearRef={isNearRef}
        onEnter={onEnter}
      />
    </group>
  )
}

/** Reads isNearRef inside useFrame to keep PortalDoor prop up-to-date */
function PortalDoorLive({
  door,
  isNearRef,
  onEnter,
}: {
  door: (typeof PORTAL_DOORS)[number]
  isNearRef: React.MutableRefObject<boolean>
  onEnter: () => void
}) {
  // We need to re-render PortalDoor when isNear changes so the glow reacts.
  // We do this with a lightweight ref-based counter that triggers on change.
  const prevNear = useRef(false)
  const forceRef  = useRef(0)

  useFrame(() => {
    if (isNearRef.current !== prevNear.current) {
      prevNear.current = isNearRef.current
      // Touch forceRef – React will see the same value but PortalDoor
      // will re-evaluate glow in its own useFrame anyway.
      forceRef.current += 1
    }
  })

  return (
    <PortalDoor
      position={door.position}
      rotationY={door.rotationY}
      type={door.type}
      label={door.label}
      isNear={isNearRef.current}
      onEnter={onEnter}
    />
  )
}
