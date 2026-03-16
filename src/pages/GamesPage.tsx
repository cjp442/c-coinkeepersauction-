import { useState } from 'react'
import SpinningWheel from '../components/SpinningWheel'
import BlackjackGame from '../components/BlackjackGame'
import { useTokens } from '../contexts/TokenContext'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'

type GameTab = 'wheel' | 'blackjack'

export default function GamesPage() {
  const { user } = useAuth()
  const { tokens } = useTokens()
  const [activeTab, setActiveTab] = useState<GameTab>('wheel')
  const [showWheel, setShowWheel] = useState(false)
  const [showBlackjack, setShowBlackjack] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const handlePlay = (game: GameTab) => {
    if (!user) {
      setShowAuth(true)
      return
    }
    if (game === 'wheel') setShowWheel(true)
    else setShowBlackjack(true)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">🎮 Games Arcade</h1>
        {tokens && (
          <div className="bg-amber-600 px-4 py-2 rounded-lg text-sm font-bold">
            🪙 {tokens.balance.toLocaleString()} Tokens
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-8 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('wheel')}
          className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px transition ${
            activeTab === 'wheel'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          🎡 Spin the Wheel
        </button>
        <button
          onClick={() => setActiveTab('blackjack')}
          className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px transition ${
            activeTab === 'blackjack'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          🃏 Blackjack 21
        </button>
      </div>

      {/* Spin the Wheel */}
      {activeTab === 'wheel' && (
        <div className="bg-slate-800 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🎡</div>
          <h2 className="text-2xl font-bold mb-3">Spin the Wheel</h2>
          <p className="text-slate-400 mb-2">Cost: <span className="text-amber-400 font-bold">10 tokens</span> per spin</p>
          <p className="text-slate-400 mb-6">Win up to <span className="text-amber-400 font-bold">1,000 tokens</span>!</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 text-sm">
            {[
              { label: 'Try Again', color: 'bg-slate-700', tokens: 0 },
              { label: '25 Tokens', color: 'bg-green-900', tokens: 25 },
              { label: '50 Tokens', color: 'bg-red-900', tokens: 50 },
              { label: '75 Tokens', color: 'bg-blue-900', tokens: 75 },
              { label: '100 Tokens', color: 'bg-amber-900', tokens: 100 },
              { label: '200 Tokens', color: 'bg-purple-900', tokens: 200 },
              { label: '500 Tokens', color: 'bg-cyan-900', tokens: 500 },
              { label: '🎰 Jackpot!', color: 'bg-yellow-900', tokens: 1000 },
            ].map((s) => (
              <div key={s.label} className={`${s.color} rounded-lg p-3 border border-slate-600`}>
                <div className="font-semibold">{s.label}</div>
                {s.tokens > 0 && <div className="text-amber-400 text-xs">+{s.tokens}</div>}
              </div>
            ))}
          </div>
          <button
            onClick={() => handlePlay('wheel')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-lg text-lg transition"
          >
            {user ? 'Spin Now!' : 'Login to Play'}
          </button>
        </div>
      )}

      {/* Blackjack */}
      {activeTab === 'blackjack' && (
        <div className="bg-slate-800 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🃏</div>
          <h2 className="text-2xl font-bold mb-3">Blackjack 21</h2>
          <p className="text-slate-400 mb-6">
            Classic blackjack — beat the dealer to <span className="text-amber-400 font-bold">21</span>.
            Bet tokens to win up to <span className="text-amber-400 font-bold">2× your stake</span>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-sm text-left">
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="text-amber-400 font-bold mb-1">Bet Options</div>
              <div className="text-slate-300">10 · 25 · 50 · 100 · 250 · 500 tokens</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="text-amber-400 font-bold mb-1">Blackjack Pays</div>
              <div className="text-slate-300">3:2 on natural 21</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="text-amber-400 font-bold mb-1">Rules</div>
              <div className="text-slate-300">Dealer stands on soft 17</div>
            </div>
          </div>
          <button
            onClick={() => handlePlay('blackjack')}
            className="bg-green-700 hover:bg-green-800 text-white font-bold px-8 py-3 rounded-lg text-lg transition"
          >
            {user ? 'Deal Cards' : 'Login to Play'}
          </button>
        </div>
      )}

      {/* Modals */}
      {showWheel && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <SpinningWheel onClose={() => setShowWheel(false)} />
        </div>
      )}
      {showBlackjack && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <BlackjackGame onClose={() => setShowBlackjack(false)} />
        </div>
      )}
      {showAuth && (
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      )}
    </div>
  )
}
