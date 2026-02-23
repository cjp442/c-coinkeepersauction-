/**
 * ChatManager
 *
 * React hook providing:
 *  - Global (scene-level) chat
 *  - Guild chat (scoped to guild_id)
 *  - Private messaging (scoped to a pair of user IDs)
 *
 * Messages are broadcast over Supabase Realtime and also persisted
 * to the `chat_messages` database table.
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { NetworkManager } from './NetworkManager'
import type { ChatMessage } from '../../types'

const MAX_HISTORY = 200

interface UseChatManagerOptions {
  userId: string
  username: string
  scene: string
  roomId?: string
}

export function useChatManager({ userId, username, scene, roomId }: UseChatManagerOptions) {
  const [globalMessages, setGlobalMessages] = useState<ChatMessage[]>([])
  const [guildMessages, setGuildMessages] = useState<ChatMessage[]>([])
  const [privateMessages, setPrivateMessages] = useState<Map<string, ChatMessage[]>>(new Map())

  const appendMessage = useCallback((msg: ChatMessage) => {
    if (msg.channel === 'global') {
      setGlobalMessages((prev) => [...prev.slice(-MAX_HISTORY + 1), msg])
    } else if (msg.channel === 'guild') {
      setGuildMessages((prev) => [...prev.slice(-MAX_HISTORY + 1), msg])
    } else if (msg.channel === 'private') {
      const peerId = msg.sender_id === userId ? msg.channel_id! : msg.sender_id
      setPrivateMessages((prev) => {
        const thread = prev.get(peerId) ?? []
        const next = new Map(prev)
        next.set(peerId, [...thread.slice(-MAX_HISTORY + 1), msg])
        return next
      })
    }
  }, [userId])

  // ── Subscribe to incoming broadcast messages ──────────────────────────────
  useEffect(() => {
    NetworkManager.setOnChatMessage(appendMessage)
  }, [appendMessage])

  // ── Load recent history from database ────────────────────────────────────
  useEffect(() => {
    const channelId = roomId ?? scene

    supabase
      .from('chat_messages')
      .select('*')
      .eq('channel', 'global')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(MAX_HISTORY)
      .then(({ data }) => {
        if (data) setGlobalMessages(data as ChatMessage[])
      })
  }, [scene, roomId])

  // ── Send helpers ──────────────────────────────────────────────────────────

  const buildMessage = useCallback(
    (
      content: string,
      channel: ChatMessage['channel'],
      channelId?: string
    ): ChatMessage => ({
      id: crypto.randomUUID(),
      channel,
      channel_id: channelId ?? (roomId ?? scene),
      sender_id: userId,
      sender_username: username,
      content,
      created_at: new Date().toISOString(),
    }),
    [userId, username, scene, roomId]
  )

  const persist = useCallback(async (msg: ChatMessage): Promise<boolean> => {
    const { error } = await supabase.from('chat_messages').insert(msg)
    if (error) {
      console.error('[ChatManager] Failed to persist message:', error.message)
      return false
    }
    return true
  }, [])

  const sendGlobalMessage = useCallback(
    async (content: string) => {
      const msg = buildMessage(content, 'global')
      appendMessage(msg)
      NetworkManager.broadcastChatMessage(msg)
      await persist(msg)
    },
    [buildMessage, appendMessage, persist]
  )

  const sendGuildMessage = useCallback(
    async (content: string, guildId: string) => {
      const msg = buildMessage(content, 'guild', guildId)
      appendMessage(msg)
      NetworkManager.broadcastChatMessage(msg)
      await persist(msg)
    },
    [buildMessage, appendMessage, persist]
  )

  const sendPrivateMessage = useCallback(
    async (content: string, targetUserId: string) => {
      const msg = buildMessage(content, 'private', targetUserId)
      appendMessage(msg)
      NetworkManager.broadcastChatMessage(msg)
      await persist(msg)
    },
    [buildMessage, appendMessage, persist]
  )

  return {
    globalMessages,
    guildMessages,
    privateMessages,
    sendGlobalMessage,
    sendGuildMessage,
    sendPrivateMessage,
  }
}
