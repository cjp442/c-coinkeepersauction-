import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Gavel, Zap, Trophy, PlayCircle, StopCircle, AlertTriangle, Clock } from 'lucide-react'
import { AuctionHistoryEntry } from '../types'
import { getAuctionHistory } from '../services/auctionService'
import { subscribeToBids } from '../services/auctionService'

const EVENT_ICON: Record<AuctionHistoryEntry['event_type'], React.ReactNode> = {
  bid: <Gavel size={14} className="text-amber-400" />,
  outbid: <Gavel size={14} className="text-red-400" />,
  reserve_met: <Trophy size={14} className="text-green-400" />,
  started: <PlayCircle size={14} className="text-blue-400" />,
  ended: <StopCircle size={14} className="text-slate-400" />,
  cancelled: <AlertTriangle size={14} className="text-red-500" />,
  extended: <Clock size={14} className="text-purple-400" />,
}

interface AuctionHistoryProps {
  auctionId: string
  maxItems?: number
}

export default function AuctionHistory({ auctionId, maxItems }: AuctionHistoryProps) {
  const [entries, setEntries] = useState<AuctionHistoryEntry[]>(() =>
    getAuctionHistory(auctionId),
  )

  // Refresh when a new bid arrives
  useEffect(() => {
    const unsub = subscribeToBids(auctionId, () => {
      setEntries(getAuctionHistory(auctionId))
    })
    return unsub
  }, [auctionId])

  const displayed = maxItems ? entries.slice(0, maxItems) : entries

  if (displayed.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <Gavel size={24} className="mx-auto mb-2 text-slate-500" />
        <p className="text-slate-500 text-sm">No activity yet</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-white">Bid History</h3>
      </div>
      <ul className="divide-y divide-slate-700">
        {displayed.map((entry) => (
          <li key={entry.id} className="px-4 py-3 flex items-start gap-3">
            <span className="mt-0.5 shrink-0">{EVENT_ICON[entry.event_type] ?? <Zap size={14} />}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">{entry.description}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
              </p>
            </div>
            {entry.amount !== undefined && (
              <span className="text-amber-400 font-semibold text-sm shrink-0">
                {entry.amount.toLocaleString()} tkn
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
