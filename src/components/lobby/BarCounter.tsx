/**
 * BarCounter
 *
 * Procedural geometry for the saloon bar area:
 *   – long counter top with dark-wood material
 *   – back-bar shelves stocked with bottles
 *   – bar stools
 *   – token-purchase station with glowing amber sign
 *
 * Positioned against the back wall (Z ≈ -9).
 */

/** Single bottle silhouette */
function Bottle({
  position,
  color,
}: {
  position: [number, number, number]
  color: string
}) {
  return (
    <group position={position}>
      {/* Body */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.22, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} transparent opacity={0.85} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.018, 0.04, 0.1, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

/** Single bar stool */
function BarStool({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Seat */}
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.18, 0.15, 0.08, 12]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {/* Central pole */}
      <mesh position={[0, 0.39, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.7, 8]} />
        <meshStandardMaterial color="#5A3010" roughness={0.7} />
      </mesh>
      {/* Four legs */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.12, 0.08, Math.sin(a) * 0.12]}
            rotation={[Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3]}
          >
            <cylinderGeometry args={[0.025, 0.025, 0.2, 6]} />
            <meshStandardMaterial color="#5A3010" roughness={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

/** Token-purchase station – a podium with a glowing sign */
function TokenStation() {
  return (
    <group position={[7, 0, -9.6]}>
      {/* Podium body */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.0, 1.2, 0.5]} />
        <meshStandardMaterial color="#5A3010" roughness={0.75} />
      </mesh>
      {/* Podium top */}
      <mesh position={[0, 1.22, 0]}>
        <boxGeometry args={[1.1, 0.08, 0.6]} />
        <meshStandardMaterial color="#3A1E08" roughness={0.7} />
      </mesh>
      {/* Sign backing */}
      <mesh position={[0, 1.85, -0.05]}>
        <boxGeometry args={[0.9, 0.45, 0.06]} />
        <meshStandardMaterial color="#2A1000" roughness={0.8} />
      </mesh>
      {/* Sign glow face */}
      <mesh position={[0, 1.85, -0.02]}>
        <planeGeometry args={[0.82, 0.37]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FF8800"
          emissiveIntensity={1.8}
          roughness={0.4}
        />
      </mesh>
      {/* Sign accent light */}
      <pointLight
        position={[0, 1.85, 0.3]}
        intensity={0.7}
        distance={3}
        decay={2}
        color="#FFAA00"
      />
    </group>
  )
}

export default function BarCounter() {
  const counterZ = -9.7
  const counterLength = 16
  const shelfZ = -11.55

  const bottleColors = ['#2D6A1F', '#8B3A00', '#1A3A6A', '#6A1A1A', '#2D5A2D', '#7A5200']
  const bottles: { x: number; z: number; color: string }[] = []

  // Populate shelves with bottles
  for (let shelf = 0; shelf < 3; shelf++) {
    for (let b = 0; b < 12; b++) {
      bottles.push({
        x: -6.5 + b * 1.1,
        z: shelfZ + 0.1,
        color: bottleColors[(shelf * 12 + b) % bottleColors.length],
      })
    }
  }

  const stoolPositions: number[] = [-6, -4, -2, 0, 2, 4, 6]

  return (
    <group>
      {/* ── Counter top ──────────────────────────────────────────── */}
      <mesh position={[0, 1.1, counterZ]}>
        <boxGeometry args={[counterLength, 0.1, 0.7]} />
        <meshStandardMaterial color="#2A1000" roughness={0.65} />
      </mesh>
      {/* Counter front face */}
      <mesh position={[0, 0.55, counterZ + 0.38]}>
        <boxGeometry args={[counterLength, 1.1, 0.08]} />
        <meshStandardMaterial color="#4A2408" roughness={0.75} />
      </mesh>
      {/* Counter base */}
      <mesh position={[0, 0.05, counterZ]}>
        <boxGeometry args={[counterLength, 0.1, 0.7]} />
        <meshStandardMaterial color="#3A1E08" roughness={0.8} />
      </mesh>

      {/* ── Back bar shelves ──────────────────────────────────────── */}
      {/* Shelf boards (3 shelves at different heights) */}
      {[1.4, 1.9, 2.4].map((y) => (
        <mesh key={y} position={[0, y, shelfZ]}>
          <boxGeometry args={[counterLength, 0.07, 0.32]} />
          <meshStandardMaterial color="#3A1E08" roughness={0.75} />
        </mesh>
      ))}
      {/* Shelf supports */}
      {[-7, -3.5, 0, 3.5, 7].map((x) => (
        <mesh key={x} position={[x, 2.0, shelfZ - 0.05]}>
          <boxGeometry args={[0.06, 1.2, 0.28]} />
          <meshStandardMaterial color="#2A1000" roughness={0.8} />
        </mesh>
      ))}

      {/* ── Bottles on shelves ────────────────────────────────────── */}
      {bottles.map((b, i) => {
        const shelf = Math.floor(i / 12)
        const y = [1.5, 2.0, 2.5][shelf]
        return (
          <Bottle key={i} position={[b.x, y, b.z]} color={b.color} />
        )
      })}

      {/* ── Bar stools ────────────────────────────────────────────── */}
      {stoolPositions.map((x) => (
        <BarStool key={x} position={[x, 0, counterZ + 1.0]} />
      ))}

      {/* ── Token purchase station ────────────────────────────────── */}
      <TokenStation />
    </group>
  )
}
