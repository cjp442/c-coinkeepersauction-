import { Link } from 'react-router-dom'

interface HeroSectionProps {
  onJoinClick: () => void
  onModeChange?: (mode: '2d' | '3d') => void
  mode?: '2d' | '3d'
}

export default function HeroSection({ onJoinClick, onModeChange, mode = '2d' }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b-4 border-amber-700">
      {/* Ornate border top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-900 via-amber-500 to-amber-900" />

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Left — headline & CTAs */}
          <div>
            {/* Age / coins badge */}
            <div className="inline-flex items-center gap-2 bg-red-900/60 border border-red-700 text-red-300 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              21+ Only · Keeper Coins Only · No Real Money Prizes
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 text-amber-100 drop-shadow-lg">
              Welcome to{' '}
              <span className="block text-amber-400">The Keeper's Saloon</span>
            </h1>

            <p className="text-lg text-amber-200/80 mb-3 leading-relaxed">
              Step inside, partner. Live auction streams, high-stakes games, and
              fine company await ye — all settled in{' '}
              <span className="text-amber-400 font-semibold">🪙 Keeper Coins</span>.
            </p>

            {/* Grand-opening dates */}
            <p className="text-sm text-amber-500 font-semibold tracking-wide mb-8 border-l-2 border-amber-700 pl-3">
              Grand Opening December 20, 2026 · VIP Access Dec 5, 2026
            </p>

            {/* 2D / 3D mode toggle */}
            <div className="flex gap-2 mb-8">
              <button
                onClick={() => onModeChange?.('2d')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border transition-all ${
                  mode === '2d'
                    ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/50'
                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🎭 2D Experience
              </button>
              <button
                onClick={() => onModeChange?.('3d')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border transition-all ${
                  mode === '3d'
                    ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/50'
                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🎮 3D World
              </button>
            </div>

            {/* CTAs */}
            <div className="flex gap-4 flex-wrap items-center">
              <button
                onClick={onJoinClick}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-8 py-3.5 rounded-lg transition-all shadow-lg shadow-amber-900/40 hover:shadow-amber-700/50 text-base"
              >
                🚪 Enter the Saloon
              </button>
              <Link
                to="/live"
                className="text-amber-400 hover:text-amber-300 font-semibold text-sm underline underline-offset-4 transition-colors"
              >
                Watch a Live Stream →
              </Link>
            </div>
          </div>

          {/* Right — ornate coin card */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border-2 border-amber-700/60 shadow-2xl shadow-amber-900/40 bg-gradient-to-br from-amber-900 to-stone-800 p-10 flex flex-col items-center justify-center gap-6 text-center">
              {/* Decorative corner flourishes */}
              <div className="absolute top-3 left-3 text-amber-700 text-lg select-none">✦</div>
              <div className="absolute top-3 right-3 text-amber-700 text-lg select-none">✦</div>
              <div className="absolute bottom-3 left-3 text-amber-700 text-lg select-none">✦</div>
              <div className="absolute bottom-3 right-3 text-amber-700 text-lg select-none">✦</div>

              <div className="text-8xl leading-none drop-shadow-2xl">🪙</div>
              <div>
                <p className="text-amber-200 font-bold text-2xl tracking-wide">Keeper Coins</p>
                <p className="text-amber-400/80 text-sm mt-1">The currency of the saloon</p>
              </div>
              <div className="w-16 h-0.5 bg-amber-700/60 rounded" />
              <p className="text-amber-300/70 text-xs italic max-w-[200px] leading-relaxed">
                "A gentleman always settles his debts in coin."
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
