export default function Footer() {
  return (
    <footer className="bg-slate-800 border-t border-slate-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">CoinKeepersAuction</h3>
            <p className="text-slate-400 text-sm">
              Live auctions for coins and bullion with community engagement
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-amber-500">Auctions</a></li>
              <li><a href="#" className="hover:text-amber-500">Rooms</a></li>
              <li><a href="#" className="hover:text-amber-500">Games</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="/terms" className="hover:text-amber-500">Terms</a></li>
              <li><a href="/privacy" className="hover:text-amber-500">Privacy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <p className="text-slate-400 text-sm">
              📞 (606) 412-3121
            </p>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8">
          <p className="text-center text-slate-400 text-sm">
            © 2026 CoinKeepersAuction.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
