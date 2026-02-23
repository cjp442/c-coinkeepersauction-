// src/components/StreamDashboard.tsx
// Host-side stream dashboard: go live, viewer stats, earnings, schedules, mods

import { useEffect, useState, useCallback } from 'react'
import { LiveStream, StreamSchedule, StreamVOD, StreamStats } from '../types'
import {
  createStream,
  goLive,
  endStream,
  getHostStreams,
  getStreamTips,
  subscribeToViewerCount,
  addModerator,
  removeModerator,
  getStreamModerators,
  scheduleStream,
  getStreamSchedules,
  deleteSchedule,
  getHostVODs,
  raidStream,
  getLiveStreams,
} from '../services/streamingService'

interface StreamDashboardProps {
  hostId: string
  hostName: string
}

type DashboardTab = 'live' | 'schedule' | 'vods' | 'moderators'

export default function StreamDashboard({ hostId, hostName }: StreamDashboardProps) {
  const [tab, setTab] = useState<DashboardTab>('live')
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null)
  const [streams, setStreams] = useState<LiveStream[]>([])
  const [stats, setStats] = useState<StreamStats>({ viewer_count: 0, peak_viewer_count: 0, total_tips: 0, duration_seconds: 0 })
  const [schedules, setSchedules] = useState<StreamSchedule[]>([])
  const [vods, setVods] = useState<StreamVOD[]>([])
  const [moderators, setModerators] = useState<string[]>([])
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])

  // Form fields
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [recordingEnabled, setRecordingEnabled] = useState(false)
  const [schedTitle, setSchedTitle] = useState('')
  const [schedDesc, setSchedDesc] = useState('')
  const [schedDate, setSchedDate] = useState('')
  const [modUsername, setModUsername] = useState('')
  const [raidTarget, setRaidTarget] = useState('')

  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsed, setElapsed] = useState(0)

  // Load host streams, schedules, VODs on mount
  useEffect(() => {
    getHostStreams(hostId).then((s) => {
      setStreams(s)
      const live = s.find((x) => x.is_live)
      if (live) setActiveStream(live)
    })
    getStreamSchedules(hostId).then(setSchedules)
    getHostVODs(hostId).then(setVods)
    getLiveStreams().then(setLiveStreams)
  }, [hostId])

  // Load stats & mods when active stream changes
  useEffect(() => {
    if (!activeStream) return
    getStreamTips(activeStream.id).then((tips) => {
      const total = tips.reduce((acc, t) => acc + t.amount, 0)
      setStats((prev) => ({ ...prev, total_tips: total }))
    })
    getStreamModerators(activeStream.id).then(setModerators)
  }, [activeStream])

  // Live viewer count subscription
  useEffect(() => {
    if (!activeStream?.id) return
    const unsub = subscribeToViewerCount(activeStream.id, (count) => {
      setStats((prev) => ({
        ...prev,
        viewer_count: count,
        peak_viewer_count: Math.max(prev.peak_viewer_count, count),
      }))
    })
    return unsub
  }, [activeStream?.id])

  // Elapsed time ticker
  useEffect(() => {
    if (!startTime) { setElapsed(0); return }
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleCreateAndGoLive = useCallback(async () => {
    if (!newTitle.trim()) { setError('Please enter a stream title.'); return }
    setCreating(true)
    setError(null)
    try {
      const stream = await createStream(hostId, newTitle.trim(), newDescription.trim(), undefined, recordingEnabled)
      if (!stream) throw new Error('Failed to create stream.')
      await goLive(stream.id)
      setActiveStream({ ...stream, is_live: true })
      setStartTime(new Date())
      setStreams((prev) => [{ ...stream, is_live: true }, ...prev])
      setNewTitle('')
      setNewDescription('')
    } catch (err: any) {
      setError(err.message ?? 'Failed to start stream.')
    } finally {
      setCreating(false)
    }
  }, [hostId, newTitle, newDescription, recordingEnabled])

  const handleEndStream = useCallback(async () => {
    if (!activeStream) return
    await endStream(activeStream.id)
    setActiveStream(null)
    setStartTime(null)
    setElapsed(0)
    setStats({ viewer_count: 0, peak_viewer_count: 0, total_tips: 0, duration_seconds: 0 })
    getHostStreams(hostId).then(setStreams)
    getHostVODs(hostId).then(setVods)
  }, [activeStream, hostId])

  const handleAddModerator = useCallback(async () => {
    if (!activeStream || !modUsername.trim()) return
    await addModerator(activeStream.id, modUsername.trim())
    setModerators((prev) => [...prev, modUsername.trim()])
    setModUsername('')
  }, [activeStream, modUsername])

  const handleRemoveModerator = useCallback(async (userId: string) => {
    if (!activeStream) return
    await removeModerator(activeStream.id, userId)
    setModerators((prev) => prev.filter((m) => m !== userId))
  }, [activeStream])

  const handleSchedule = useCallback(async () => {
    if (!schedTitle.trim() || !schedDate) { setError('Please fill in title and date.'); return }
    setError(null)
    const result = await scheduleStream(hostId, schedTitle.trim(), new Date(schedDate).toISOString(), schedDesc || undefined)
    if (result) {
      setSchedules((prev) => [...prev, result])
      setSchedTitle('')
      setSchedDesc('')
      setSchedDate('')
    }
  }, [hostId, schedTitle, schedDesc, schedDate])

  const handleDeleteSchedule = useCallback(async (id: string) => {
    await deleteSchedule(id)
    setSchedules((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const handleRaid = useCallback(async () => {
    if (!activeStream || !raidTarget) return
    await raidStream(activeStream.id, raidTarget)
    setRaidTarget('')
    await handleEndStream()
  }, [activeStream, raidTarget, handleEndStream])

  const TABS: { key: DashboardTab; label: string }[] = [
    { key: 'live', label: '🔴 Live' },
    { key: 'schedule', label: '📅 Schedule' },
    { key: 'vods', label: '🎬 VODs' },
    { key: 'moderators', label: '🛡 Mods' },
  ]

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-slate-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`flex-1 text-sm py-3 font-medium transition-colors ${tab === t.key ? 'text-white border-b-2 border-amber-500' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* ── LIVE TAB ── */}
        {tab === 'live' && (
          <div className="space-y-4">
            {activeStream ? (
              <>
                {/* Stream stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: '👁 Viewers', value: stats.viewer_count.toLocaleString() },
                    { label: '📈 Peak', value: stats.peak_viewer_count.toLocaleString() },
                    { label: '💰 Tips', value: `${stats.total_tips} coins` },
                    { label: '⏱ Duration', value: formatDuration(elapsed) },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-800 rounded-lg p-3 text-center">
                      <div className="text-xs text-slate-400 mb-1">{s.label}</div>
                      <div className="text-white font-bold text-lg">{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Stream info */}
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-sm text-slate-400 mb-1">Stream title</p>
                  <p className="text-white font-semibold">{activeStream.title}</p>
                  {activeStream.stream_key && (
                    <>
                      <p className="text-sm text-slate-400 mt-2 mb-1">Stream key</p>
                      <code className="text-xs text-amber-400 break-all">{activeStream.stream_key}</code>
                    </>
                  )}
                </div>

                {/* Raid another stream */}
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-sm text-slate-300 font-semibold mb-2">🚀 Raid another stream</p>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 text-sm bg-slate-700 text-white border border-slate-600 rounded px-2 py-1"
                      value={raidTarget}
                      onChange={(e) => setRaidTarget(e.target.value)}
                      aria-label="Select raid target stream"
                    >
                      <option value="">Select a live stream…</option>
                      {liveStreams
                        .filter((s) => s.id !== activeStream.id)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.host_name} — {s.title} ({s.viewer_count ?? 0} viewers)
                          </option>
                        ))}
                    </select>
                    <button
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-3 py-1 rounded disabled:opacity-50"
                      onClick={handleRaid}
                      disabled={!raidTarget}
                    >
                      Raid
                    </button>
                  </div>
                </div>

                {/* End stream */}
                <button
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg"
                  onClick={handleEndStream}
                >
                  ⏹ End Stream
                </button>
              </>
            ) : (
              /* Start stream form */
              <div className="space-y-3">
                <h3 className="text-white font-semibold">Start a Live Stream</h3>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <input
                  type="text"
                  placeholder="Stream title *"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  className="w-full text-sm bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 resize-none"
                />
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recordingEnabled}
                    onChange={(e) => setRecordingEnabled(e.target.checked)}
                    className="accent-amber-500"
                  />
                  Enable stream recording (VOD)
                </label>
                <button
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                  onClick={handleCreateAndGoLive}
                  disabled={creating}
                >
                  {creating ? 'Starting…' : '🔴 Go Live'}
                </button>

                {/* Recent streams */}
                {streams.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs mb-2 mt-4">Recent streams</p>
                    <ul className="space-y-1">
                      {streams.slice(0, 5).map((s) => (
                        <li key={s.id} className="text-xs text-slate-300 flex justify-between">
                          <span>{s.title}</span>
                          <span className={`font-semibold ${s.is_live ? 'text-red-400' : 'text-slate-500'}`}>
                            {s.is_live ? 'LIVE' : 'Ended'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SCHEDULE TAB ── */}
        {tab === 'schedule' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Schedule a Broadcast</h3>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <input
              type="text"
              placeholder="Stream title *"
              value={schedTitle}
              onChange={(e) => setSchedTitle(e.target.value)}
              className="w-full text-sm bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={schedDesc}
              onChange={(e) => setSchedDesc(e.target.value)}
              className="w-full text-sm bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
            />
            <input
              type="datetime-local"
              value={schedDate}
              onChange={(e) => setSchedDate(e.target.value)}
              className="w-full text-sm bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
              aria-label="Scheduled broadcast date and time"
            />
            <button
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 rounded-lg"
              onClick={handleSchedule}
            >
              📅 Schedule Stream
            </button>

            {schedules.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No upcoming schedules.</p>
            ) : (
              <ul className="space-y-2">
                {schedules.map((s) => (
                  <li key={s.id} className="bg-slate-800 rounded-lg p-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-white text-sm font-semibold">{s.title}</p>
                      {s.description && <p className="text-slate-400 text-xs">{s.description}</p>}
                      <p className="text-amber-400 text-xs mt-1">
                        {new Date(s.scheduled_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      className="text-red-400 hover:text-red-300 text-xs shrink-0"
                      onClick={() => handleDeleteSchedule(s.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── VODs TAB ── */}
        {tab === 'vods' && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold">VOD Recordings</h3>
            {vods.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">
                No recordings yet. Enable recording when going live.
              </p>
            ) : (
              <ul className="space-y-3">
                {vods.map((v) => (
                  <li key={v.id} className="bg-slate-800 rounded-lg p-3 flex gap-3">
                    {v.thumbnail_url && (
                      <img src={v.thumbnail_url} alt="" className="w-20 h-14 object-cover rounded shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{v.title}</p>
                      <p className="text-slate-400 text-xs">
                        {Math.floor(v.duration / 60)}m {v.duration % 60}s · {v.views.toLocaleString()} views
                      </p>
                      <a
                        href={v.recording_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 text-xs hover:underline"
                      >
                        Watch replay ↗
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── MODERATORS TAB ── */}
        {tab === 'moderators' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Moderators</h3>
            {!activeStream && (
              <p className="text-slate-500 text-sm">Start a live stream to manage moderators.</p>
            )}
            {activeStream && (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="User ID to add as mod"
                    value={modUsername}
                    onChange={(e) => setModUsername(e.target.value)}
                    className="flex-1 text-sm bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-3 py-2 rounded-lg"
                    onClick={handleAddModerator}
                  >
                    Add
                  </button>
                </div>
                {moderators.length === 0 ? (
                  <p className="text-slate-500 text-sm">No moderators yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {moderators.map((userId) => (
                      <li key={userId} className="flex items-center justify-between bg-slate-800 rounded px-3 py-2 text-sm">
                        <span className="text-slate-300 font-mono text-xs">{userId}</span>
                        <button
                          className="text-red-400 hover:text-red-300 text-xs"
                          onClick={() => handleRemoveModerator(userId)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
