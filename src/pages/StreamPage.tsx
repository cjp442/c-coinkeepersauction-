// src/pages/StreamPage.tsx
// Main stream page — viewer experience + host dashboard

import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTokens } from '../contexts/TokenContext'
import StreamPlayer from '../components/StreamPlayer'
import StreamChat from '../components/StreamChat'
import StreamDashboard from '../components/StreamDashboard'
import { getStream, getLiveStreams, isFollowing, followHost, unfollowHost, getFollowerCount, isModerator } from '../services/streamingService'
import { LiveStream } from '../types'

// Minimal router shim — read streamId from URL hash (#/stream/<id>) or query param
function useStreamId(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get('streamId') ?? null
}

export default function StreamPage() {
  const { user } = useAuth()
  const { tokens, deductTokens } = useTokens()
  const streamId = useStreamId()

  const [stream, setStream] = useState<LiveStream | null>(null)
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [userIsMod, setUserIsMod] = useState(false)

  const isHost = !!user && !!stream && user.id === stream.host_id

  // Load the requested stream or the live streams list
  useEffect(() => {
    setLoading(true)
    if (streamId) {
      getStream(streamId).then((s) => {
        setStream(s)
        setLoading(false)
      })
    } else {
      getLiveStreams().then((list) => {
        setLiveStreams(list)
        setLoading(false)
      })
    }
  }, [streamId])

  // Follow state & moderator status for logged-in users
  useEffect(() => {
    if (!user || !stream) return
    isFollowing(stream.host_id, user.id).then(setFollowing)
    getFollowerCount(stream.host_id).then(setFollowerCount)
    if (!isHost) {
      isModerator(stream.id, user.id).then(setUserIsMod)
    }
  }, [user, stream, isHost])

  const handleFollowToggle = async () => {
    if (!user || !stream) return
    if (following) {
      await unfollowHost(stream.host_id, user.id)
      setFollowing(false)
      setFollowerCount((c) => Math.max(0, c - 1))
    } else {
      await followHost(stream.host_id, user.id)
      setFollowing(true)
      setFollowerCount((c) => c + 1)
    }
  }

  // ── Browse live streams (no streamId in URL) ────────────────────────────
  if (!streamId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">🔴 Live Streams</h1>
          {user?.role === 'host' && (
            <a
              href="?hostDashboard=1"
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg text-sm"
            >
              Go Live
            </a>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-800 rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        ) : liveStreams.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <span className="text-5xl">📺</span>
            <p className="mt-4 text-lg">No streams live right now. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveStreams.map((s) => (
              <a
                key={s.id}
                href={`?streamId=${s.id}`}
                className="group bg-slate-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-amber-500 transition"
              >
                <div className="relative aspect-video bg-slate-900">
                  {s.thumbnail_url ? (
                    <img src={s.thumbnail_url} alt={s.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-slate-600 text-4xl">📺</div>
                  )}
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded uppercase animate-pulse">
                    LIVE
                  </span>
                  <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                    👁 {s.viewer_count ?? 0}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-white font-semibold text-sm truncate">{s.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{s.host_name}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Host dashboard (hostDashboard=1 query param) ────────────────────────
  if (new URLSearchParams(window.location.search).get('hostDashboard') === '1' && user?.role === 'host') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-white mb-6">🎙 Stream Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StreamDashboard hostId={user.id} hostName={user.username} />
          </div>
          <div className="h-[600px]">
            {stream && (
              <StreamChat
                streamId={stream.id}
                currentUserId={user?.id}
                currentUsername={user?.username}
                isHost
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Single stream viewer page ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-slate-800 rounded-xl aspect-video animate-pulse" />
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        <span className="text-5xl">🔍</span>
        <p className="mt-4 text-lg">Stream not found.</p>
        <a href="/stream" className="mt-4 inline-block text-amber-400 hover:underline text-sm">
          ← Browse live streams
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Back link */}
      <a href="/stream" className="text-slate-400 hover:text-white text-sm mb-4 inline-block">
        ← All streams
      </a>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: player (+ host dashboard for the host) */}
        <div className="lg:col-span-2 space-y-4">
          <StreamPlayer
            stream={stream}
            currentUserId={user?.id}
            currentUsername={user?.username}
            coinBalance={tokens?.balance ?? 0}
            onBalanceChange={() => deductTokens(0, 'tip')}
          />

          {/* Follow button + follower count */}
          {user && !isHost && (
            <div className="flex items-center gap-3">
              <button
                className={`text-sm font-bold px-4 py-2 rounded-lg ${following ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-amber-500 hover:bg-amber-400 text-black'}`}
                onClick={handleFollowToggle}
              >
                {following ? '✓ Following' : '+ Follow'}
              </button>
              <span className="text-slate-400 text-sm">{followerCount.toLocaleString()} followers</span>
            </div>
          )}

          {/* Host dashboard embedded below the player for the host */}
          {isHost && (
            <StreamDashboard hostId={user.id} hostName={user.username} />
          )}
        </div>

        {/* Right: chat */}
        <div className="h-[600px] lg:h-auto">
          <StreamChat
            streamId={stream.id}
            currentUserId={user?.id}
            currentUsername={user?.username}
            isHost={isHost}
            isModerator={userIsMod}
          />
        </div>
      </div>

      {/* Description */}
      {stream.description && (
        <div className="mt-6 bg-slate-800 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-2">About this stream</h2>
          <p className="text-slate-300 text-sm whitespace-pre-wrap">{stream.description}</p>
        </div>
      )}
    </div>
  )
}
