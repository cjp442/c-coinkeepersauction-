import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TokenProvider } from './contexts/TokenContext'
import AppLayout from './components/AppLayout'
import GameEngine from './game/GameEngine'
import HomePage from './pages/HomePage'
import AuctionsPage from './pages/AuctionsPage'
import AdminDashboard from './pages/AdminDashboard'
import SettingsPage from './pages/SettingsPage'
import TokenShop from './components/TokenShop'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TokenProvider>
          <Routes>
            {/* Full-screen 3D game — no layout wrapper */}
            <Route path="/game" element={<GameEngine />} />

            {/* Standard pages with header/footer */}
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/auctions" element={<AuctionsPage />} />
              <Route path="/tokens" element={<TokenShop />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </TokenProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
