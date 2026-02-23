import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

const Avatar = () => {
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0])
  const [isSitting, setIsSitting] = useState(false)

  const walk = () => {
    if (!isSitting) {
      // Logic for walking animation
    }
  }

  const sit = () => {
    setIsSitting(!isSitting)
  }

  useEffect(() => {
    walk()
  }, [position])

  return (
    <Canvas>
      <OrbitControls />
      <mesh position={position}>
        {/* Humanoid model goes here */}
      </mesh>
    </Canvas>
  )
}

export default Avatar