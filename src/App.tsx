import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TokenProvider } from './contexts/TokenContext'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import AuctionsPage from './pages/AuctionsPage'
import SettingsPage from './pages/SettingsPage'
import AdminDashboard from './pages/AdminDashboard'
import GameLobbyPage from './pages/GameLobbyPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <TokenProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="auctions" element={<AuctionsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            {/* Game lobby runs outside AppLayout to use the full viewport */}
            <Route path="lobby" element={<GameLobbyPage />} />
          </Routes>
        </Router>
      </TokenProvider>
    </AuthProvider>
  )
}

export default App
