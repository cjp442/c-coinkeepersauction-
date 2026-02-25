import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'

export default function AppLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
