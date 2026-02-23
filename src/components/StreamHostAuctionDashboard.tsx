// src/components/StreamHostAuctionDashboard.tsx
// Host control panel: start/end auctions, manage items, flash drops, view stats

import { useState, useEffect, useCallback } from 'react'
import { LiveAuction, AuctionItem, FlashDrop, StreamSession } from '../types'
import {
  startAuction,
  endAuction,
  createAuctionItem,
  getAuctionItems,
  getAuctionsBySession,
  getActiveAuction,
  createFlashDrop,
  getActiveFlashDrops,
  endStream,
  getMinBid,
} from '../services/liveAuctionService'
import {
  emitAuctionStarted,
  emitAuctionEnded,
  emitFlashDrop,
} from '../services/streamBiddingService'

interface StreamHostAuctionDashboardProps {
  session: StreamSession
  onSessionEnd: () => void
  onActiveAuctionChange: (auction: LiveAuction | null) => void
}

export default function StreamHostAuctionDashboard({
  session,
  onSessionEnd,
  onActiveAuctionChange,
}: StreamHostAuctionDashboardProps) {
  const [activeAuction, setActiveAuction] = useState<LiveAuction | null>(null)
  const [pastAuctions, setPastAuctions] = useState<LiveAuction[]>([])
  const [items, setItems] = useState<AuctionItem[]>([])
  const [flashDrops, setFlashDrops] = useState<FlashDrop[]>([])
  const [tab, setTab] = useState<'auction' | 'items' | 'flash' | 'stats'>('auction')

  // New item form
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemDesc, setNewItemDesc] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')

  // Flash drop form
  const [flashTitle, setFlashTitle] = useState('')
  const [flashPrice, setFlashPrice] = useState('')
  const [flashQty, setFlashQty] = useState('1')
  const [flashDuration, setFlashDuration] = useState('60')

  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    const active = getActiveAuction(session.id)
    setActiveAuction(active)
    onActiveAuctionChange(active)
    setPastAuctions(getAuctionsBySession(session.id).filter(a => a.status !== 'active'))
    setItems(getAuctionItems(session.host_id))
    setFlashDrops(getActiveFlashDrops(session.id))
  }, [session, onActiveAuctionChange])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 2000)
    return () => clearInterval(interval)
  }, [refresh])

  const handleStartAuction = (item: AuctionItem) => {
    setError(null)
    try {
      const auction = startAuction(session.id, session.host_id, item)
      emitAuctionStarted(auction)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start auction')
    }
  }

  const handleEndAuction = () => {
    if (!activeAuction) return
    setError(null)
    try {
      const ended = endAuction(activeAuction.id)
      emitAuctionEnded(ended)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end auction')
    }
  }

  const handleEndStream = () => {
    if (!confirm('End the stream? All active auctions will be closed.')) return
    endStream(session.id)
    onSessionEnd()
  }

  const handleAddItem = () => {
    if (!newItemTitle || !newItemPrice) return
    setError(null)
    try {
      createAuctionItem(session.host_id, newItemTitle, newItemDesc, parseFloat(newItemPrice))
      setNewItemTitle('')
      setNewItemDesc('')
      setNewItemPrice('')
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
    }
  }

  const handleCreateFlashDrop = () => {
    if (!flashTitle || !flashPrice || !flashQty) return
    setError(null)
    try {
      const drop = createFlashDrop(
        session.id,
        flashTitle,
        parseFloat(flashPrice),
        parseInt(flashQty),
        parseInt(flashDuration),
      )
      emitFlashDrop(session.id, drop.item_title, drop.price, drop.quantity)
      setFlashTitle('')
      setFlashPrice('')
      setFlashQty('1')
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flash drop')
    }
  }

  const totalBids = pastAuctions.reduce((sum, a) => sum + a.bid_count, 0) + (activeAuction?.bid_count ?? 0)
  const totalRevenue = pastAuctions
    .filter(a => a.status === 'sold')
    .reduce((sum, a) => sum + (a.final_price ?? 0), 0)

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-700 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white">Host Dashboard</h2>
          <p className="text-slate-400 text-xs truncate">{session.title}</p>
        </div>
        <button
          onClick={handleEndStream}
          className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-sm rounded-lg font-medium transition"
        >
          End Stream
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-slate-700">
        {(['auction', 'items', 'flash', 'stats'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium capitalize transition ${
              tab === t
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'auction' ? '🔨 Auction' : t === 'items' ? '📦 Items' : t === 'flash' ? '⚡ Flash' : '📊 Stats'}
          </button>
        ))}
      </div>

      {error && (
        <div className="mx-4 mt-3 px-3 py-2 bg-red-800/50 text-red-200 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Auction tab */}
      {tab === 'auction' && (
        <div className="p-4">
          {activeAuction ? (
            <div>
              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white truncate">{activeAuction.item_title}</h3>
                  <span className="bg-green-600 text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                    LIVE
                  </span>
                </div>
                <p className="text-amber-400 font-bold text-2xl mb-1">
                  {activeAuction.current_bid > 0
                    ? `${activeAuction.current_bid} tokens`
                    : `Start: ${activeAuction.starting_price} tokens`}
                </p>
                {activeAuction.current_bidder_name && (
                  <p className="text-slate-300 text-sm">Highest: {activeAuction.current_bidder_name}</p>
                )}
                <div className="flex gap-4 mt-2 text-slate-400 text-xs">
                  <span>🏷 {activeAuction.bid_count} bids</span>
                  <span>Next min: {getMinBid(activeAuction)} tokens</span>
                </div>
              </div>
              <button
                onClick={handleEndAuction}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition"
              >
                🔨 Close Auction
              </button>
            </div>
          ) : (
            <div>
              <p className="text-slate-400 text-sm mb-3">
                No active auction. Select an item below to start one.
              </p>
              {items.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">
                  No items yet — add items in the Items tab.
                </p>
              ) : (
                <div className="space-y-2">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-slate-700 rounded-lg px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{item.title}</p>
                        <p className="text-slate-400 text-xs">{item.starting_price} tokens start</p>
                      </div>
                      <button
                        onClick={() => handleStartAuction(item)}
                        className="ml-3 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg font-medium transition shrink-0"
                      >
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Items tab */}
      {tab === 'items' && (
        <div className="p-4">
          <h3 className="text-white font-semibold mb-3">Add Auction Item</h3>
          <div className="space-y-2 mb-4">
            <input
              type="text"
              value={newItemTitle}
              onChange={e => setNewItemTitle(e.target.value)}
              placeholder="Item title"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={newItemDesc}
              onChange={e => setNewItemDesc(e.target.value)}
              placeholder="Description"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={newItemPrice}
                onChange={e => setNewItemPrice(e.target.value)}
                placeholder="Starting price"
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleAddItem}
                disabled={!newItemTitle || !newItemPrice}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white text-sm font-medium rounded-lg transition"
              >
                Add
              </button>
            </div>
          </div>
          <div className="space-y-1">
            {items.map(item => (
              <div key={item.id} className="flex justify-between bg-slate-700 rounded px-3 py-2 text-sm">
                <span className="text-white truncate">{item.title}</span>
                <span className="text-amber-400 shrink-0 ml-2">{item.starting_price} t</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flash drops tab */}
      {tab === 'flash' && (
        <div className="p-4">
          <h3 className="text-white font-semibold mb-3">Create Flash Drop</h3>
          <div className="space-y-2 mb-4">
            <input
              type="text"
              value={flashTitle}
              onChange={e => setFlashTitle(e.target.value)}
              placeholder="Item name"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={flashPrice}
                onChange={e => setFlashPrice(e.target.value)}
                placeholder="Price (tokens)"
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              />
              <input
                type="number"
                value={flashQty}
                onChange={e => setFlashQty(e.target.value)}
                placeholder="Qty"
                className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={flashDuration}
                onChange={e => setFlashDuration(e.target.value)}
                placeholder="Duration (sec)"
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              />
              <span className="text-slate-400 text-sm">sec</span>
            </div>
            <button
              onClick={handleCreateFlashDrop}
              disabled={!flashTitle || !flashPrice}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white text-sm font-medium rounded-lg transition"
            >
              ⚡ Launch Flash Drop
            </button>
          </div>
          <div className="space-y-2">
            {flashDrops.map(drop => (
              <div key={drop.id} className="bg-amber-900/30 border border-amber-700/50 rounded-lg px-3 py-2">
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm font-medium">{drop.item_title}</span>
                  <span className="text-amber-400 text-sm font-bold">{drop.price} t</span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">
                  {drop.remaining}/{drop.quantity} remaining · expires{' '}
                  {new Date(drop.expires_at).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats tab */}
      {tab === 'stats' && (
        <div className="p-4">
          <h3 className="text-white font-semibold mb-4">Stream Statistics</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-700 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-amber-400">{session.viewer_count}</p>
              <p className="text-slate-400 text-xs mt-1">Viewers</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-amber-400">
                {pastAuctions.length + (activeAuction ? 1 : 0)}
              </p>
              <p className="text-slate-400 text-xs mt-1">Auctions</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-amber-400">{totalBids}</p>
              <p className="text-slate-400 text-xs mt-1">Total Bids</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-amber-400">{totalRevenue}</p>
              <p className="text-slate-400 text-xs mt-1">Tokens Earned</p>
            </div>
          </div>
          <h4 className="text-slate-300 text-sm font-medium mb-2">Past Auctions</h4>
          <div className="space-y-1">
            {pastAuctions.map(a => (
              <div key={a.id} className="flex justify-between bg-slate-700 rounded px-3 py-2 text-sm">
                <span className="text-white truncate">{a.item_title}</span>
                <span className={a.status === 'sold' ? 'text-amber-400' : 'text-slate-500'}>
                  {a.status === 'sold' ? `${a.final_price} t` : 'No bids'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
