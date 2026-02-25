import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TokenProvider } from './contexts/TokenContext'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import AuctionsPage from './pages/AuctionsPage'
import AdminDashboard from './pages/AdminDashboard'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import GamePage from './pages/GamePage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <TokenProvider>
        <BrowserRouter>
          <Switch>
            <Route path="/" exact>
              <AppLayout><HomePage /></AppLayout>
            </Route>
            <Route path="/auctions">
              <AppLayout><AuctionsPage /></AppLayout>
            </Route>
            <Route path="/admin">
              <AppLayout><AdminDashboard /></AppLayout>
            </Route>
            <Route path="/profile">
              <AppLayout><ProfilePage /></AppLayout>
            </Route>
            <Route path="/settings">
              <AppLayout><SettingsPage /></AppLayout>
            </Route>
            <Route path="/game">
              <GamePage />
            </Route>
            <Route>
              <AppLayout><NotFoundPage /></AppLayout>
            </Route>
          </Switch>
        </BrowserRouter>
      </TokenProvider>
    </AuthProvider>
  )
}