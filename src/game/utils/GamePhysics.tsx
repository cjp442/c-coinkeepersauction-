import { ReactNode } from 'react'
import { Physics } from '@react-three/rapier'

interface GamePhysicsProps {
  children: ReactNode
}

export default function GamePhysics({ children }: GamePhysicsProps) {
  return (
    <Physics gravity={[0, -9.81, 0]}>
      {children}
    </Physics>
  )
}
