export default function GrandOpeningBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-600 to-amber-700 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">🎉 Grand Opening December 20, 2026</h2>
        <p className="text-amber-50 mb-4">
          VIP Early Access: December 5, 2026 | Call to Apply: (606) 412-3121
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button className="bg-white text-amber-600 hover:bg-amber-50 font-semibold px-6 py-2 rounded transition">
            Donate to Support
          </button>
          <button className="bg-amber-800 text-white hover:bg-amber-900 font-semibold px-6 py-2 rounded transition">
            Apply as Host
          </button>
        </div>
      </div>
    </div>
  )
}
