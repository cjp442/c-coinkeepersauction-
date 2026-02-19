interface HeroSectionProps {
  onJoinClick: () => void
}

export default function HeroSection({ onJoinClick }: HeroSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-bold mb-6">
            Live Auctions for <span className="text-amber-500">Coins & Bullion</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Join our community for real-time bidding, 3D interactive rooms, games, and exclusive streaming.
          </p>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={onJoinClick}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3 rounded-lg transition"
            >
              Join Now
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-8 py-3 rounded-lg transition">
              Learn More
            </button>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg p-8 text-center">
          <div className="text-6xl font-bold text-amber-100">💰</div>
          <p className="text-white mt-4">Premium Coins & Bullion</p>
        </div>
      </div>
    </section>
  )
}
