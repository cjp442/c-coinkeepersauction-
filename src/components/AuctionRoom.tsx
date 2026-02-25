import { useState, useEffect, useRef } from 'react'
import { useTokens } from '../contexts/TokenContext'
import { useAuth } from '../contexts/AuthContext'

interface Bid {
  userId: string
  username: string
  amount: number
  timestamp: string
}

interface AuctionRoomProps {
  auctionId?: string
  title?: string
  startingBid?: number
}

const AuctionRoom: React.FC<AuctionRoomProps> = ({
  auctionId = 'demo-auction',
  title = '1 oz Gold Eagle Coin',
  startingBid = 100,
}) => {
  const { user } = useAuth()
  const { tokens, deductTokens, addTokens } = useTokens()

  const [bids, setBids] = useState<Bid[]>([])
  const [currentBid, setCurrentBid] = useState(startingBid)
  const [bidInput, setBidInput] = useState(startingBid + 10)
  const [lockedAmount, setLockedAmount] = useState(0) // tokens locked for this user's active bid
  const [status, setStatus] = useState<'active' | 'ended'>('active')
  const [message, setMessage] = useState('')
  const [timeLeft, setTimeLeft] = useState(300) // 5-minute auction countdown
  const socketRef = useRef<WebSocket | null>(null)

  // Countdown timer → auto-settle when reaches 0
  useEffect(() => {
    if (status !== 'active') return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { settle(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [status])

  // WebSocket for real-time bid updates (replace URL via env var)
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL
    if (!wsUrl) return
    try {
      socketRef.current = new WebSocket(`${wsUrl}/auction/${auctionId}`)
      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'new_bid') {
          setBids(prev => [data.bid, ...prev])
          setCurrentBid(data.bid.amount)
        }
      }
    } catch { /* WebSocket unavailable in dev */ }
    return () => { socketRef.current?.close() }
  }, [auctionId])

  const handleBid = async () => {
    if (!user) { setMessage('Please log in to bid.'); return }
    if (status !== 'active') { setMessage('Auction has ended.'); return }
    if (bidInput <= currentBid) { setMessage(`Bid must be higher than ${currentBid} tokens.`); return }

    const available = (tokens?.balance ?? 0) + lockedAmount
    if (available < bidInput) {
      setMessage(`Insufficient tokens. You have ${tokens?.balance ?? 0} tokens available.`)
      return
    }

    // Release previously locked tokens for this user
    if (lockedAmount > 0) {
      await addTokens(lockedAmount, 'Bid lock released (outbid yourself)')
    }

    // Lock new bid amount
    await deductTokens(bidInput, `Bid lock — auction ${auctionId}`)
    setLockedAmount(bidInput)
    setCurrentBid(bidInput)

    const newBid: Bid = {
      userId: user.id,
      username: user.username,
      amount: bidInput,
      timestamp: new Date().toISOString(),
    }
    setBids(prev => [newBid, ...prev])
    setBidInput(bidInput + 10)
    setMessage(`Bid of ${bidInput} tokens placed! Tokens locked until outbid or auction ends.`)

    // Broadcast via WebSocket if connected
    socketRef.current?.send(JSON.stringify({ type: 'place_bid', bid: newBid }))
  }

  /** Settlement: winner keeps tokens deducted; losers receive refunds */
  const settle = async () => {
    setStatus('ended')
    if (bids.length === 0) {
      setMessage('Auction ended with no bids.')
      return
    }
    const winner = bids[0]
    if (user && winner.userId === user.id) {
      // Winner — tokens already deducted (payment complete)
      setMessage(`🎉 You won the auction for ${winner.amount} tokens! Item will be shipped to you.`)
      setLockedAmount(0)
    } else if (lockedAmount > 0) {
      // Current user was outbid — return locked tokens
      await addTokens(lockedAmount, `Auction refund — auction ${auctionId}`)
      setLockedAmount(0)
      setMessage(`Auction ended. ${winner.username} won with ${winner.amount} tokens. Your locked tokens have been refunded.`)
    } else {
      setMessage(`Auction ended. ${winner.username} won with ${winner.amount} tokens.`)
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-slate-800 rounded-lg p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-amber-400">{title}</h1>
            <p className="text-slate-400 text-sm mt-1">Auction #{auctionId}</p>
          </div>
          <span className={`px-3 py-1 rounded text-sm font-bold ${status === 'active' ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
            {status === 'active' ? `⏱ ${formatTime(timeLeft)}` : '🔒 Ended'}
          </span>
        </div>

        {/* Current bid */}
        <div className="bg-slate-700 rounded-lg p-4 mb-6 text-center">
          <p className="text-slate-400 text-sm mb-1">Current highest bid</p>
          <p className="text-3xl font-bold text-amber-400">{currentBid.toLocaleString()} tokens</p>
          {bids.length > 0 && <p className="text-slate-400 text-xs mt-1">by {bids[0].username}</p>}
        </div>

        {/* Token balance & locked info */}
        {user && (
          <div className="flex gap-4 mb-5 text-sm">
            <div className="bg-slate-700 rounded px-3 py-2 flex-1 text-center">
              <p className="text-slate-400">Available</p>
              <p className="font-bold text-white">{(tokens?.balance ?? 0).toLocaleString()} tokens</p>
            </div>
            {lockedAmount > 0 && (
              <div className="bg-amber-900 rounded px-3 py-2 flex-1 text-center">
                <p className="text-amber-400">Locked (your bid)</p>
                <p className="font-bold text-amber-300">{lockedAmount.toLocaleString()} tokens</p>
              </div>
            )}
          </div>
        )}

        {/* Bid input */}
        {status === 'active' && (
          <div className="flex gap-3 mb-4">
            <input
              type="number"
              value={bidInput}
              min={currentBid + 1}
              onChange={e => setBidInput(Number(e.target.value))}
              className="flex-1 bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              placeholder="Your bid in tokens"
            />
            <button
              onClick={handleBid}
              disabled={!user || (tokens?.balance ?? 0) + lockedAmount < bidInput}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded transition"
            >
              Place Bid
            </button>
          </div>
        )}

        {message && (
          <p className={`text-sm mb-4 ${message.startsWith('🎉') ? 'text-green-400' : message.includes('Insufficient') || message.includes('must be') ? 'text-red-400' : 'text-amber-300'}`}>
            {message}
          </p>
        )}

        <p className="text-xs text-slate-500 mb-5">
          Tokens are locked when you bid and automatically refunded if you are outbid. Winner's tokens are charged at auction close.
        </p>

        {/* Bid history */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 mb-3">Bid History</h2>
          {bids.length === 0 ? (
            <p className="text-slate-500 text-sm">No bids yet — be the first!</p>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {bids.map((bid, i) => (
                <li key={i} className="flex justify-between text-sm bg-slate-700 rounded px-3 py-2">
                  <span className="text-white font-medium">{bid.username}</span>
                  <span className="text-amber-400 font-bold">{bid.amount.toLocaleString()} tokens</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuctionRoom
