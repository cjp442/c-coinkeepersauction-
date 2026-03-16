import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { FriendRequest, BlockedPlayer } from '../types'

type Tab = 'friends' | 'requests' | 'blocked'

interface FriendsListProps {
  currentUserId: string
  currentUsername: string
  onViewProfile?: (userId: string) => void
  onClose?: () => void
}

const FriendsList: React.FC<FriendsListProps> = ({
  currentUserId,
  currentUsername,
  onViewProfile,
  onClose,
}) => {
  const [tab, setTab] = useState<Tab>('friends')
  const [friends, setFriends] = useState<FriendRequest[]>([])
  const [incoming, setIncoming] = useState<FriendRequest[]>([])
  const [blocked, setBlocked] = useState<BlockedPlayer[]>([])
  const [searchUsername, setSearchUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const flash = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)

    const [{ data: friendData }, { data: reqData }, { data: blockData }] = await Promise.all([
      supabase
        .from('friends')
        .select('*')
        .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)
        .eq('status', 'accepted'),
      supabase
        .from('friends')
        .select('*')
        .eq('addressee_id', currentUserId)
        .eq('status', 'pending'),
      supabase
        .from('blocked_players')
        .select('*')
        .eq('blocker_id', currentUserId),
    ])

    setFriends((friendData ?? []) as FriendRequest[])
    setIncoming((reqData ?? []) as FriendRequest[])
    setBlocked((blockData ?? []) as BlockedPlayer[])
    setLoading(false)
  }, [currentUserId])

  useEffect(() => {
    loadData()

    const sub = supabase
      .channel('friends_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocked_players' }, loadData)
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [loadData])

  const sendFriendRequest = async () => {
    if (!searchUsername.trim()) return
    const { data: target } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', searchUsername.trim())
      .single()

    if (!target) { flash('User not found'); return }
    if (target.id === currentUserId) { flash("Can't add yourself"); return }

    const { error } = await supabase.from('friends').insert({
      requester_id: currentUserId,
      requester_username: currentUsername,
      addressee_id: target.id,
      addressee_username: target.username,
      status: 'pending',
    })

    if (error) { flash('Request already sent or an error occurred'); return }
    flash(`Friend request sent to ${target.username}`)
    setSearchUsername('')
    loadData()
  }

  const respondToRequest = async (requestId: string, accept: boolean) => {
    await supabase
      .from('friends')
      .update({ status: accept ? 'accepted' : 'declined' })
      .eq('id', requestId)
    loadData()
  }

  const removeFriend = async (requestId: string) => {
    await supabase.from('friends').delete().eq('id', requestId)
    loadData()
  }

  const blockPlayer = async (targetUserId: string, targetUsername: string) => {
    await supabase.from('blocked_players').insert({
      blocker_id: currentUserId,
      blocked_id: targetUserId,
      blocked_username: targetUsername,
    })
    // Remove any friend relationship (two separate queries instead of OR string interpolation)
    await supabase
      .from('friends')
      .delete()
      .eq('requester_id', currentUserId)
      .eq('addressee_id', targetUserId)
    await supabase
      .from('friends')
      .delete()
      .eq('requester_id', targetUserId)
      .eq('addressee_id', currentUserId)
    loadData()
  }

  const unblockPlayer = async (blockId: string) => {
    await supabase.from('blocked_players').delete().eq('id', blockId)
    loadData()
  }

  const reportPlayer = async (targetUserId: string) => {
    await supabase.from('player_reports').insert({
      reporter_id: currentUserId,
      reported_id: targetUserId,
      reason: 'Reported by user',
    })
    flash('Player reported. Thank you.')
  }

  const getFriendPeer = (req: FriendRequest) =>
    req.requester_id === currentUserId
      ? { id: req.addressee_id, username: req.addressee_username }
      : { id: req.requester_id, username: req.requester_username }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-purple-500/40 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/30">
          <h2 className="text-xl font-bold text-purple-300">👥 Friends</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
              ✕
            </button>
          )}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="mx-4 mt-3 px-4 py-2 bg-purple-800/60 text-purple-200 text-sm rounded-lg">
            {feedback}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {(['friends', 'requests', 'blocked'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? 'text-purple-300 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t === 'requests' ? `Requests${incoming.length ? ` (${incoming.length})` : ''}` : t}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto max-h-80 p-4 space-y-2">
          {loading && <p className="text-center text-gray-500 py-6">Loading…</p>}

          {/* Friends tab */}
          {!loading && tab === 'friends' && (
            <>
              {/* Add friend */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendFriendRequest()}
                  placeholder="Add friend by username…"
                  className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-purple-400 outline-none"
                />
                <button
                  onClick={sendFriendRequest}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>

              {friends.length === 0 ? (
                <p className="text-center text-gray-500 py-6">No friends yet. Start adding some!</p>
              ) : (
                friends.map((req) => {
                  const peer = getFriendPeer(req)
                  return (
                    <div
                      key={req.id}
                      className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
                    >
                      <span className="text-white text-sm">{peer.username}</span>
                      <div className="flex gap-1">
                        {onViewProfile && (
                          <button
                            onClick={() => onViewProfile(peer.id)}
                            className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded"
                          >
                            Profile
                          </button>
                        )}
                        <button
                          onClick={() => blockPlayer(peer.id, peer.username)}
                          className="text-xs text-orange-400 hover:text-orange-300 px-2 py-1 rounded"
                        >
                          Block
                        </button>
                        <button
                          onClick={() => reportPlayer(peer.id)}
                          className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded"
                        >
                          Report
                        </button>
                        <button
                          onClick={() => removeFriend(req.id)}
                          className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </>
          )}

          {/* Requests tab */}
          {!loading && tab === 'requests' && (
            <>
              {incoming.length === 0 ? (
                <p className="text-center text-gray-500 py-6">No pending requests</p>
              ) : (
                incoming.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
                  >
                    <span className="text-white text-sm">{req.requester_username}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => respondToRequest(req.id, true)}
                        className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respondToRequest(req.id, false)}
                        className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Blocked tab */}
          {!loading && tab === 'blocked' && (
            <>
              {blocked.length === 0 ? (
                <p className="text-center text-gray-500 py-6">No blocked players</p>
              ) : (
                blocked.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
                  >
                    <span className="text-gray-300 text-sm">{b.blocked_username}</span>
                    <button
                      onClick={() => unblockPlayer(b.id)}
                      className="text-xs text-purple-400 hover:text-purple-300 px-2 py-1 rounded"
                    >
                      Unblock
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default FriendsList
