/**
 * LobbyFurniture
 *
 * Procedural geometry for the lobby furniture and decorations:
 *   – round tables with chairs
 *   – couches / lounges
 *   – wall paintings
 *   – decorative rugs (coloured floor planes)
 */

/** Wooden chair (seatable silhouette) */
function Chair({
  position,
  rotationY = 0,
}: {
  position: [number, number, number]
  rotationY?: number
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[0.44, 0.07, 0.44]} />
        <meshStandardMaterial color="#7A4A20" roughness={0.82} />
      </mesh>
      {/* Back rest */}
      <mesh position={[0, 0.82, -0.2]} castShadow>
        <boxGeometry args={[0.44, 0.6, 0.06]} />
        <meshStandardMaterial color="#7A4A20" roughness={0.82} />
      </mesh>
      {/* Back support rail */}
      <mesh position={[0, 0.64, -0.2]} castShadow>
        <boxGeometry args={[0.44, 0.06, 0.06]} />
        <meshStandardMaterial color="#5A3010" roughness={0.8} />
      </mesh>
      {/* Four legs */}
      {(
        [
          [-0.17, -0.18],
          [0.17, -0.18],
          [-0.17, 0.18],
          [0.17, 0.18],
        ] as [number, number][]
      ).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.22, z]} castShadow>
          <boxGeometry args={[0.06, 0.44, 0.06]} />
          <meshStandardMaterial color="#5A3010" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/** Circular table with four chairs */
function TableWithChairs({
  position,
}: {
  position: [number, number, number]
}) {
  const [x, y, z] = position
  const chairOffset = 0.85

  return (
    <>
      {/* Table top */}
      <mesh position={[x, 0.78, z]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.07, 16]} />
        <meshStandardMaterial color="#5A3010" roughness={0.75} />
      </mesh>
      {/* Table leg */}
      <mesh position={[x, 0.4, z]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 0.72, 8]} />
        <meshStandardMaterial color="#3A1E08" roughness={0.8} />
      </mesh>
      {/* Base */}
      <mesh position={[x, 0.04, z]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.06, 12]} />
        <meshStandardMaterial color="#3A1E08" roughness={0.8} />
      </mesh>
      {/* Chairs at compass points */}
      <Chair position={[x, y, z - chairOffset]} rotationY={0} />
      <Chair position={[x, y, z + chairOffset]} rotationY={Math.PI} />
      <Chair position={[x - chairOffset, y, z]} rotationY={Math.PI / 2} />
      <Chair position={[x + chairOffset, y, z]} rotationY={-Math.PI / 2} />
    </>
  )
}

/** Simple couch / lounge */
function Couch({
  position,
  rotationY = 0,
  width = 2.0,
}: {
  position: [number, number, number]
  rotationY?: number
  width?: number
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Seat cushion */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[width, 0.2, 0.7]} />
        <meshStandardMaterial color="#8B2020" roughness={0.85} />
      </mesh>
      {/* Back rest */}
      <mesh position={[0, 0.72, -0.3]} castShadow>
        <boxGeometry args={[width, 0.55, 0.15]} />
        <meshStandardMaterial color="#8B2020" roughness={0.85} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-(width / 2 + 0.08), 0.56, -0.06]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.6]} />
        <meshStandardMaterial color="#701A1A" roughness={0.85} />
      </mesh>
      {/* Right arm */}
      <mesh position={[(width / 2 + 0.08), 0.56, -0.06]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.6]} />
        <meshStandardMaterial color="#701A1A" roughness={0.85} />
      </mesh>
      {/* Legs */}
      {(
        [
          [-(width / 2 - 0.12), -0.12],
          [(width / 2 - 0.12), -0.12],
          [-(width / 2 - 0.12), 0.28],
          [(width / 2 - 0.12), 0.28],
        ] as [number, number][]
      ).map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.12, lz]} castShadow>
          <boxGeometry args={[0.08, 0.24, 0.08]} />
          <meshStandardMaterial color="#3A1E08" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/** Simple wall painting (coloured canvas in a frame) */
function WallPainting({
  position,
  rotationY = 0,
  frameColor = '#5A3010',
  paintColor = '#1A3A5A',
}: {
  position: [number, number, number]
  rotationY?: number
  frameColor?: string
  paintColor?: string
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[0.9, 0.7, 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.75} />
      </mesh>
      {/* Canvas */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[0.76, 0.56]} />
        <meshStandardMaterial color={paintColor} roughness={0.9} />
      </mesh>
      {/* Abstract painting strokes – 3 accent shapes */}
      <mesh position={[-0.12, 0.06, 0.045]}>
        <planeGeometry args={[0.18, 0.28]} />
        <meshStandardMaterial color="#FFD700" roughness={0.9} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0.12, -0.06, 0.045]}>
        <planeGeometry args={[0.22, 0.2]} />
        <meshStandardMaterial color="#FF6633" roughness={0.9} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

/** Decorative rug (coloured plane on the floor) */
function Rug({
  position,
  size,
  color,
}: {
  position: [number, number, number]
  size: [number, number]
  color: string
}) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  )
}

export default function LobbyFurniture() {
  return (
    <group>
      {/* ── Tables with chairs ───────────────────────────────────── */}
      <TableWithChairs position={[-5, 0, -3]} />
      <TableWithChairs position={[5, 0, -3]} />
      <TableWithChairs position={[-5, 0, 3]} />
      <TableWithChairs position={[5, 0, 3]} />
      <TableWithChairs position={[0, 0, -5]} />

      {/* ── Couches ──────────────────────────────────────────────── */}
      <Couch position={[-7, 0, 7]} rotationY={Math.PI / 2} width={2.2} />
      <Couch position={[7, 0, 7]} rotationY={-Math.PI / 2} width={2.2} />
      <Couch position={[0, 0, 9]} rotationY={Math.PI} width={2.5} />

      {/* ── Rugs ─────────────────────────────────────────────────── */}
      <Rug position={[0, 0.002, 0]} size={[6, 6]} color="#6B1A1A" />
      <Rug position={[-5, 0.002, 5]} size={[3.5, 3.5]} color="#1A3A6B" />
      <Rug position={[5, 0.002, 5]} size={[3.5, 3.5]} color="#1A6B3A" />

      {/* ── Wall paintings ───────────────────────────────────────── */}
      {/* Back wall */}
      <WallPainting position={[-5, 2.4, -9.84]} paintColor="#2C1A6B" />
      <WallPainting position={[5, 2.4, -9.84]} paintColor="#6B2C1A" />
      {/* Left wall */}
      <WallPainting
        position={[-9.84, 2.4, 3]}
        rotationY={Math.PI / 2}
        paintColor="#1A6B2C"
      />
      <WallPainting
        position={[-9.84, 2.4, -3]}
        rotationY={Math.PI / 2}
        paintColor="#6B5A1A"
      />
      {/* Right wall */}
      <WallPainting
        position={[9.84, 2.4, 3]}
        rotationY={-Math.PI / 2}
        paintColor="#3A1A6B"
      />
      <WallPainting
        position={[9.84, 2.4, -3]}
        rotationY={-Math.PI / 2}
        paintColor="#6B1A3A"
      />
    </group>
  )
}
