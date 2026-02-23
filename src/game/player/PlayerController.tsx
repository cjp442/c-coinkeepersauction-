import { useRef, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../utils/GameState'
import { AnimationState } from './AnimationManager'
import { Portal as PortalType, GameChair } from '../../types/game'

interface PlayerControllerProps {
  onAnimationChange: (state: AnimationState) => void
  portals: PortalType[]
  chairs: GameChair[]
  onPortalEnter: (portal: PortalType) => void
  onSit: (chair: GameChair) => void
  onStand: () => void
}

const MOVE_SPEED = 5
const RUN_SPEED = 9
const INTERACTION_DISTANCE = 2.5

export default function PlayerController({
  onAnimationChange,
  portals,
  chairs,
  onPortalEnter,
  onSit,
  onStand,
}: PlayerControllerProps) {
  const { camera } = useThree()
  const {
    playerPosition,
    cameraMode,
    isSitting,
    setPlayerPosition,
    setPlayerRotation,
    setCameraMode,
    setSitting,
    setNearbyInteractable,
  } = useGameStore()

  const keysRef = useRef<Set<string>>(new Set())
  const mouseRef = useRef({ locked: false })
  const yawRef = useRef(0)
  const pitchRef = useRef(0)
  const posRef = useRef(new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z))
  const animRef = useRef<AnimationState>('idle')

  const isSittingRef = useRef(isSitting)
  const cameraModeRef = useRef(cameraMode)
  useEffect(() => { isSittingRef.current = isSitting }, [isSitting])
  useEffect(() => { cameraModeRef.current = cameraMode }, [cameraMode])

  const portalsRef = useRef(portals)
  const chairsRef = useRef(chairs)
  useEffect(() => { portalsRef.current = portals }, [portals])
  useEffect(() => { chairsRef.current = chairs }, [chairs])

  const handleInteract = useCallback(() => {
    if (isSittingRef.current) {
      onStand()
      setSitting(false)
      return
    }
    const pos = posRef.current
    for (const portal of portalsRef.current) {
      const dx = pos.x - portal.position.x
      const dz = pos.z - portal.position.z
      if (Math.sqrt(dx * dx + dz * dz) < INTERACTION_DISTANCE && portal.isActive) {
        onPortalEnter(portal)
        return
      }
    }
    for (const chair of chairsRef.current) {
      const dx = pos.x - chair.position.x
      const dz = pos.z - chair.position.z
      if (Math.sqrt(dx * dx + dz * dz) < INTERACTION_DISTANCE && !chair.isOccupied) {
        onSit(chair)
        setSitting(true, chair.id)
        return
      }
    }
  }, [onStand, onPortalEnter, onSit, setSitting])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)
      if (e.code === 'KeyC') {
        setCameraMode(cameraModeRef.current === 'first_person' ? 'third_person' : 'first_person')
      }
      if (e.code === 'KeyE') {
        handleInteract()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => { keysRef.current.delete(e.code) }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [setCameraMode, handleInteract])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseRef.current.locked) return
      yawRef.current -= e.movementX * 0.002
      pitchRef.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 6, pitchRef.current - e.movementY * 0.002))
    }
    const onPointerLockChange = () => {
      mouseRef.current.locked = document.pointerLockElement !== null
    }
    const onClick = () => {
      if (!mouseRef.current.locked) {
        document.querySelector('canvas')?.requestPointerLock()
      }
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerlockchange', onPointerLockChange)
    document.querySelector('canvas')?.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerlockchange', onPointerLockChange)
    }
  }, [])

  const updateCamera = useCallback(() => {
    if (cameraModeRef.current === 'first_person') {
      camera.position.set(posRef.current.x, posRef.current.y + 1.7, posRef.current.z)
      camera.rotation.order = 'YXZ'
      camera.rotation.y = yawRef.current
      camera.rotation.x = pitchRef.current
    } else {
      const offset = new THREE.Vector3(
        Math.sin(yawRef.current) * 4,
        3,
        Math.cos(yawRef.current) * 4
      )
      camera.position.lerp(posRef.current.clone().add(offset), 0.1)
      camera.lookAt(posRef.current.x, posRef.current.y + 1, posRef.current.z)
    }
  }, [camera])

  useFrame((_, delta) => {
    if (isSittingRef.current) {
      if (animRef.current !== 'sit') {
        animRef.current = 'sit'
        onAnimationChange('sit')
      }
      updateCamera()
      return
    }

    const keys = keysRef.current
    const isRunning = keys.has('ShiftLeft') || keys.has('ShiftRight')
    const speed = (isRunning ? RUN_SPEED : MOVE_SPEED) * delta

    const forward = new THREE.Vector3(-Math.sin(yawRef.current), 0, -Math.cos(yawRef.current))
    const right = new THREE.Vector3(Math.cos(yawRef.current), 0, -Math.sin(yawRef.current))

    let moved = false
    const move = new THREE.Vector3()

    if (keys.has('KeyW') || keys.has('ArrowUp')) { move.add(forward); moved = true }
    if (keys.has('KeyS') || keys.has('ArrowDown')) { move.sub(forward); moved = true }
    if (keys.has('KeyA') || keys.has('ArrowLeft')) { move.sub(right); moved = true }
    if (keys.has('KeyD') || keys.has('ArrowRight')) { move.add(right); moved = true }

    if (moved) {
      move.normalize().multiplyScalar(speed)
      posRef.current.add(move)
      posRef.current.x = Math.max(-12, Math.min(12, posRef.current.x))
      posRef.current.z = Math.max(-14, Math.min(8, posRef.current.z))
      posRef.current.y = 0

      const newAnim: AnimationState = isRunning ? 'run' : 'walk'
      if (animRef.current !== newAnim) {
        animRef.current = newAnim
        onAnimationChange(newAnim)
      }
      setPlayerPosition({ x: posRef.current.x, y: 0, z: posRef.current.z })
      setPlayerRotation(yawRef.current)
    } else {
      if (animRef.current !== 'idle') {
        animRef.current = 'idle'
        onAnimationChange('idle')
      }
    }

    let nearestId: string | null = null
    let nearestDist = INTERACTION_DISTANCE

    for (const portal of portalsRef.current) {
      const dx = posRef.current.x - portal.position.x
      const dz = posRef.current.z - portal.position.z
      const d = Math.sqrt(dx * dx + dz * dz)
      if (d < nearestDist) { nearestDist = d; nearestId = portal.id }
    }

    for (const chair of chairsRef.current) {
      if (!chair.isOccupied) {
        const dx = posRef.current.x - chair.position.x
        const dz = posRef.current.z - chair.position.z
        const d = Math.sqrt(dx * dx + dz * dz)
        if (d < nearestDist) { nearestDist = d; nearestId = chair.id }
      }
    }

    setNearbyInteractable(nearestId)
    updateCamera()
  })

  return null
}
