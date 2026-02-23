// src/services/gameService.ts

export function getLobbyState(): Record<string, unknown> {
  return {}
}

export function getRoomData(roomId: string): Record<string, unknown> {
  return { roomId }
}

export function getOnlinePlayers(): string[] {
  return []
}

export function updatePlayerPosition(playerId: string, newPosition: { x: number; y: number; z: number }): void {
  console.log(`Player ${playerId} moved to`, newPosition)
}

export function portalTransition(playerId: string, portalId: string): void {
  console.log(`Player ${playerId} entered portal ${portalId}`)
}
