export default function LobbyLighting() {
  return (
    <>
      <ambientLight intensity={0.3} color="#ff9944" />
      <pointLight position={[0, 6, 0]} intensity={2} color="#ffaa55" distance={20} decay={2} />
      <pointLight position={[-8, 4, 0]} intensity={1.5} color="#ffcc77" distance={12} decay={2} />
      <spotLight
        position={[0, 8, -10]}
        intensity={3}
        color="#aaccff"
        angle={0.4}
        penumbra={0.3}
        castShadow
      />
      <directionalLight position={[-10, 8, 5]} intensity={0.8} color="#ffe8cc" />
      <pointLight position={[-5, 2, 3]} intensity={0.5} color="#ff6600" distance={5} decay={2} />
      <pointLight position={[5, 2, 3]} intensity={0.5} color="#ff6600" distance={5} decay={2} />
      <pointLight position={[-5, 2, -3]} intensity={0.5} color="#ff6600" distance={5} decay={2} />
      <pointLight position={[5, 2, -3]} intensity={0.5} color="#ff6600" distance={5} decay={2} />
    </>
  )
}
