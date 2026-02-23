export default function LobbyScene() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#4a7c59" />
      </mesh>

      {/* Wall North */}
      <mesh position={[0, 2.5, -25]}>
        <boxGeometry args={[50, 5, 0.5]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Wall South */}
      <mesh position={[0, 2.5, 25]}>
        <boxGeometry args={[50, 5, 0.5]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Wall West */}
      <mesh position={[-25, 2.5, 0]}>
        <boxGeometry args={[0.5, 5, 50]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Wall East */}
      <mesh position={[25, 2.5, 0]}>
        <boxGeometry args={[0.5, 5, 50]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Door (red box placeholder) */}
      <mesh position={[0, 1.5, -24.5]}>
        <boxGeometry args={[3, 4, 0.5]} />
        <meshStandardMaterial color="#cc2200" emissive="#440000" />
      </mesh>
    </group>
  )
}
