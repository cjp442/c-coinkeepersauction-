import { create } from 'zustand'
import { GameState, OnlinePlayer } from '../../types/game'

interface GameStore extends GameState {
  onlinePlayers: OnlinePlayer[]
  setScene: (scene: GameState['currentScene'], roomId?: string) => void
  setPlayerPosition: (position: { x: number; y: number; z: number }) => void
  setPlayerRotation: (rotation: number) => void
  setCameraMode: (mode: GameState['cameraMode']) => void
  setSitting: (isSitting: boolean, seatId?: string) => void
  setNearbyInteractable: (id: string | null) => void
  setOnlinePlayers: (players: OnlinePlayer[]) => void
}

export const useGameStore = create<GameStore>((set) => ({
  currentScene: 'lobby',
  currentRoomId: null,
  playerPosition: { x: 0, y: 0, z: 5 },
  playerRotation: 0,
  cameraMode: 'third_person',
  isSitting: false,
  seatId: null,
  nearbyInteractable: null,
  onlinePlayers: [],

  setScene: (scene, roomId) =>
    set({ currentScene: scene, currentRoomId: roomId ?? null }),

  setPlayerPosition: (position) =>
    set({ playerPosition: position }),

  setPlayerRotation: (rotation) =>
    set({ playerRotation: rotation }),

  setCameraMode: (mode) =>
    set({ cameraMode: mode }),

  setSitting: (isSitting, seatId) =>
    set({ isSitting, seatId: seatId ?? null }),

  setNearbyInteractable: (id) =>
    set({ nearbyInteractable: id }),

  setOnlinePlayers: (players) =>
    set({ onlinePlayers: players }),
}))
