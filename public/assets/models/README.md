# 3D Model Assets

This directory contains glTF/GLB 3D models for the game lobby and interactive rooms.

All models use the glTF 2.0 format (`.glb` binary or `.gltf` + textures). Textures
are compressed for web delivery (KTX2 / Basis Universal preferred).

---

## Directory Layout

```
public/assets/models/
├── lobby/
│   ├── lobby_room.glb          # Full saloon lobby room (baked lighting)
│   ├── bar_counter.glb         # Bar counter with shelves and stools
│   ├── portal_door.glb         # Ornate wooden portal door (reused per door)
│   ├── chair.glb               # Wooden chair (seatable)
│   ├── table.glb               # Wooden table
│   ├── couch.glb               # Couch / lounge seat
│   ├── chandelier.glb          # Ceiling chandelier (emissive bulbs)
│   ├── painting_01.glb         # Wall painting / decoration
│   └── painting_02.glb
├── avatar/
│   ├── avatar_base_male.glb    # Low-poly male humanoid with rig (Mixamo-compatible)
│   ├── avatar_base_female.glb  # Low-poly female humanoid with rig
│   └── animations/
│       ├── idle.glb
│       ├── walk.glb
│       ├── run.glb
│       ├── jump.glb
│       ├── sit.glb
│       ├── stand.glb
│       └── wave.glb
└── host_room/
    ├── stage.glb               # Raised stage platform with baked spotlights
    └── screen.glb              # Wall-mounted monitor / stream display
```

---

## Model Specifications

### Lobby Room (`lobby/lobby_room.glb`)
- Polygon budget: ≤ 15,000 triangles
- Lightmap UV channel: UV1
- Baked lighting: ambient-occlusion + indirect light in albedo/lightmap texture
- Materials: wood planks (floor), brick plaster (walls), painted wood (ceiling)
- Includes PBR textures: albedo, normal, roughness/metalness (packed ORM)

### Portal Door (`lobby/portal_door.glb`)
- Polygon budget: ≤ 1,500 triangles per door
- Animation: open/close (keyframe, ~0.5 s)
- Emissive UV region for glow effect (driven at runtime)

### Avatar Base (`avatar/avatar_base_*.glb`)
- Polygon budget: ≤ 5,000 triangles
- Rig: humanoid skeleton (Mixamo-compatible bone names)
- Morph targets: mouth open, eye blink
- Materials: skin (customisable base color via shader), clothing (separate material slot)
- Texture resolution: 512 × 512 albedo + normal map

### Animations
All animation clips are stored as separate GLB files and retargeted onto the base
avatar rig at runtime using `THREE.AnimationMixer`.

---

## Texture Guidelines

| Map        | Format  | Resolution  | Notes                                 |
|------------|---------|-------------|---------------------------------------|
| Albedo     | KTX2    | 1024×1024   | sRGB color space                      |
| Normal     | KTX2    | 1024×1024   | OpenGL convention (Y-up)              |
| ORM        | KTX2    | 1024×1024   | R=Occlusion, G=Roughness, B=Metalness |
| Lightmap   | KTX2    | 2048×2048   | Linear, non-overlapping UV1           |
| Emissive   | KTX2    | 512×512     | Linear                                |

Use `@ktx2-transform/cli` or `Basis Universal` to compress source PNG textures.

---

## LOD Strategy

Each model ships with LOD variants embedded as separate mesh primitives inside
the GLB, managed at runtime via `@react-three/drei`'s `<Detailed>` component:

| LOD | Trigger Distance | Target Triangle Budget |
|-----|-----------------|------------------------|
| 0   | < 8 m           | full detail            |
| 1   | 8 – 20 m        | 50 % reduction         |
| 2   | > 20 m          | 80 % reduction         |

---

## Runtime Loading

Models are loaded lazily via `useGLTF` from `@react-three/drei`.  Call
`useGLTF.preload('/assets/models/lobby/lobby_room.glb')` at the top of the
lobby page module so the model is fetched while the page transitions in.

```tsx
import { useGLTF } from '@react-three/drei'

function LobbyRoom() {
  const { scene } = useGLTF('/assets/models/lobby/lobby_room.glb')
  return <primitive object={scene} />
}

// Preload during module evaluation
useGLTF.preload('/assets/models/lobby/lobby_room.glb')
```
