// src/pages/LiveStreamAuctionPage.tsx
// Main live stream auction page — combines stream overlay, bidding panel, host dashboard

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LiveAuction, StreamSession, FlashDrop, SellerRating } from '../types'
import {
  startStream,
  getStreamSessions,
  incrementViewerCount,
  getAuctionsBySession,
  getActiveAuction,
  getActiveFlashDrops,
  claimFlashDrop,
  getSellerRatings,
  getAverageRating,
  submitSellerRating,
  isNotifyRegistered,
  registerStreamNotify,
} from '../services/liveAuctionService'
import { subscribe, emitViewerJoined, BidEvent } from '../services/streamBiddingService'
import StreamAuctionOverlay from '../components/StreamAuctionOverlay'
import LiveBiddingPanel from '../components/LiveBiddingPanel'
import StreamHostAuctionDashboard from '../components/StreamHostAuctionDashboard'
import AuctionItemCard from '../components/AuctionItemCard'

// ─── Mock stream schedule data ────────────────────────────────────────────────

const MOCK_SCHEDULE = [
  {
    id: 'sched_1',
    host_id: 'host_1',
    host_name: 'CoinMaster Mike',
    title: 'Rare Silver Dollar Auction',
    scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    description: 'Rare Morgan and Peace silver dollars from my personal collection.',
  },
  {
    id: 'sched_2',
    host_id: 'host_2',
    host_name: 'GoldRush Gloria',
    title: 'Gold Bullion Blowout',
    scheduled_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    description: 'American Eagles, Maples, and gold bars. Prices start below spot!',
  },
  {
    id: 'sched_3',
    host_id: 'host_3',
    host_name: 'Ancient Coins Andy',
    title: 'Ancient Roman & Greek Coins',
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    description: 'Authenticated ancient coins from 300 BC to 400 AD.',
  },
]

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatScheduledTime(isoStr: string): string {
  const d = new Date(isoStr)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffH = Math.floor(diffMs / 3600000)
  const diffM = Math.floor((diffMs % 3600000) / 60000)
  if (diffH === 0) return `In ${diffM}m`
  return `In ${diffH}h ${diffM}m`
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LiveStreamAuctionPage() {
  const { user } = useAuth()
  const isHost = user?.role === 'host' || user?.role === 'admin'

  const [liveSession, setLiveSession] = useState<StreamSession | null>(null)
  const [activeAuction, setActiveAuction] = useState<LiveAuction | null>(null)
  const [pastAuctions, setPastAuctions] = useState<LiveAuction[]>([])
  const [flashDrops, setFlashDrops] = useState<FlashDrop[]>([])
  const [flashNotifications, setFlashNotifications] = useState<string[]>([])
  const [streamTitle, setStreamTitle] = useState('')
  const [activeTab, setActiveTab] = useState<'stream' | 'schedule' | 'ratings'>('stream')
  const [sellerRatings, setSellerRatings] = useState<SellerRating[]>([])
  const [ratingComment, setRatingComment] = useState('')
  const [ratingScore, setRatingScore] = useState(5)
  const [notifyHostId, setNotifyHostId] = useState<string | null>(null)
  const [viewerJoined, setViewerJoined] = useState(false)

  const refresh = useCallback(() => {
    // Reload live sessions from storage
    const sessions = getStreamSessions()
    const live = sessions.find(s => s.status === 'live') ?? null
    setLiveSession(live)

    if (live) {
      const active = getActiveAuction(live.id)
      setActiveAuction(active)
      setPastAuctions(getAuctionsBySession(live.id).filter(a => a.status !== 'active'))
      setFlashDrops(getActiveFlashDrops(live.id))
      if (live.host_id) setSellerRatings(getSellerRatings(live.host_id))
    }
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 2000)
    return () => clearInterval(interval)
  }, [refresh])

  // Subscribe to session-level events once we have a live session
  useEffect(() => {
    if (!liveSession) return

    const unsub = subscribe(liveSession.id, (event: BidEvent) => {
      if (event.type === 'flash_drop' && event.message) {
        setFlashNotifications(prev => [event.message!, ...prev].slice(0, 3))
        setTimeout(() => setFlashNotifications(prev => prev.slice(0, -1)), 8000)
      }
      if (event.type === 'auction_started' || event.type === 'auction_ended' || event.type === 'auction_sold') {
        refresh()
      }
    })

    // Increment viewer count once per page visit
    if (!viewerJoined) {
      incrementViewerCount(liveSession.id)
      emitViewerJoined(liveSession.id)
      setViewerJoined(true)
    }

    return unsub
  }, [liveSession, viewerJoined, refresh])

  const handleStartStream = () => {
    if (!user || !streamTitle) return
    const session = startStream(user.id, user.username, streamTitle)
    setLiveSession(session)
    setStreamTitle('')
  }

  const handleSessionEnd = () => {
    setLiveSession(null)
    setActiveAuction(null)
    refresh()
  }

  const handleClaimFlash = (dropId: string) => {
    try {
      claimFlashDrop(dropId)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not claim flash drop')
    }
  }

  const handleSubmitRating = () => {
    if (!liveSession || !user || !activeAuction) return
    submitSellerRating(
      liveSession.host_id,
      user.id,
      user.username,
      activeAuction.id,
      ratingScore,
      ratingComment,
    )
    setRatingComment('')
    refresh()
  }

  const handleNotifyToggle = (hostId: string) => {
    if (!user) return
    registerStreamNotify(user.id, hostId)
    setNotifyHostId(hostId)
    setTimeout(() => setNotifyHostId(null), 3000)
  }

  const avgRating = liveSession ? getAverageRating(liveSession.host_id) : 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Live Stream <span className="text-amber-500">Auctions</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Real-time bidding — auctions only happen during active live streams
          </p>
        </div>
        {liveSession && (
          <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-semibold text-sm">LIVE NOW</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-800 rounded-xl p-1 w-fit">
        {(['stream', 'schedule', 'ratings'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition ${
              activeTab === t
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t === 'stream' ? '📺 Stream' : t === 'schedule' ? '📅 Schedule' : '⭐ Ratings'}
          </button>
        ))}
      </div>

      {/* ─── STREAM TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'stream' && (
        <>
          {/* Flash drop notifications */}
          <div className="fixed top-20 right-4 z-50 space-y-2">
            {flashNotifications.map((msg, i) => (
              <div
                key={i}
                className="bg-amber-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-bounce max-w-xs"
              >
                {msg}
              </div>
            ))}
          </div>

          {liveSession ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Stream mock + overlay */}
              <div className="lg:col-span-2 space-y-4">
                {/* Stream mock screen */}
                <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-5xl mb-3">📺</p>
                    <p className="text-slate-300 font-semibold text-lg">{liveSession.title}</p>
                    <p className="text-slate-500 text-sm mt-1">by {liveSession.host_name}</p>
                    <p className="text-slate-600 text-xs mt-2">
                      Live stream video would appear here (Agora/Twilio)
                    </p>
                  </div>
                  <StreamAuctionOverlay
                    auction={activeAuction}
                    sessionTitle={liveSession.title}
                    viewerCount={liveSession.viewer_count}
                  />
                </div>

                {/* Host dashboard (visible to host/admin only) */}
                {isHost && (
                  <StreamHostAuctionDashboard
                    session={liveSession}
                    onSessionEnd={handleSessionEnd}
                    onActiveAuctionChange={setActiveAuction}
                  />
                )}

                {/* Past auctions during this stream */}
                {pastAuctions.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold mb-3">Past Auctions This Stream</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {pastAuctions.map(a => (
                        <AuctionItemCard key={a.id} auction={a} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Bidding panel + flash drops */}
              <div className="space-y-4">
                <LiveBiddingPanel
                  auction={activeAuction}
                  userId={user?.id ?? 'guest'}
                  userName={user?.username ?? 'Guest'}
                  onAuctionUpdate={updated => {
                    setActiveAuction(updated)
                    refresh()
                  }}
                />

                {/* Flash drops */}
                {flashDrops.length > 0 && (
                  <div className="bg-slate-800 rounded-xl overflow-hidden">
                    <div className="bg-amber-700 px-4 py-2">
                      <h3 className="font-bold text-white text-sm">⚡ Flash Drops</h3>
                    </div>
                    <div className="p-3 space-y-2">
                      {flashDrops.map(drop => (
                        <div
                          key={drop.id}
                          className="flex items-center justify-between bg-slate-700 rounded-lg px-3 py-2"
                        >
                          <div>
                            <p className="text-white text-sm font-medium">{drop.item_title}</p>
                            <p className="text-amber-400 text-xs">
                              {drop.price} tokens · {drop.remaining} left
                            </p>
                          </div>
                          <button
                            onClick={() => handleClaimFlash(drop.id)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition"
                          >
                            Claim
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-6xl mb-4">📡</p>
              <h2 className="text-2xl font-bold text-white mb-2">No Stream Live Right Now</h2>
              <p className="text-slate-400 mb-8">
                Auctions only happen during active live streams. Check the schedule below.
              </p>

              {/* Host: start stream */}
              {isHost && (
                <div className="max-w-sm mx-auto bg-slate-800 rounded-xl p-6 mb-8">
                  <h3 className="text-white font-semibold mb-3">Start Your Stream</h3>
                  <input
                    type="text"
                    value={streamTitle}
                    onChange={e => setStreamTitle(e.target.value)}
                    placeholder="Stream title…"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm mb-3 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleStartStream}
                    disabled={!streamTitle}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition"
                  >
                    🔴 Go Live
                  </button>
                </div>
              )}

              <p className="text-slate-500 text-sm">
                View the stream schedule to see when hosts go live.
              </p>
            </div>
          )}
        </>
      )}

      {/* ─── SCHEDULE TAB ────────────────────────────────────────────────── */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Upcoming Streams</h2>
          {MOCK_SCHEDULE.map(s => {
            const notified = user ? isNotifyRegistered(user.id, s.host_id) : false
            return (
              <div
                key={s.id}
                className="bg-slate-800 rounded-xl p-5 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">📺</span>
                    <div>
                      <h3 className="font-semibold text-white">{s.title}</h3>
                      <p className="text-slate-400 text-sm">by {s.host_name}</p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{s.description}</p>
                  <span className="text-amber-400 text-sm font-medium">
                    🕐 {formatScheduledTime(s.scheduled_at)}
                  </span>
                </div>
                <button
                  onClick={() => handleNotifyToggle(s.host_id)}
                  className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition ${
                    notified || notifyHostId === s.host_id
                      ? 'bg-green-700 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  {notified || notifyHostId === s.host_id ? '✓ Notified' : '🔔 Notify Me'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── RATINGS TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'ratings' && (
        <div className="max-w-2xl">
          {liveSession ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-slate-800 rounded-xl px-6 py-4 text-center">
                  <p className="text-4xl font-bold text-amber-400">{avgRating.toFixed(1)}</p>
                  <p className="text-slate-400 text-sm mt-1">Seller Rating</p>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={star <= Math.round(avgRating) ? 'text-amber-400' : 'text-slate-600'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold">{liveSession.host_name}</p>
                  <p className="text-slate-400 text-sm">{sellerRatings.length} reviews</p>
                </div>
              </div>

              {/* Submit rating */}
              {user && activeAuction && (
                <div className="bg-slate-800 rounded-xl p-4 mb-6">
                  <h3 className="text-white font-semibold mb-3">Leave a Review</h3>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRatingScore(star)}
                        className={`text-2xl transition ${star <= ratingScore ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                    placeholder="Share your experience…"
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleSubmitRating}
                    disabled={!ratingComment}
                    className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white text-sm font-medium rounded-lg transition"
                  >
                    Submit Review
                  </button>
                </div>
              )}

              {/* Existing ratings */}
              <div className="space-y-3">
                {sellerRatings.length === 0 && (
                  <p className="text-slate-400 text-sm">No reviews yet.</p>
                )}
                {sellerRatings.map(r => (
                  <div key={r.id} className="bg-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium text-sm">{r.reviewer_name}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className={star <= r.rating ? 'text-amber-400 text-sm' : 'text-slate-600 text-sm'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">{r.comment}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-3">⭐</p>
              <p>No active stream — ratings are submitted during live streams.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
