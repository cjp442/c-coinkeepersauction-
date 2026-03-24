import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTokens } from '../contexts/TokenContext'

const QUICK_ADD_AMOUNTS = [10, 50, 100, 500] as const

export default function TokenBar() {
  const { user } = useAuth()
  const { tokens, loading, addTokens, moveToSafe } = useTokens()
  const [expanded, setExpanded] = useState(false)
  const [safeMoveInput, setSafeMoveInput] = useState('')
  const [isMoving, setIsMoving] = useState(false)

  if (!user || loading || !tokens) return null

  const handleQuickAdd = async (amount: (typeof QUICK_ADD_AMOUNTS)[number]) => {
    try {
      await addTokens(amount, 'Quick purchase')
    } catch {
      // silently ignore — wallet may not be loaded yet
    }
  }

  const handleMoveToSafe = async () => {
    const amount = parseInt(safeMoveInput, 10)
    if (isNaN(amount) || amount <= 0 || amount > tokens.balance) return
    setIsMoving(true)
    try {
      await moveToSafe(amount)
      setSafeMoveInput('')
    } catch {
      // insufficient balance already guarded above
    } finally {
      setIsMoving(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Expanded panel */}
      {expanded && (
        <div className="w-72 bg-slate-900 border border-amber-700 rounded-lg shadow-2xl shadow-black/60 overflow-hidden">
          {/* Header */}
          <div className="bg-amber-800/60 px-4 py-2 border-b border-amber-700/50">
            <p className="text-amber-300 text-xs font-semibold tracking-widest uppercase">
              🪙 Keeper Coins Wallet
            </p>
          </div>

          <div className="p-4 space-y-4">
            {/* Balances */}
            <div className="flex gap-3">
              <div className="flex-1 bg-slate-800 rounded p-3 border border-slate-700">
                <p className="text-slate-400 text-xs mb-1">Balance</p>
                <p className="text-amber-400 text-xl font-bold">
                  🪙 {tokens.balance.toLocaleString()}
                </p>
              </div>
              <div className="flex-1 bg-slate-800 rounded p-3 border border-slate-700">
                <p className="text-slate-400 text-xs mb-1">Safe</p>
                <p className="text-emerald-400 text-xl font-bold">
                  🔒 {tokens.safe_balance.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Quick Add */}
            <div>
              <p className="text-slate-400 text-xs mb-2 uppercase tracking-wider">Quick Add</p>
              <div className="grid grid-cols-4 gap-1.5">
                {QUICK_ADD_AMOUNTS.map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleQuickAdd(amount)}
                    className="bg-amber-800/50 hover:bg-amber-700 border border-amber-700/50 hover:border-amber-500 text-amber-300 text-xs font-bold py-1.5 rounded transition-all"
                  >
                    +{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Move to Safe */}
            <div>
              <p className="text-slate-400 text-xs mb-2 uppercase tracking-wider">
                Move to Safe
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={tokens.balance}
                  value={safeMoveInput}
                  onChange={e => setSafeMoveInput(e.target.value)}
                  placeholder="Amount…"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-600 transition-colors"
                />
                <button
                  onClick={handleMoveToSafe}
                  disabled={isMoving || tokens.balance === 0 || safeMoveInput === ''}
                  className="bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-bold px-3 py-1.5 rounded transition-all"
                >
                  {isMoving ? '…' : 'Lock'}
                </button>
              </div>
              <button
                onClick={async () => {
                  if (tokens.balance === 0) return
                  setIsMoving(true)
                  try {
                    await moveToSafe(tokens.balance)
                  } catch {
                    // balance is non-zero so this shouldn't fail
                  } finally {
                    setIsMoving(false)
                  }
                }}
                disabled={isMoving || tokens.balance === 0}
                className="w-full text-xs text-emerald-400 hover:text-emerald-300 disabled:text-slate-600 transition-colors text-left"
              >
                Move all ({tokens.balance.toLocaleString()}) to safe →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed / toggle button */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="flex items-center gap-2 bg-slate-900 border border-amber-700 hover:border-amber-500 rounded-full px-4 py-2 shadow-lg shadow-black/40 transition-all hover:shadow-amber-900/30"
      >
        <span className="text-amber-400 font-bold text-sm">
          🪙 {tokens.balance.toLocaleString()}
        </span>
        {tokens.safe_balance > 0 && (
          <span className="text-emerald-400 text-xs">
            Safe: {tokens.safe_balance.toLocaleString()}
          </span>
        )}
        <span
          className={`text-slate-400 text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          ▲
        </span>
      </button>
    </div>
  )
}
