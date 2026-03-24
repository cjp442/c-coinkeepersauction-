import { HostRoom, MemberRoom, DecorItem, DecorPlacement, OnlinePlayer } from '../types/game'

export const gameService = {
  async getLobbyState(): Promise<{ hostRooms: HostRoom[]; onlinePlayers: OnlinePlayer[] }> {
    return { hostRooms: [], onlinePlayers: [] }
  },
  async getHostRoom(_roomId: string): Promise<HostRoom | null> {
    return null
  },
  async getMemberRoom(_userId: string): Promise<MemberRoom | null> {
    return null
  },
  async updateRoomDecor(_roomId: string, _placements: DecorPlacement[]): Promise<void> {},
  async getDecorCatalog(): Promise<DecorItem[]> {
    return []
  },
  async getUserDecorInventory(_userId: string): Promise<DecorItem[]> {
    return []
  },
  async purchaseDecor(_userId: string, _decorId: string): Promise<void> {},
  async updatePlayerPosition(_userId: string, _x: number, _y: number, _z: number): Promise<void> {},
}
