/**
 * LobbyEnvironment
 *
 * Procedural geometry for the saloon lobby room:
 *   – wooden-plank floor, brick-plaster walls, dark-wood ceiling
 *   – ceiling beams
 *   – three chandeliers with emissive bulbs
 *   – ambient + point lights that approximate baked lighting
 *
 * When real GLB assets are ready (see public/assets/models/README.md) this
 * component can be replaced by <primitive object={scene} /> loaded via
 * useGLTF('/assets/models/lobby/lobby_room.glb').
 */
// Room dimensions (units)
export const ROOM = {
  W: 20,  // total width  (X: -10 → +10)
  D: 24,  // total depth  (Z: -12 → +12)
  H: 5,   // ceiling height
} as const

/** Single chandelier hung from the ceiling */
function Chandelier({ position }: { position: [number, number, number] }) {
  const bulbPositions: [number, number, number][] = [0, 1, 2, 3].map((i) => {
    const a = (i / 4) * Math.PI * 2
    return [Math.cos(a) * 0.28, -0.12, Math.sin(a) * 0.28]
  })

  return (
    <group position={position}>
      {/* Drop chain */}
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 0.55, 6]} />
        <meshStandardMaterial color="#B8860B" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Fixture body */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.32, 0.12, 0.22, 12]} />
        <meshStandardMaterial color="#B8860B" metalness={0.85} roughness={0.35} />
      </mesh>
      {/* Emissive bulbs */}
      {bulbPositions.map((bp, i) => (
        <mesh key={i} position={[bp[0], -0.4 + bp[1], bp[2]]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color="#FFEEAA"
            emissive="#FFAA33"
            emissiveIntensity={3}
          />
        </mesh>
      ))}
      {/* Point light for this chandelier */}
      <pointLight
        position={[0, -0.5, 0]}
        intensity={1.2}
        distance={10}
        decay={2}
        color="#FFB347"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
    </group>
  )
}

/** Decorative wooden wall-trim strip */
function WallTrim({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#4A2C10" roughness={0.75} />
    </mesh>
  )
}

export default function LobbyEnvironment() {
  const { W, D, H } = ROOM

  return (
    <group>
      {/* ── Lighting ────────────────────────────────────────────── */}
      <ambientLight intensity={0.25} color="#FF9944" />
      {/* Fill lights near corners */}
      <pointLight position={[-8, 3.5, -8]} intensity={0.6} color="#FF7722" distance={14} decay={2} />
      <pointLight position={[8, 3.5, -8]} intensity={0.6} color="#FF7722" distance={14} decay={2} />
      <pointLight position={[-8, 3.5, 8]} intensity={0.5} color="#FF9933" distance={14} decay={2} />
      <pointLight position={[8, 3.5, 8]} intensity={0.5} color="#FF9933" distance={14} decay={2} />

      {/* ── Floor (wooden planks) ────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#7A5C2E" roughness={0.85} metalness={0.0} />
      </mesh>
      {/* Plank lines – thin dark strips along Z */}
      {[-4, -2, 0, 2, 4].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.001, 0]}>
          <planeGeometry args={[0.04, D]} />
          <meshStandardMaterial color="#5A3C1A" roughness={0.9} />
        </mesh>
      ))}

      {/* ── Ceiling ──────────────────────────────────────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#4A2E12" roughness={0.9} />
      </mesh>

      {/* ── Walls ────────────────────────────────────────────────── */}
      {/* Back wall */}
      <mesh position={[0, H / 2, -D / 2]}>
        <boxGeometry args={[W, H, 0.25]} />
        <meshStandardMaterial color="#7B4B22" roughness={0.88} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-W / 2, H / 2, 0]}>
        <boxGeometry args={[0.25, H, D]} />
        <meshStandardMaterial color="#7B4B22" roughness={0.88} />
      </mesh>
      {/* Right wall */}
      <mesh position={[W / 2, H / 2, 0]}>
        <boxGeometry args={[0.25, H, D]} />
        <meshStandardMaterial color="#7B4B22" roughness={0.88} />
      </mesh>
      {/* Front wall – two panels flanking the entrance opening (4 units wide) */}
      <mesh position={[-6.5, H / 2, D / 2]}>
        <boxGeometry args={[7, H, 0.25]} />
        <meshStandardMaterial color="#7B4B22" roughness={0.88} />
      </mesh>
      <mesh position={[6.5, H / 2, D / 2]}>
        <boxGeometry args={[7, H, 0.25]} />
        <meshStandardMaterial color="#7B4B22" roughness={0.88} />
      </mesh>
      {/* Lintel above entrance */}
      <mesh position={[0, H - 0.6, D / 2]}>
        <boxGeometry args={[6, 1.2, 0.25]} />
        <meshStandardMaterial color="#7B4B22" roughness={0.88} />
      </mesh>

      {/* ── Ceiling beams (run along Z) ───────────────────────────── */}
      {[-6, 0, 6].map((x) => (
        <mesh key={x} position={[x, H - 0.18, 0]}>
          <boxGeometry args={[0.32, 0.36, D]} />
          <meshStandardMaterial color="#3A1E08" roughness={0.78} />
        </mesh>
      ))}

      {/* ── Wall trims (horizontal base boards) ──────────────────── */}
      <WallTrim position={[0, 0.15, -D / 2 + 0.14]} size={[W, 0.3, 0.05]} />
      <WallTrim position={[-W / 2 + 0.14, 0.15, 0]} size={[0.05, 0.3, D]} />
      <WallTrim position={[W / 2 - 0.14, 0.15, 0]} size={[0.05, 0.3, D]} />

      {/* ── Chandeliers ──────────────────────────────────────────── */}
      <Chandelier position={[-6, H - 0.27, -4]} />
      <Chandelier position={[0, H - 0.27, 0]} />
      <Chandelier position={[6, H - 0.27, 5]} />
    </group>
  )
}
