import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TokenProvider } from './contexts/TokenContext'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import AuctionsPage from './pages/AuctionsPage'
import LiveStreamPage from './pages/LiveStreamPage'
import GamesPage from './pages/GamesPage'
import SettingsPage from './pages/SettingsPage'
import AdminDashboard from './pages/AdminDashboard'
import GamePage from './pages/GamePage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import Notifications from './components/Notifications'
import TokenBar from './components/TokenBar'

function App() {
  return (
    <AuthProvider>
      <TokenProvider>
        <Router>
          <Notifications />
          <TokenBar />
          <Routes>
            <Route path="/game" element={<GamePage />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="live" element={<LiveStreamPage />} />
              <Route path="auctions" element={<AuctionsPage />} />
              <Route path="games" element={<GamesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Router>
      </TokenProvider>
    </AuthProvider>
  )
}

export default App
