import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t-2 border-amber-900/50 mt-0">
      {/* Top amber rule */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-700 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🪙</span>
              <span className="text-amber-300 font-extrabold text-lg tracking-wide leading-tight">
                The Keeper's Saloon
              </span>
            </div>
            <p className="text-amber-700 text-xs font-semibold uppercase tracking-widest mb-3">
              Est. 2026 · All Ages 21+ · Keeper Coins Only
            </p>
            <p className="text-slate-500 text-sm leading-relaxed">
              A place of fine entertainment and lively auction streams,
              settled honestly in Keeper Coins.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-amber-500 font-bold text-xs uppercase tracking-widest mb-4">
              The Saloon
            </h4>
            <ul className="space-y-2.5 text-slate-400 text-sm">
              <li>
                <Link to="/live" className="hover:text-amber-400 transition-colors">
                  Live Streams
                </Link>
              </li>
              <li>
                <Link to="/auctions" className="hover:text-amber-400 transition-colors">
                  Auctions
                </Link>
              </li>
              <li>
                <Link to="/games" className="hover:text-amber-400 transition-colors">
                  Games
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="hover:text-amber-400 transition-colors">
                  Rooms
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-amber-500 font-bold text-xs uppercase tracking-widest mb-4">
              House Rules
            </h4>
            <ul className="space-y-2.5 text-slate-400 text-sm">
              <li>
                <Link to="/terms" className="hover:text-amber-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/age-verification" className="hover:text-amber-400 transition-colors">
                  Age Verification Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-amber-500 font-bold text-xs uppercase tracking-widest mb-4">
              Send a Telegraph
            </h4>
            <a
              href="tel:+16064123121"
              className="flex items-center gap-2 text-amber-300 hover:text-amber-200 font-semibold text-sm transition-colors mb-2"
            >
              📞 (606) 412-3121
            </a>
            <p className="text-slate-500 text-xs leading-relaxed mt-2">
              Open for inquiries from dawn 'til dusk, six days a week.
            </p>
          </div>

        </div>

        {/* Bottom rule + copyright */}
        <div className="border-t border-amber-900/30 pt-6 text-center space-y-1">
          <p className="text-slate-500 text-xs">
            © 2026 CoinKeepersAuction.com. All coin transactions use Keeper Coins only. No real money prizes.
          </p>
          <p className="text-slate-600 text-xs">
            🪙 Keeper Coins have no cash value. For entertainment purposes only. Must be 21+.
          </p>
        </div>
      </div>
    </footer>
  )
}
