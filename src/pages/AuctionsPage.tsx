export default function AuctionsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Live Auctions</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Auction cards will be rendered here */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <p className="text-slate-400">Loading auctions...</p>
        </div>
      </div>
    </div>
  )
}
