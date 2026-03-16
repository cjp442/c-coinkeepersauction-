import React, { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Guild, GuildMember, ChatMessage } from '../types'
import type { RealtimeChannel } from '@supabase/supabase-js'

type GuildTab = 'info' | 'members' | 'chat'

interface GuildPanelProps {
  currentUserId: string
  currentUsername: string
  onClose?: () => void
}

const GuildPanel: React.FC<GuildPanelProps> = ({ currentUserId, currentUsername, onClose }) => {
  const [tab, setTab] = useState<GuildTab>('info')
  const [myGuild, setMyGuild] = useState<Guild | null>(null)
  const [members, setMembers] = useState<GuildMember[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [newGuildName, setNewGuildName] = useState('')
  const [newGuildDesc, setNewGuildDesc] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const guildChatChannel = useRef<RealtimeChannel | null>(null)

  const flash = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3000)
  }

  const loadGuild = useCallback(async () => {
    setLoading(true)
    const { data: membership } = await supabase
      .from('guild_members')
      .select('guild_id')
      .eq('user_id', currentUserId)
      .single()

    if (!membership) { setMyGuild(null); setLoading(false); return }

    const [{ data: guild }, { data: memberData }, { data: msgData }] = await Promise.all([
      supabase.from('guilds').select('*').eq('id', membership.guild_id).single(),
      supabase.from('guild_members').select('*').eq('guild_id', membership.guild_id),
      supabase
        .from('chat_messages')
        .select('*')
        .eq('channel', 'guild')
        .eq('channel_id', membership.guild_id)
        .order('created_at', { ascending: true })
        .limit(100),
    ])

    setMyGuild(guild as Guild)
    setMembers((memberData ?? []) as GuildMember[])
    setMessages((msgData ?? []) as ChatMessage[])
    setLoading(false)
  }, [currentUserId])

  useEffect(() => {
    loadGuild()
  }, [loadGuild])

  // Real-time chat subscription
  useEffect(() => {
    if (!myGuild) return

    const channel = supabase
      .channel(`guild_chat:${myGuild.id}`)
      .on('broadcast', { event: 'guild_message' }, ({ payload }) => {
        setMessages((prev) => [...prev.slice(-199), payload as ChatMessage])
      })
      .subscribe()

    guildChatChannel.current = channel

    return () => {
      supabase.removeChannel(channel)
      guildChatChannel.current = null
    }
  }, [myGuild])

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const createGuild = async () => {
    if (!newGuildName.trim()) return

    const guildId = crypto.randomUUID()

    const { error } = await supabase.from('guilds').insert({
      id: guildId,
      name: newGuildName.trim(),
      description: newGuildDesc.trim() || null,
      owner_id: currentUserId,
      owner_username: currentUsername,
      member_count: 1,
    })
    if (error) { flash('Could not create guild'); return }

    await supabase.from('guild_members').insert({
      guild_id: guildId,
      user_id: currentUserId,
      username: currentUsername,
      role: 'owner',
    })

    flash(`Guild "${newGuildName.trim()}" created!`)
    setNewGuildName('')
    setNewGuildDesc('')
    loadGuild()
  }

  const joinGuild = async () => {
    if (!joinCode.trim()) return

    const { data: guild } = await supabase
      .from('guilds')
      .select('*')
      .ilike('name', joinCode.trim())
      .single()

    if (!guild) { flash('Guild not found'); return }

    const { error } = await supabase.from('guild_members').insert({
      guild_id: guild.id,
      user_id: currentUserId,
      username: currentUsername,
      role: 'member',
    })
    if (error) { flash('Already a member or could not join'); return }

    await supabase
      .from('guilds')
      .update({ member_count: (guild as Guild).member_count + 1 })
      .eq('id', guild.id)

    flash(`Joined "${guild.name}"!`)
    setJoinCode('')
    loadGuild()
  }

  const leaveGuild = async () => {
    if (!myGuild) return
    await supabase
      .from('guild_members')
      .delete()
      .eq('guild_id', myGuild.id)
      .eq('user_id', currentUserId)
    await supabase
      .from('guilds')
      .update({ member_count: Math.max(0, myGuild.member_count - 1) })
      .eq('id', myGuild.id)
    setMyGuild(null)
    setMembers([])
    setMessages([])
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !myGuild) return

    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      channel: 'guild',
      channel_id: myGuild.id,
      sender_id: currentUserId,
      sender_username: currentUsername,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev.slice(-199), msg])
    setNewMessage('')

    guildChatChannel.current?.send({ type: 'broadcast', event: 'guild_message', payload: msg })

    await supabase.from('chat_messages').insert(msg)
  }

  const myRole = members.find((m) => m.user_id === currentUserId)?.role

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-green-500/40 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-green-500/30">
          <h2 className="text-xl font-bold text-green-400">
            ⚔️ {myGuild ? myGuild.name : 'Guild'}
          </h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
              ✕
            </button>
          )}
        </div>

        {feedback && (
          <div className="mx-4 mt-3 px-4 py-2 bg-green-800/50 text-green-200 text-sm rounded-lg">
            {feedback}
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 py-12">Loading…</div>
        ) : !myGuild ? (
          /* No guild – create or join */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-green-300 font-semibold mb-3">Create a Guild</h3>
              <input
                type="text"
                value={newGuildName}
                onChange={(e) => setNewGuildName(e.target.value)}
                placeholder="Guild name"
                className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-green-400 outline-none mb-2"
              />
              <input
                type="text"
                value={newGuildDesc}
                onChange={(e) => setNewGuildDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-green-400 outline-none mb-2"
              />
              <button
                onClick={createGuild}
                disabled={!newGuildName.trim()}
                className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Create Guild
              </button>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-green-300 font-semibold mb-3">Join a Guild</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && joinGuild()}
                  placeholder="Enter guild name…"
                  className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-green-400 outline-none"
                />
                <button
                  onClick={joinGuild}
                  className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Guild view */
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              {(['info', 'members', 'chat'] as GuildTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                    tab === t
                      ? 'text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Info tab */}
              {tab === 'info' && (
                <div className="p-6 space-y-4">
                  {myGuild.description && (
                    <p className="text-gray-300 text-sm">{myGuild.description}</p>
                  )}
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Owner</span>
                    <span className="text-white">{myGuild.owner_username}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Members</span>
                    <span className="text-white">{myGuild.member_count}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Your role</span>
                    <span className="text-green-300 capitalize">{myRole}</span>
                  </div>
                  <button
                    onClick={leaveGuild}
                    className="w-full mt-4 bg-red-800/50 hover:bg-red-700 text-red-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Leave Guild
                  </button>
                </div>
              )}

              {/* Members tab */}
              {tab === 'members' && (
                <div className="p-4 space-y-2">
                  {members.map((m) => (
                    <div
                      key={m.user_id}
                      className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
                    >
                      <span className="text-white text-sm">{m.username}</span>
                      <span
                        className={`text-xs capitalize px-2 py-0.5 rounded-full ${
                          m.role === 'owner'
                            ? 'bg-yellow-700 text-yellow-200'
                            : m.role === 'officer'
                            ? 'bg-blue-800 text-blue-200'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat tab */}
              {tab === 'chat' && (
                <div className="flex flex-col h-64">
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {messages.length === 0 && (
                      <p className="text-center text-gray-500 text-sm">No messages yet</p>
                    )}
                    {messages.map((msg) => (
                      <div key={msg.id} className="text-sm">
                        <span className="text-green-400 font-medium">{msg.sender_username}: </span>
                        <span className="text-gray-200">{msg.content}</span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="border-t border-gray-700 p-3 flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Message your guild…"
                      className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-green-400 outline-none"
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-green-700 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default GuildPanel
