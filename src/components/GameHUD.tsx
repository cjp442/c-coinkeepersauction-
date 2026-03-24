import { useGameStore } from '../game/utils/GameState'
import { useTokens } from '../contexts/TokenContext'
import { useAuth } from '../contexts/AuthContext'

export default function GameHUD() {
  const { currentScene, nearbyInteractable } = useGameStore()
  const { tokens } = useTokens()
  const { user } = useAuth()

  const sceneLabel =
    currentScene === 'lobby'
      ? 'Lobby'
      : currentScene === 'host_room'
        ? 'Host Room'
        : currentScene === 'member_room'
          ? 'Member Room'
          : 'Unknown'

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top-left: scene name */}
      <div className="absolute top-4 left-4 bg-black/60 text-amber-300 text-sm font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm border border-amber-800/40">
        📍 {sceneLabel}
      </div>

      {/* Top-right: player name + coin balance */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        {user && (
          <div className="bg-black/60 text-amber-200 text-sm font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm border border-amber-800/40">
            {user.username}
          </div>
        )}
        <div className="bg-black/60 text-amber-300 text-sm font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm border border-amber-800/40 flex items-center gap-1.5">
          🪙 {tokens?.balance ?? 0}
        </div>
      </div>

      {/* Center: nearby interactable hint */}
      {nearbyInteractable !== null && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-16 bg-black/70 text-white text-sm font-medium px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">
          Press <span className="text-amber-300 font-bold">E</span> to interact
        </div>
      )}

      {/* Bottom-center: controls help */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-gray-400 text-xs px-4 py-1.5 rounded-lg backdrop-blur-sm border border-white/10 text-center whitespace-nowrap">
        WASD: Move&nbsp;&nbsp;|&nbsp;&nbsp;Shift: Run&nbsp;&nbsp;|&nbsp;&nbsp;E: Interact&nbsp;&nbsp;|&nbsp;&nbsp;C: Camera&nbsp;&nbsp;|&nbsp;&nbsp;Click canvas to lock mouse
      </div>
    </div>
  )
}
