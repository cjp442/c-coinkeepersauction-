import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { AnimationState, useAvatarAnimation } from './AnimationManager'

interface AvatarProps {
  position: { x: number; y: number; z: number }
  rotation: number
  animState: AnimationState
  isLocalPlayer?: boolean
  username?: string
  color?: string
}

export default function Avatar({
  position,
  rotation,
  animState,
  isLocalPlayer = false,
  color = '#ffcc88'
}: AvatarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Mesh>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const leftForearmRef = useRef<THREE.Mesh>(null)
  const rightForearmRef = useRef<THREE.Mesh>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  const leftCalfRef = useRef<THREE.Mesh>(null)
  const rightCalfRef = useRef<THREE.Mesh>(null)

  const { getAnimValues } = useAvatarAnimation(animState)
  const clockRef = useRef(0)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    clockRef.current += delta

    groupRef.current.position.lerp(new THREE.Vector3(position.x, position.y, position.z), 0.15)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation, 0.15)

    const anim = getAnimValues(clockRef.current)

    if (bodyRef.current) bodyRef.current.position.y = anim.bodyY
    if (leftArmRef.current) leftArmRef.current.rotation.x = anim.leftArmRotX
    if (rightArmRef.current) rightArmRef.current.rotation.x = anim.rightArmRotX
    if (leftForearmRef.current) leftForearmRef.current.rotation.x = -anim.leftElbowBend
    if (rightForearmRef.current) rightForearmRef.current.rotation.x = -anim.rightElbowBend
    if (leftLegRef.current) leftLegRef.current.rotation.x = anim.leftLegRotX
    if (rightLegRef.current) rightLegRef.current.rotation.x = anim.rightLegRotX
    if (leftCalfRef.current) leftCalfRef.current.rotation.x = anim.leftKneeBend
    if (rightCalfRef.current) rightCalfRef.current.rotation.x = anim.rightKneeBend
    if (headRef.current) headRef.current.position.y = 1.75 + anim.headBob
  })

  const skinColor = color
  const clothColor = isLocalPlayer ? '#2244aa' : '#444444'
  const hairColor = '#3a2a1a'

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]} rotation={[0, rotation, 0]}>
      <group ref={bodyRef}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.45, 0.6, 0.22]} />
          <meshStandardMaterial color={clothColor} roughness={0.8} />
        </mesh>
        <mesh ref={headRef} position={[0, 1.75, 0]} castShadow>
          <boxGeometry args={[0.32, 0.32, 0.3]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.93, 0]}>
          <boxGeometry args={[0.33, 0.1, 0.31]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
        <mesh position={[-0.07, 1.77, 0.151]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[0.07, 1.77, 0.151]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <group ref={leftArmRef} position={[-0.3, 1.35, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.07, 0.25, 4, 8]} />
            <meshStandardMaterial color={clothColor} roughness={0.8} />
          </mesh>
          <group position={[0, -0.32, 0]}>
            <mesh ref={leftForearmRef} position={[0, -0.18, 0]} castShadow>
              <capsuleGeometry args={[0.06, 0.22, 4, 8]} />
              <meshStandardMaterial color={skinColor} roughness={0.7} />
            </mesh>
          </group>
        </group>
        <group ref={rightArmRef} position={[0.3, 1.35, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.07, 0.25, 4, 8]} />
            <meshStandardMaterial color={clothColor} roughness={0.8} />
          </mesh>
          <group position={[0, -0.32, 0]}>
            <mesh ref={rightForearmRef} position={[0, -0.18, 0]} castShadow>
              <capsuleGeometry args={[0.06, 0.22, 4, 8]} />
              <meshStandardMaterial color={skinColor} roughness={0.7} />
            </mesh>
          </group>
        </group>
        <group ref={leftLegRef} position={[-0.12, 0.78, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.32, 4, 8]} />
            <meshStandardMaterial color="#222244" roughness={0.8} />
          </mesh>
          <group position={[0, -0.38, 0]}>
            <mesh ref={leftCalfRef} position={[0, -0.2, 0]} castShadow>
              <capsuleGeometry args={[0.08, 0.28, 4, 8]} />
              <meshStandardMaterial color="#222244" roughness={0.8} />
            </mesh>
          </group>
        </group>
        <group ref={rightLegRef} position={[0.12, 0.78, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.32, 4, 8]} />
            <meshStandardMaterial color="#222244" roughness={0.8} />
          </mesh>
          <group position={[0, -0.38, 0]}>
            <mesh ref={rightCalfRef} position={[0, -0.2, 0]} castShadow>
              <capsuleGeometry args={[0.08, 0.28, 4, 8]} />
              <meshStandardMaterial color="#222244" roughness={0.8} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
