export interface GameState {
  currentScene: 'lobby' | 'host_room' | 'member_room' | null
  currentRoomId: string | null
  playerPosition: { x: number; y: number; z: number }
  playerRotation: number
  cameraMode: 'first_person' | 'third_person'
  isSitting: boolean
  seatId: string | null
  nearbyInteractable: string | null
}

export interface Portal {
  id: string
  name: string
  position: { x: number; y: number; z: number }
  rotation: number
  targetScene: 'lobby' | 'host_room' | 'member_room'
  targetRoomId: string
  isActive: boolean
}

export interface GameChair {
  id: string
  position: { x: number; y: number; z: number }
  rotation: number
  isOccupied: boolean
  occupantId?: string
}

export interface OnlinePlayer {
  id: string
  username: string
  avatarId: string
  position: { x: number; y: number; z: number }
  rotation: number
  animation: 'idle' | 'walk' | 'run' | 'sit'
  scene: string
}

export interface HostRoom {
  id: string
  hostId: string
  hostName: string
  name: string
  isLive: boolean
  viewerCount: number
  streamUrl?: string
}

export interface MemberRoom {
  id: string
  ownerId: string
  ownerName: string
  name: string
  template: string
  decor: DecorPlacement[]
  isPublic: boolean
}

export interface DecorItem {
  id: string
  name: string
  description: string
  price: number
  category: 'furniture' | 'decoration' | 'wall' | 'floor'
  modelKey: string
  previewUrl?: string
}

export interface DecorPlacement {
  itemId: string
  position: { x: number; y: number; z: number }
  rotation: number
}
