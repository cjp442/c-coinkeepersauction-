export default function AuctionsPreview() {
  const mockAuctions = [
    { id: 1, title: 'Morgan Silver Dollar 1921', bid: 125, image: '🪙' },
    { id: 2, title: 'Gold Bar 1oz', bid: 2500, image: '🏆' },
    { id: 3, title: 'Silver Bullion Set', bid: 850, image: '💎' },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 bg-slate-800 rounded-lg">
      <h2 className="text-3xl font-bold mb-8">Featured Auctions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockAuctions.map((auction) => (
          <div key={auction.id} className="bg-slate-700 p-6 rounded-lg hover:bg-slate-600 transition cursor-pointer">
            <div className="text-5xl mb-4">{auction.image}</div>
            <h3 className="font-semibold text-lg mb-2">{auction.title}</h3>
            <p className="text-amber-500 text-xl font-bold">Current Bid: {auction.bid} Tokens</p>
          </div>
        ))}
      </div>
    </section>
  )
}
