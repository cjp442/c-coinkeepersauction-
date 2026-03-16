/**
 * NetworkManager
 *
 * Manages real-time networking via Supabase Realtime channels.
 * Provides:
 *  - Presence detection (who is online, in which scene/room)
 *  - Broadcast channels for position / animation sync and chat
 *  - Helper to subscribe to database table changes
 */

import { supabase } from '../../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { PlayerPresence, ChatMessage } from '../../types'

type PresenceCallback = (players: PlayerPresence[]) => void
type ChatCallback = (msg: ChatMessage) => void
type PositionCallback = (data: Omit<PlayerPresence, 'online_at'>) => void

class NetworkManagerClass {
  private presenceChannel: RealtimeChannel | null = null
  private chatChannel: RealtimeChannel | null = null
  private positionChannel: RealtimeChannel | null = null

  private onPresenceChange: PresenceCallback | null = null
  private onChatMessage: ChatCallback | null = null
  private onPositionUpdate: PositionCallback | null = null

  /** Connect to all real-time channels for a given scene/room. */
  connect(userId: string, username: string, scene: string, roomId?: string) {
    this.disconnect()

    const channelKey = roomId ? `${scene}:${roomId}` : scene

    // ── Presence channel ─────────────────────────────────────────────────────
    this.presenceChannel = supabase.channel(`presence:${channelKey}`, {
      config: { presence: { key: userId } },
    })

    this.presenceChannel
      .on('presence', { event: 'sync' }, () => {
        if (!this.presenceChannel || !this.onPresenceChange) return
        const state = this.presenceChannel.presenceState<PlayerPresence>()
        const players: PlayerPresence[] = Object.values(state).flat()
        this.onPresenceChange(players)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await this.presenceChannel?.track({
            user_id: userId,
            username,
            scene,
            room_id: roomId,
            position: { x: 0, y: 0, z: 0 },
            rotation: 0,
            animation: 'idle',
            emote: null,
            online_at: new Date().toISOString(),
          } satisfies PlayerPresence)
        }
      })

    // ── Position / animation sync channel ────────────────────────────────────
    this.positionChannel = supabase.channel(`positions:${channelKey}`)

    this.positionChannel
      .on('broadcast', { event: 'player_update' }, ({ payload }) => {
        if (this.onPositionUpdate) {
          this.onPositionUpdate(payload as Omit<PlayerPresence, 'online_at'>)
        }
      })
      .subscribe()

    // ── Chat channel ─────────────────────────────────────────────────────────
    this.chatChannel = supabase.channel(`chat:${channelKey}`)

    this.chatChannel
      .on('broadcast', { event: 'chat_message' }, ({ payload }) => {
        if (this.onChatMessage) {
          this.onChatMessage(payload as ChatMessage)
        }
      })
      .subscribe()
  }

  /** Disconnect and remove all channels. */
  disconnect() {
    if (this.presenceChannel) {
      supabase.removeChannel(this.presenceChannel)
      this.presenceChannel = null
    }
    if (this.positionChannel) {
      supabase.removeChannel(this.positionChannel)
      this.positionChannel = null
    }
    if (this.chatChannel) {
      supabase.removeChannel(this.chatChannel)
      this.chatChannel = null
    }
  }

  /** Broadcast the local player's current position / animation state. */
  broadcastPosition(data: Omit<PlayerPresence, 'online_at'>) {
    this.positionChannel?.send({
      type: 'broadcast',
      event: 'player_update',
      payload: data,
    })
  }

  /** Broadcast a chat message to all players in the current channel. */
  broadcastChatMessage(msg: ChatMessage) {
    this.chatChannel?.send({
      type: 'broadcast',
      event: 'chat_message',
      payload: msg,
    })
  }

  /** Update the presence track record (e.g. after moving to a new scene). */
  async updatePresence(partial: Partial<PlayerPresence>) {
    await this.presenceChannel?.track(partial)
  }

  // ── Callback registration ─────────────────────────────────────────────────

  setOnPresenceChange(cb: PresenceCallback) { this.onPresenceChange = cb }
  setOnChatMessage(cb: ChatCallback) { this.onChatMessage = cb }
  setOnPositionUpdate(cb: PositionCallback) { this.onPositionUpdate = cb }
}

/** Singleton instance – import this throughout the app. */
export const NetworkManager = new NetworkManagerClass()
