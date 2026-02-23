import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import GameEngine from '../game/GameEngine'

export default function GamePage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/settings')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-2xl animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black z-50">
      <GameEngine onExitGame={() => navigate('/')} />
    </div>
  )
}
