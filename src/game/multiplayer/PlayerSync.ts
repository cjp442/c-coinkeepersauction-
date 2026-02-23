/**
 * PlayerSync
 *
 * React hook that:
 *  - Broadcasts the local player's position, animation and emote via NetworkManager
 *  - Collects remote player states so they can be rendered in the scene
 *  - Manages the emote system (wave, dance, celebrate)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { NetworkManager } from './NetworkManager'
import type { PlayerPresence, EmoteType } from '../../types'

const BROADCAST_INTERVAL_MS = 200  // ~5 Hz position updates
const EMOTE_DURATION_MS = 3000
const POSITION_THRESHOLD = 0.01   // min movement to trigger broadcast (units)
const ROTATION_THRESHOLD = 0.02   // min rotation change (radians)

interface LocalPlayerState {
  position: { x: number; y: number; z: number }
  rotation: number
  animation: PlayerPresence['animation']
  emote: EmoteType | null
}

interface UsePlayerSyncOptions {
  userId: string
  username: string
  avatarId?: string
  scene: string
  roomId?: string
}

export function usePlayerSync({
  userId,
  username,
  avatarId,
  scene,
  roomId,
}: UsePlayerSyncOptions) {
  const [remotePlayers, setRemotePlayers] = useState<Map<string, PlayerPresence>>(new Map())
  const [onlinePlayers, setOnlinePlayers] = useState<PlayerPresence[]>([])

  const localState = useRef<LocalPlayerState>({
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    animation: 'idle',
    emote: null,
  })
  const lastBroadcast = useRef<{ position: { x: number; y: number; z: number }; rotation: number }>({
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
  })
  const emoteTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const broadcastInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Connect on mount, disconnect on unmount ───────────────────────────────
  useEffect(() => {
    NetworkManager.connect(userId, username, scene, roomId)

    NetworkManager.setOnPresenceChange((players) => {
      setOnlinePlayers(players.filter((p) => p.user_id !== userId))
    })

    NetworkManager.setOnPositionUpdate((data) => {
      if (data.user_id === userId) return
      setRemotePlayers((prev) => {
        const next = new Map(prev)
        next.set(data.user_id, {
          ...data,
          online_at: prev.get(data.user_id)?.online_at ?? new Date().toISOString(),
        })
        return next
      })
    })

    // Periodic position broadcast (only when state has changed beyond threshold)
    broadcastInterval.current = setInterval(() => {
      const { position, rotation } = localState.current
      const last = lastBroadcast.current
      const dx = Math.abs(position.x - last.position.x)
      const dy = Math.abs(position.y - last.position.y)
      const dz = Math.abs(position.z - last.position.z)
      const dr = Math.abs(rotation - last.rotation)
      if (dx < POSITION_THRESHOLD && dy < POSITION_THRESHOLD && dz < POSITION_THRESHOLD && dr < ROTATION_THRESHOLD) return

      lastBroadcast.current = { position: { ...position }, rotation }
      NetworkManager.broadcastPosition({
        user_id: userId,
        username,
        avatar_id: avatarId,
        scene,
        room_id: roomId,
        ...localState.current,
      })
    }, BROADCAST_INTERVAL_MS)

    return () => {
      NetworkManager.disconnect()
      if (broadcastInterval.current) clearInterval(broadcastInterval.current)
      if (emoteTimeout.current) clearTimeout(emoteTimeout.current)
    }
  }, [userId, username, avatarId, scene, roomId])

  // ── Exported mutators ─────────────────────────────────────────────────────

  const updatePosition = useCallback(
    (position: { x: number; y: number; z: number }, rotation: number) => {
      localState.current.position = position
      localState.current.rotation = rotation
    },
    []
  )

  const updateAnimation = useCallback((animation: PlayerPresence['animation']) => {
    localState.current.animation = animation
  }, [])

  const playEmote = useCallback((emote: EmoteType) => {
    localState.current.emote = emote

    if (emoteTimeout.current) clearTimeout(emoteTimeout.current)
    emoteTimeout.current = setTimeout(() => {
      localState.current.emote = null
    }, EMOTE_DURATION_MS)
  }, [])

  return {
    remotePlayers: Array.from(remotePlayers.values()),
    onlinePlayers,
    updatePosition,
    updateAnimation,
    playEmote,
  }
}
