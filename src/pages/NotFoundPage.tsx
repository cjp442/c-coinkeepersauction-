export default function NotFoundPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
      <a href="/" className="px-6 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition">
        Return Home
      </a>
    </div>
  )
}
