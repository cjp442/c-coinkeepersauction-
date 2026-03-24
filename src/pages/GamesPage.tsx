import { useAuth } from '../contexts/AuthContext'
import { Coins, Lock, Play, HelpCircle } from 'lucide-react'

interface GameCard {
  id: string
  name: string
  description: string
  emoji: string
  category: string
  entryCost: number | null
  vipOnly: boolean
}

const GAMES: GameCard[] = [
  {
    id: 'revolver-spin',
    name: 'Revolver Spin',
    description: 'Spin the chamber, test your luck. 6 slots, one winner.',
    emoji: '🔫',
    category: 'Randomizer',
    entryCost: 10,
    vipOnly: false,
  },
  {
    id: 'card-draw',
    name: 'Card Draw',
    description: "Draw your hand at the Keeper's table.",
    emoji: '🃏',
    category: 'Card Game',
    entryCost: 25,
    vipOnly: false,
  },
  {
    id: 'pool-tournament',
    name: 'Pool Tournament',
    description: 'VIP Only — Challenge the house to a game of billiards.',
    emoji: '🎱',
    category: 'Tournament',
    entryCost: null,
    vipOnly: true,
  },
  {
    id: 'auction-wheel',
    name: 'Auction Wheel',
    description: 'Watch the wheel spin live during auctions.',
    emoji: '🎡',
    category: 'Live Game',
    entryCost: 15,
    vipOnly: false,
  },
]

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Buy Keeper Coins',
    detail: 'Top up your wallet from the Token Bar. All transactions are virtual.',
  },
  {
    step: 2,
    title: 'Enter a Game',
    detail: 'Choose your game, pay the entry fee in Keeper Coins, and join the table.',
  },
  {
    step: 3,
    title: 'Win Keeper Coins',
    detail: 'Winners are paid out in Keeper Coins directly to their balance.',
  },
]

export default function GamesPage() {
  const { user } = useAuth()

  const isVip = user?.role === 'vip' || user?.role === 'host' || user?.role === 'admin'

  const getButtonState = (
    game: GameCard,
  ): { disabled: boolean; tooltip: string | null } => {
    if (!user) return { disabled: true, tooltip: 'Log in to play' }
    if (game.vipOnly && !isVip) return { disabled: true, tooltip: 'VIP membership required' }
    return { disabled: false, tooltip: null }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      {/* Page Header */}
      <div className="max-w-5xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-bold text-amber-400 tracking-wide font-serif mb-2">
          The Gaming Parlour
        </h1>
        <p className="text-slate-400 text-lg">
          Step up to the table, cowboy. Fortune favours the bold.
        </p>
        <div className="mt-2 text-amber-600 text-sm tracking-widest">
          ✦ ═══════════════════ ✦
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14">
          {GAMES.map(game => {
            const { disabled, tooltip } = getButtonState(game)
            return (
              <div
                key={game.id}
                className="group relative rounded-lg border border-slate-700 bg-slate-800 p-6 overflow-hidden
                  hover:border-amber-600 hover:shadow-xl hover:shadow-amber-900/20
                  transition-all duration-200 hover:-translate-y-0.5"
              >
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-4xl shrink-0">
                    {game.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-lg font-bold text-amber-300 font-serif">
                        {game.name}
                      </h3>
                      {game.vipOnly && (
                        <span className="flex items-center gap-1 text-xs bg-red-900/60 border border-red-700 text-red-300 px-2 py-0.5 rounded-full font-medium">
                          <Lock className="w-3 h-3" />
                          VIP Only
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">
                      {game.category}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 text-sm mb-5 leading-relaxed">
                  {game.description}
                </p>

                <div className="flex items-center justify-between gap-3">
                  {game.vipOnly ? (
                    <span className="flex items-center gap-1.5 text-red-400 text-sm font-medium">
                      <Lock className="w-4 h-4" />
                      VIP Members Only
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-amber-400 text-sm font-medium">
                      <Coins className="w-4 h-4" />
                      {game.entryCost} Keeper Coins
                    </span>
                  )}

                  <div className="relative group/btn">
                    <button
                      disabled={disabled}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-semibold transition-all ${
                        disabled
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          : 'bg-amber-700 hover:bg-amber-600 text-white'
                      }`}
                    >
                      <Play className="w-4 h-4" />
                      Play Now
                    </button>
                    {tooltip && (
                      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity">
                        {tooltip}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* How Games Work */}
        <div className="border border-slate-700 rounded-lg bg-slate-900 p-6 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-amber-400 font-serif">How Games Work</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-slate-100 mb-1">{item.title}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-slate-500 text-xs">
          🪙 All games use Keeper Coins only. Approved by site administration. No real money involved.
        </p>
      </div>
    </div>
  )
}
