export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 p-6 rounded-lg">
          <p className="text-slate-400 text-sm">Total Users</p>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <p className="text-slate-400 text-sm">Active Auctions</p>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <p className="text-slate-400 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold">$0</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <p className="text-slate-400 text-sm">Active Streams</p>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  )
}
