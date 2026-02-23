import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TokenProvider } from './contexts/TokenContext'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import AuctionsPage from './pages/AuctionsPage'
import SettingsPage from './pages/SettingsPage'
import AdminDashboard from './pages/AdminDashboard'
import NotFoundPage from './pages/NotFoundPage'
import GamePage from './pages/GamePage'

function App() {
  return (
    <AuthProvider>
      <TokenProvider>
        <Router>
          <Routes>
            <Route path="/game" element={<GamePage />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="auctions" element={<AuctionsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Router>
      </TokenProvider>
    </AuthProvider>
  )
}

export default App
