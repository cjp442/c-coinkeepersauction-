import { forwardRef } from 'react'
import { Group } from 'three'

const Avatar = forwardRef<Group>((_, ref) => {
  return (
    <group ref={ref} position={[0, 0.75, 0]}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 1.2, 0.4]} />
        <meshStandardMaterial color="#2266cc" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#f0c07a" />
      </mesh>
    </group>
  )
})

Avatar.displayName = 'Avatar'

export default Avatar
