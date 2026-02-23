import { useEffect, useRef, RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, Vector3 } from 'three'

const MOVE_SPEED = 5

interface PlayerControllerProps {
  avatarRef: RefObject<Group | null>
}

export default function PlayerController({ avatarRef }: PlayerControllerProps) {
  const { camera } = useThree()
  const keys = useRef<Record<string, boolean>>({})
  const yaw = useRef(0)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true }
    const onKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false }
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        yaw.current -= e.movementX * 0.002
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  useFrame((_, delta) => {
    const avatar = avatarRef.current
    if (!avatar) return

    avatar.rotation.y = yaw.current

    const forward = new Vector3(
      -Math.sin(yaw.current),
      0,
      -Math.cos(yaw.current)
    )
    const right = new Vector3(
      Math.cos(yaw.current),
      0,
      -Math.sin(yaw.current)
    )

    const move = new Vector3()
    if (keys.current['KeyW'] || keys.current['ArrowUp']) move.add(forward)
    if (keys.current['KeyS'] || keys.current['ArrowDown']) move.sub(forward)
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) move.sub(right)
    if (keys.current['KeyD'] || keys.current['ArrowRight']) move.add(right)

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(MOVE_SPEED * delta)
      avatar.position.add(move)
    }

    // 3rd person camera: follow behind avatar
    const offset = new Vector3(
      Math.sin(yaw.current) * 8,
      4,
      Math.cos(yaw.current) * 8
    )
    const targetCameraPos = avatar.position.clone().add(offset)
    camera.position.lerp(targetCameraPos, 0.1)
    camera.lookAt(avatar.position.clone().add(new Vector3(0, 1, 0)))

    console.log(
      'Avatar pos:',
      avatar.position.x.toFixed(2),
      avatar.position.y.toFixed(2),
      avatar.position.z.toFixed(2)
    )
  })

  return null
}
