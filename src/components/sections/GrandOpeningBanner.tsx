import { Link } from 'react-router-dom'

export default function GrandOpeningBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-y-2 border-red-800/60">
      {/* Ambient glow lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(180,30,30,0.15)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-10 text-center">
        {/* Decorative top rule */}
        <div className="flex items-center justify-center gap-3 mb-4 text-amber-700 select-none">
          <span className="flex-1 max-w-[80px] h-px bg-amber-800/50" />
          <span className="text-lg">✦ ✦ ✦</span>
          <span className="flex-1 max-w-[80px] h-px bg-amber-800/50" />
        </div>

        <p className="text-red-400 text-xs uppercase tracking-[0.25em] font-bold mb-2">
          Hear Ye, Hear Ye
        </p>

        <h2 className="text-3xl md:text-4xl font-extrabold text-amber-200 mb-2 drop-shadow">
          The Keeper's Saloon
        </h2>
        <p className="text-2xl font-bold text-amber-400 mb-1">
          Grand Opening — December 20, 2026
        </p>
        <p className="text-amber-300/80 text-sm mb-1 font-semibold">
          VIP Early Access: December 5, 2026
        </p>
        <p className="text-red-400/80 text-xs mb-7 tracking-wide">
          All 21+ · ID Verified · Keeper Coins Only
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            to="/register?plan=vip"
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-amber-900/40"
          >
            🎩 Apply as VIP
          </Link>
          <Link
            to="/apply-host"
            className="bg-red-800 hover:bg-red-700 text-red-100 font-bold px-6 py-2.5 rounded-lg text-sm transition-all border border-red-700"
          >
            🃏 Apply as Host
          </Link>
          <a
            href="tel:+16064123121"
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold px-6 py-2.5 rounded-lg text-sm transition-all border border-slate-600"
          >
            📞 Call: (606) 412-3121
          </a>
        </div>

        {/* Decorative bottom rule */}
        <div className="flex items-center justify-center gap-3 mt-6 text-amber-700 select-none">
          <span className="flex-1 max-w-[80px] h-px bg-amber-800/50" />
          <span className="text-lg">✦ ✦ ✦</span>
          <span className="flex-1 max-w-[80px] h-px bg-amber-800/50" />
        </div>
      </div>
    </div>
  )
}
