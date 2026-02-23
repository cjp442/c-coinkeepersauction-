// src/services/streamingService.ts
// Streaming & Live Broadcast Service — Supabase-backed

import { createClient } from '@supabase/supabase-js'
import {
  LiveStream,
  StreamChatMessage,
  StreamTip,
  StreamVOD,
  StreamSchedule,
} from '../types'

// Use the existing Supabase client configuration via env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Stream Management ──────────────────────────────────────────────────────

/**
 * Create a new stream record for a host. Returns the created stream.
 */
export async function createStream(
  hostId: string,
  title: string,
  description: string,
  roomId?: string,
  recordingEnabled = false,
): Promise<LiveStream | null> {
  const { data, error } = await supabase
    .from('streams')
    .insert({
      host_id: hostId,
      room_id: roomId ?? null,
      title,
      description,
      recording_enabled: recordingEnabled,
      status: 'offline',
    })
    .select()
    .single()
  if (error) {
    console.error('createStream error:', error)
    return null
  }
  return data as unknown as LiveStream
}

/**
 * Transition a stream to "live" status and record started_at.
 */
export async function goLive(streamId: string): Promise<void> {
  const { error } = await supabase
    .from('streams')
    .update({ status: 'live', is_live: true, started_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', streamId)
  if (error) console.error('goLive error:', error)
}

/**
 * Transition a stream to "ended" status and record ended_at.
 */
export async function endStream(streamId: string): Promise<void> {
  const { error } = await supabase
    .from('streams')
    .update({ status: 'ended', is_live: false, ended_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', streamId)
  if (error) console.error('endStream error:', error)
}

/**
 * Fetch a single stream by ID.
 */
export async function getStream(streamId: string): Promise<LiveStream | null> {
  const { data, error } = await supabase
    .from('streams')
    .select('*')
    .eq('id', streamId)
    .single()
  if (error) {
    console.error('getStream error:', error)
    return null
  }
  return data as unknown as LiveStream
}

/**
 * Fetch all currently live streams.
 */
export async function getLiveStreams(): Promise<LiveStream[]> {
  const { data, error } = await supabase
    .from('streams')
    .select('*')
    .eq('status', 'live')
    .order('viewer_count', { ascending: false })
  if (error) {
    console.error('getLiveStreams error:', error)
    return []
  }
  return (data ?? []) as unknown as LiveStream[]
}

/**
 * Fetch streams belonging to a specific host.
 */
export async function getHostStreams(hostId: string): Promise<LiveStream[]> {
  const { data, error } = await supabase
    .from('streams')
    .select('*')
    .eq('host_id', hostId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('getHostStreams error:', error)
    return []
  }
  return (data ?? []) as unknown as LiveStream[]
}

/**
 * Raid: send current stream viewers to another stream atomically via RPC.
 */
export async function raidStream(fromStreamId: string, toStreamId: string): Promise<void> {
  const { error } = await supabase.rpc('raid_stream', {
    p_from_stream_id: fromStreamId,
    p_to_stream_id: toStreamId,
  })
  if (error) console.error('raidStream error:', error)
}

// ─── Viewer Count ───────────────────────────────────────────────────────────

/** Increment viewer count when a user joins. */
export async function joinStream(streamId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_stream_viewers', { p_stream_id: streamId })
  if (error) console.error('joinStream error:', error)
}

/** Decrement viewer count when a user leaves. */
export async function leaveStream(streamId: string): Promise<void> {
  const { error } = await supabase.rpc('decrement_stream_viewers', { p_stream_id: streamId })
  if (error) console.error('leaveStream error:', error)
}

/**
 * Subscribe to real-time viewer count updates for a stream.
 * Returns an unsubscribe function.
 */
export function subscribeToViewerCount(
  streamId: string,
  onUpdate: (count: number) => void,
): () => void {
  const channel = supabase
    .channel(`stream-viewers-${streamId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'streams', filter: `id=eq.${streamId}` },
      (payload) => {
        const updated = payload.new as LiveStream
        onUpdate(updated.viewer_count ?? 0)
      },
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

// ─── Stream Chat ─────────────────────────────────────────────────────────────

/**
 * Send a chat message to a stream.
 */
export async function sendChatMessage(
  streamId: string,
  userId: string,
  username: string,
  message: string,
): Promise<void> {
  // Check if user is banned
  const banned = await isUserBanned(streamId, userId)
  if (banned) throw new Error('You are banned from this stream chat.')

  const { error } = await supabase.from('stream_chat').insert({
    stream_id: streamId,
    user_id: userId,
    username,
    message,
  })
  if (error) throw new Error(error.message)
}

/**
 * Fetch recent chat messages for a stream (most recent 100).
 */
export async function getChatMessages(streamId: string): Promise<StreamChatMessage[]> {
  const { data, error } = await supabase
    .from('stream_chat')
    .select('*')
    .eq('stream_id', streamId)
    .eq('is_moderated', false)
    .order('created_at', { ascending: true })
    .limit(100)
  if (error) {
    console.error('getChatMessages error:', error)
    return []
  }
  return (data ?? []) as StreamChatMessage[]
}

/**
 * Subscribe to new chat messages in real time.
 * Returns an unsubscribe function.
 */
export function subscribeToChatMessages(
  streamId: string,
  onMessage: (msg: StreamChatMessage) => void,
): () => void {
  const channel = supabase
    .channel(`stream-chat-${streamId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'stream_chat',
        filter: `stream_id=eq.${streamId}`,
      },
      (payload) => {
        const msg = payload.new as StreamChatMessage
        if (!msg.is_moderated) onMessage(msg)
      },
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Moderate (hide) a specific chat message.
 */
export async function moderateChatMessage(messageId: string): Promise<void> {
  const { error } = await supabase
    .from('stream_chat')
    .update({ is_moderated: true })
    .eq('id', messageId)
  if (error) console.error('moderateChatMessage error:', error)
}

/**
 * Delete all visible chat messages from a user in a stream (clear spam).
 */
export async function deleteUserMessages(streamId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('stream_chat')
    .update({ is_moderated: true })
    .eq('stream_id', streamId)
    .eq('user_id', userId)
  if (error) console.error('deleteUserMessages error:', error)
}

// ─── Chat Bans ───────────────────────────────────────────────────────────────

/**
 * Ban a user from a stream's chat. Optionally supply a reason.
 */
export async function banFromChat(
  streamId: string,
  bannedUserId: string,
  bannedBy: string,
  reason?: string,
): Promise<void> {
  const { error } = await supabase.from('stream_bans').upsert({
    stream_id: streamId,
    banned_user_id: bannedUserId,
    banned_by: bannedBy,
    reason: reason ?? null,
  })
  if (error) console.error('banFromChat error:', error)
  // Also delete existing messages from the banned user
  await deleteUserMessages(streamId, bannedUserId)
}

/**
 * Lift a chat ban for a user.
 */
export async function unbanFromChat(streamId: string, bannedUserId: string): Promise<void> {
  const { error } = await supabase
    .from('stream_bans')
    .delete()
    .eq('stream_id', streamId)
    .eq('banned_user_id', bannedUserId)
  if (error) console.error('unbanFromChat error:', error)
}

/**
 * Check whether a user is banned from a stream's chat.
 */
export async function isUserBanned(streamId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('stream_bans')
    .select('id')
    .eq('stream_id', streamId)
    .eq('banned_user_id', userId)
    .maybeSingle()
  if (error) console.error('isUserBanned error:', error)
  return !!data
}

// ─── Moderators ──────────────────────────────────────────────────────────────

/** Appoint a moderator for a stream. */
export async function addModerator(streamId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('stream_moderators')
    .upsert({ stream_id: streamId, user_id: userId })
  if (error) console.error('addModerator error:', error)
}

/** Remove a moderator from a stream. */
export async function removeModerator(streamId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('stream_moderators')
    .delete()
    .eq('stream_id', streamId)
    .eq('user_id', userId)
  if (error) console.error('removeModerator error:', error)
}

/** Check if a user is a moderator for a stream. */
export async function isModerator(streamId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('stream_moderators')
    .select('id')
    .eq('stream_id', streamId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) console.error('isModerator error:', error)
  return !!data
}

/** Fetch all moderator user IDs for a stream. */
export async function getStreamModerators(streamId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('stream_moderators')
    .select('user_id')
    .eq('stream_id', streamId)
  if (error) {
    console.error('getStreamModerators error:', error)
    return []
  }
  return (data ?? []).map((r: any) => r.user_id)
}

// ─── Tips / Donations ────────────────────────────────────────────────────────

/**
 * Send a coin tip to a stream host. Calls the DB function which deducts coins
 * from the tipper and credits the host.
 */
export async function sendTip(
  streamId: string,
  tipperId: string,
  tipperUsername: string,
  amount: number,
  message?: string,
): Promise<void> {
  const { error } = await supabase.rpc('send_stream_tip', {
    p_stream_id: streamId,
    p_tipper_id: tipperId,
    p_tipper_username: tipperUsername,
    p_amount: amount,
    p_message: message ?? null,
  })
  if (error) throw new Error(error.message)
}

/**
 * Fetch all tips for a stream ordered by most recent first.
 */
export async function getStreamTips(streamId: string): Promise<StreamTip[]> {
  const { data, error } = await supabase
    .from('stream_tips')
    .select('*')
    .eq('stream_id', streamId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('getStreamTips error:', error)
    return []
  }
  return (data ?? []) as StreamTip[]
}

/**
 * Subscribe to new tips in real time.
 */
export function subscribeToTips(
  streamId: string,
  onTip: (tip: StreamTip) => void,
): () => void {
  const channel = supabase
    .channel(`stream-tips-${streamId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'stream_tips',
        filter: `stream_id=eq.${streamId}`,
      },
      (payload) => onTip(payload.new as StreamTip),
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

// ─── VODs ────────────────────────────────────────────────────────────────────

/**
 * Fetch all VOD recordings for a host.
 */
export async function getHostVODs(hostId: string): Promise<StreamVOD[]> {
  const { data, error } = await supabase
    .from('stream_vods')
    .select('*')
    .eq('host_id', hostId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('getHostVODs error:', error)
    return []
  }
  return (data ?? []) as StreamVOD[]
}

/** Increment the view count for a VOD. */
export async function watchVOD(vodId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_vod_views', { p_vod_id: vodId })
  if (error) console.error('watchVOD error:', error)
}

// ─── Schedule ────────────────────────────────────────────────────────────────

/**
 * Create a scheduled broadcast entry.
 */
export async function scheduleStream(
  hostId: string,
  title: string,
  scheduledAt: string,
  description?: string,
): Promise<StreamSchedule | null> {
  const { data, error } = await supabase
    .from('stream_schedules')
    .insert({ host_id: hostId, title, scheduled_at: scheduledAt, description: description ?? null })
    .select()
    .single()
  if (error) {
    console.error('scheduleStream error:', error)
    return null
  }
  return data as StreamSchedule
}

/**
 * Fetch upcoming schedules for a host (future dates only).
 */
export async function getStreamSchedules(hostId: string): Promise<StreamSchedule[]> {
  const { data, error } = await supabase
    .from('stream_schedules')
    .select('*')
    .eq('host_id', hostId)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
  if (error) {
    console.error('getStreamSchedules error:', error)
    return []
  }
  return (data ?? []) as StreamSchedule[]
}

/**
 * Delete a stream schedule entry.
 */
export async function deleteSchedule(scheduleId: string): Promise<void> {
  const { error } = await supabase.from('stream_schedules').delete().eq('id', scheduleId)
  if (error) console.error('deleteSchedule error:', error)
}

// ─── Followers ───────────────────────────────────────────────────────────────

/** Follow a host to receive "go live" notifications. */
export async function followHost(hostId: string, followerId: string): Promise<void> {
  const { error } = await supabase
    .from('stream_followers')
    .upsert({ host_id: hostId, follower_id: followerId })
  if (error) console.error('followHost error:', error)
}

/** Unfollow a host. */
export async function unfollowHost(hostId: string, followerId: string): Promise<void> {
  const { error } = await supabase
    .from('stream_followers')
    .delete()
    .eq('host_id', hostId)
    .eq('follower_id', followerId)
  if (error) console.error('unfollowHost error:', error)
}

/** Check if a user is following a host. */
export async function isFollowing(hostId: string, followerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('stream_followers')
    .select('id')
    .eq('host_id', hostId)
    .eq('follower_id', followerId)
    .maybeSingle()
  if (error) console.error('isFollowing error:', error)
  return !!data
}

/** Get follower count for a host. */
export async function getFollowerCount(hostId: string): Promise<number> {
  const { count, error } = await supabase
    .from('stream_followers')
    .select('id', { count: 'exact', head: true })
    .eq('host_id', hostId)
  if (error) console.error('getFollowerCount error:', error)
  return count ?? 0
}
