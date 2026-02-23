import { useEffect, useRef, useState } from 'react'
import { Coins } from 'lucide-react'

interface CoinDisplayProps {
  balance: number
  loading?: boolean
}

export default function CoinDisplay({ balance, loading = false }: CoinDisplayProps) {
  const [displayed, setDisplayed] = useState(balance)
  const [animating, setAnimating] = useState(false)
  const prevRef = useRef(balance)

  useEffect(() => {
    if (balance === prevRef.current) return
    setAnimating(true)
    const timeout = setTimeout(() => setAnimating(false), 600)
    prevRef.current = balance
    setDisplayed(balance)
    return () => clearTimeout(timeout)
  }, [balance])

  return (
    <div className="flex items-center gap-1.5 bg-slate-900/80 border border-amber-500/30 rounded-lg px-3 py-1.5 pointer-events-auto">
      <Coins className="w-4 h-4 text-amber-400 shrink-0" />
      {loading ? (
        <span className="w-12 h-4 bg-slate-700 animate-pulse rounded" />
      ) : (
        <span
          className={`text-sm font-semibold tabular-nums transition-colors duration-300 ${
            animating ? 'text-amber-300' : 'text-amber-400'
          }`}
        >
          {displayed.toLocaleString()}
        </span>
      )}
    </div>
  )
}
