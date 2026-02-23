import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TokenProvider } from './contexts/TokenContext'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import LiveStreamAuctionPage from './pages/LiveStreamAuctionPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import AdminDashboard from './pages/AdminDashboard'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <TokenProvider>
        <Router>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/auctions" element={<LiveStreamAuctionPage />} />
              <Route path="/live" element={<LiveStreamAuctionPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Router>
      </TokenProvider>
    </AuthProvider>
  )
}
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auction from './components/Auction';
import Dashboard from './components/Dashboard';
import Multiplayer from './components/Multiplayer';
import Layout from './components/Layout';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path='/' element={<Dashboard />} />
                    <Route path='/auction' element={<Auction />} />
                    <Route path='/multiplayer' element={<Multiplayer />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
