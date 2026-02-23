// src/components/StreamPlayer.tsx
// HLS stream player with quality switching, viewer count, and tip button

import { useEffect, useRef, useState, useCallback } from 'react'
import { LiveStream, StreamQuality, StreamTip } from '../types'
import { joinStream, leaveStream, subscribeToViewerCount, sendTip, subscribeToTips } from '../services/streamingService'

interface StreamPlayerProps {
  stream: LiveStream
  currentUserId?: string
  currentUsername?: string
  coinBalance?: number
  onBalanceChange?: () => void
}

const QUALITY_LABELS: Record<StreamQuality, string> = {
  auto: 'Auto',
  '720p': '720p',
  '1080p': '1080p',
}

export default function StreamPlayer({
  stream,
  currentUserId,
  currentUsername,
  coinBalance = 0,
  onBalanceChange,
}: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [viewerCount, setViewerCount] = useState<number>(stream.viewer_count ?? 0)
  const [quality, setQuality] = useState<StreamQuality>('auto')
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [tipAmount, setTipAmount] = useState(10)
  const [tipMessage, setTipMessage] = useState('')
  const [showTipPanel, setShowTipPanel] = useState(false)
  const [tipSending, setTipSending] = useState(false)
  const [tipError, setTipError] = useState<string | null>(null)
  const [recentTips, setRecentTips] = useState<StreamTip[]>([])
  const [streamAlert, setStreamAlert] = useState<string | null>(null)

  // Join/leave stream for viewer count
  useEffect(() => {
    if (!stream.id || stream.status !== 'live') return
    joinStream(stream.id)
    return () => {
      leaveStream(stream.id)
    }
  }, [stream.id, stream.status])

  // Subscribe to live viewer count updates
  useEffect(() => {
    if (!stream.id) return
    const unsub = subscribeToViewerCount(stream.id, setViewerCount)
    return unsub
  }, [stream.id])

  // Subscribe to tips for stream alerts
  useEffect(() => {
    if (!stream.id) return
    const unsub = subscribeToTips(stream.id, (tip) => {
      setRecentTips((prev) => [tip, ...prev].slice(0, 5))
      setStreamAlert(`💰 ${tip.tipper_username} tipped ${tip.amount} coins!${tip.message ? ` "${tip.message}"` : ''}`)
      setTimeout(() => setStreamAlert(null), 5000)
    })
    return unsub
  }, [stream.id])

  // Load HLS stream into the video element
  useEffect(() => {
    const video = videoRef.current
    if (!video || !stream.hls_url) return

    // Native HLS (Safari) or fallback src assignment
    video.src = stream.hls_url
    video.load()
  }, [stream.hls_url, quality])

  const handleSendTip = useCallback(async () => {
    if (!currentUserId || !currentUsername) return
    if (tipAmount <= 0) return
    if (coinBalance < tipAmount) {
      setTipError('Insufficient coin balance.')
      return
    }
    setTipSending(true)
    setTipError(null)
    try {
      await sendTip(stream.id, currentUserId, currentUsername, tipAmount, tipMessage || undefined)
      setTipMessage('')
      setShowTipPanel(false)
      onBalanceChange?.()
    } catch (err: any) {
      setTipError(err.message ?? 'Failed to send tip.')
    } finally {
      setTipSending(false)
    }
  }, [currentUserId, currentUsername, coinBalance, tipAmount, tipMessage, stream.id, onBalanceChange])

  return (
    <div className="relative bg-black rounded-xl overflow-hidden">
      {/* Video element */}
      <div className="relative aspect-video w-full bg-slate-900">
        {stream.status === 'live' && stream.hls_url ? (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            autoPlay
            playsInline
            controls
            aria-label={`Live stream: ${stream.title}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 gap-3">
            {stream.thumbnail_url ? (
              <img src={stream.thumbnail_url} alt="Stream thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            ) : null}
            <span className="text-5xl">📺</span>
            <span className="text-lg font-semibold z-10">Stream is offline</span>
          </div>
        )}

        {/* LIVE badge + viewer count overlay */}
        {stream.status === 'live' && (
          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded uppercase animate-pulse">
              LIVE
            </span>
            <span className="bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
              👁 {viewerCount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Quality switcher */}
        <div className="absolute top-3 right-3 z-10">
          <button
            className="bg-black/70 text-white text-xs px-2 py-1 rounded hover:bg-black/90"
            onClick={() => setShowQualityMenu((v) => !v)}
            aria-label="Change stream quality"
          >
            ⚙ {QUALITY_LABELS[quality]}
          </button>
          {showQualityMenu && (
            <div className="absolute right-0 mt-1 bg-slate-800 rounded shadow-lg overflow-hidden text-sm">
              {(Object.keys(QUALITY_LABELS) as StreamQuality[]).map((q) => (
                <button
                  key={q}
                  className={`block w-full text-left px-4 py-2 hover:bg-slate-700 ${quality === q ? 'text-amber-400 font-bold' : 'text-white'}`}
                  onClick={() => { setQuality(q); setShowQualityMenu(false) }}
                >
                  {QUALITY_LABELS[q]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stream alert overlay (tips, followers, etc.) */}
        {streamAlert && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-amber-500/90 text-black font-bold text-sm px-4 py-2 rounded-full shadow-lg animate-bounce z-10">
            {streamAlert}
          </div>
        )}
      </div>

      {/* Stream info bar */}
      <div className="bg-slate-900 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-white font-bold text-lg leading-tight">{stream.title}</h2>
          <p className="text-slate-400 text-sm">{stream.host_name}</p>
        </div>
        {/* Tip button (only for logged-in viewers) */}
        {currentUserId && stream.status === 'live' && (
          <button
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm px-4 py-2 rounded-lg shrink-0"
            onClick={() => setShowTipPanel((v) => !v)}
          >
            💰 Send Tip
          </button>
        )}
      </div>

      {/* Tip panel */}
      {showTipPanel && (
        <div className="bg-slate-800 border-t border-slate-700 px-4 py-4">
          <h3 className="text-white font-semibold mb-3">Send a Tip</h3>
          <p className="text-slate-400 text-xs mb-3">Balance: {coinBalance.toLocaleString()} coins</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {[10, 50, 100, 500].map((preset) => (
              <button
                key={preset}
                className={`text-xs px-3 py-1.5 rounded-full border ${tipAmount === preset ? 'bg-amber-500 border-amber-500 text-black font-bold' : 'border-slate-600 text-slate-300 hover:border-amber-500'}`}
                onClick={() => setTipAmount(preset)}
              >
                {preset}
              </button>
            ))}
            <input
              type="number"
              min={1}
              value={tipAmount}
              onChange={(e) => setTipAmount(Math.max(1, Number(e.target.value)))}
              className="w-20 text-xs bg-slate-700 text-white border border-slate-600 rounded px-2 py-1"
              aria-label="Custom tip amount"
            />
          </div>
          <input
            type="text"
            placeholder="Optional message..."
            maxLength={100}
            value={tipMessage}
            onChange={(e) => setTipMessage(e.target.value)}
            className="w-full text-sm bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 mb-3"
          />
          {tipError && <p className="text-red-400 text-xs mb-2">{tipError}</p>}
          <div className="flex gap-2">
            <button
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm px-4 py-2 rounded-lg disabled:opacity-50"
              onClick={handleSendTip}
              disabled={tipSending}
            >
              {tipSending ? 'Sending…' : `Tip ${tipAmount} coins`}
            </button>
            <button
              className="text-slate-400 text-sm hover:text-white"
              onClick={() => setShowTipPanel(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Recent tips feed */}
      {recentTips.length > 0 && (
        <div className="bg-slate-900 border-t border-slate-700 px-4 py-2">
          <p className="text-slate-500 text-xs mb-1">Recent tips</p>
          <ul className="space-y-0.5">
            {recentTips.map((t) => (
              <li key={t.id} className="text-xs text-amber-400">
                💰 <strong>{t.tipper_username}</strong> tipped {t.amount} coins
                {t.message ? <span className="text-slate-400"> — {t.message}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
