// src/components/StreamChat.tsx
// Real-time stream chat with moderation and ban controls

import { useEffect, useRef, useState, useCallback } from 'react'
import { StreamChatMessage } from '../types'
import {
  getChatMessages,
  subscribeToChatMessages,
  sendChatMessage,
  moderateChatMessage,
  deleteUserMessages,
  banFromChat,
  unbanFromChat,
} from '../services/streamingService'

interface StreamChatProps {
  streamId: string
  currentUserId?: string
  currentUsername?: string
  isHost?: boolean
  isModerator?: boolean
}

export default function StreamChat({
  streamId,
  currentUserId,
  currentUsername,
  isHost = false,
  isModerator = false,
}: StreamChatProps) {
  const [messages, setMessages] = useState<StreamChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [modMenuUserId, setModMenuUserId] = useState<string | null>(null)
  const [banReason, setBanReason] = useState('')
  const [showBanInput, setShowBanInput] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const canModerate = isHost || isModerator

  // Load existing messages
  useEffect(() => {
    getChatMessages(streamId).then(setMessages)
  }, [streamId])

  // Subscribe to real-time messages
  useEffect(() => {
    const unsub = subscribeToChatMessages(streamId, (msg) => {
      setMessages((prev) => [...prev, msg])
    })
    return unsub
  }, [streamId])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!currentUserId || !currentUsername || !input.trim()) return
    setSending(true)
    setSendError(null)
    try {
      await sendChatMessage(streamId, currentUserId, currentUsername, input.trim())
      setInput('')
    } catch (err: any) {
      setSendError(err.message ?? 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }, [streamId, currentUserId, currentUsername, input])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleModerateMessage = async (messageId: string) => {
    await moderateChatMessage(messageId)
    setMessages((prev) => prev.filter((m) => m.id !== messageId))
  }

  const handleDeleteUserMessages = async (userId: string) => {
    await deleteUserMessages(streamId, userId)
    setMessages((prev) => prev.filter((m) => m.user_id !== userId))
    setModMenuUserId(null)
  }

  const handleBanUser = async (userId: string) => {
    if (!currentUserId) return
    await banFromChat(streamId, userId, currentUserId, banReason || undefined)
    setMessages((prev) => prev.filter((m) => m.user_id !== userId))
    setModMenuUserId(null)
    setShowBanInput(null)
    setBanReason('')
  }

  const handleUnbanUser = async (userId: string) => {
    await unbanFromChat(streamId, userId)
    setModMenuUserId(null)
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
        <span className="text-white font-semibold text-sm">Stream Chat</span>
        {canModerate && (
          <span className="ml-auto text-xs bg-indigo-600 text-white px-2 py-0.5 rounded">
            {isHost ? 'Host' : 'Mod'}
          </span>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 min-h-0">
        {messages.length === 0 && (
          <p className="text-slate-500 text-xs text-center mt-8">No messages yet. Say hello! 👋</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="group flex items-start gap-1.5 text-sm"
          >
            <span className="font-semibold text-amber-400 shrink-0">{msg.username}</span>
            <span className="text-slate-200 break-words min-w-0">{msg.message}</span>

            {/* Moderation controls visible on hover for host/mods */}
            {canModerate && msg.user_id !== currentUserId && (
              <div className="ml-auto hidden group-hover:flex items-center gap-1 shrink-0">
                {/* Delete this message */}
                <button
                  title="Delete message"
                  className="text-slate-500 hover:text-red-400 text-xs"
                  onClick={() => handleModerateMessage(msg.id)}
                >
                  🗑
                </button>
                {/* Open mod menu for user */}
                <button
                  title="Moderate user"
                  className="text-slate-500 hover:text-amber-400 text-xs"
                  onClick={() =>
                    setModMenuUserId(modMenuUserId === msg.user_id ? null : msg.user_id)
                  }
                >
                  🛡
                </button>

                {/* Mod menu */}
                {modMenuUserId === msg.user_id && (
                  <div className="absolute z-20 right-0 mt-1 bg-slate-800 border border-slate-600 rounded shadow-lg text-xs">
                    <button
                      className="block w-full text-left px-3 py-1.5 hover:bg-slate-700 text-slate-200"
                      onClick={() => handleDeleteUserMessages(msg.user_id)}
                    >
                      Clear all messages
                    </button>
                    <button
                      className="block w-full text-left px-3 py-1.5 hover:bg-slate-700 text-red-400"
                      onClick={() => setShowBanInput(msg.user_id)}
                    >
                      Ban from chat
                    </button>
                    <button
                      className="block w-full text-left px-3 py-1.5 hover:bg-slate-700 text-slate-400"
                      onClick={() => handleUnbanUser(msg.user_id)}
                    >
                      Unban user
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Ban reason input */}
      {showBanInput && (
        <div className="px-3 py-2 bg-slate-800 border-t border-slate-700 flex gap-2">
          <input
            type="text"
            placeholder="Ban reason (optional)"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            className="flex-1 text-xs bg-slate-700 text-white border border-slate-600 rounded px-2 py-1"
          />
          <button
            className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded"
            onClick={() => handleBanUser(showBanInput)}
          >
            Ban
          </button>
          <button
            className="text-xs text-slate-400 hover:text-white"
            onClick={() => { setShowBanInput(null); setBanReason('') }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Message input */}
      <div className="px-3 py-3 border-t border-slate-700">
        {currentUserId ? (
          <>
            {sendError && <p className="text-red-400 text-xs mb-1">{sendError}</p>}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Send a message…"
                maxLength={200}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
                className="flex-1 text-sm bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
              />
              <button
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm px-4 py-2 rounded-lg disabled:opacity-50"
                onClick={handleSend}
                disabled={sending || !input.trim()}
              >
                Chat
              </button>
            </div>
          </>
        ) : (
          <p className="text-slate-500 text-xs text-center py-1">Sign in to chat</p>
        )}
      </div>
    </div>
  )
}
