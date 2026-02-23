import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTokens } from '../../contexts/TokenContext'
import CoinDisplay from './CoinDisplay'
import ChatPanel from './ChatPanel'
import Minimap from './Minimap'
import ControlsHelp from './ControlsHelp'

interface GameHUDProps {
  debugMode?: boolean
  roomId?: string
}

const ROLE_LEVEL: Record<string, number> = {
  user: 1,
  vip: 5,
  host: 10,
  admin: 99,
}

export default function GameHUD({ debugMode = false, roomId = 'lobby' }: GameHUDProps) {
  const { user } = useAuth()
  const { tokens, loading: tokensLoading } = useTokens()
  const [chatOpen, setChatOpen] = useState(false)

  const level = user ? (ROLE_LEVEL[user.role] ?? 1) : 1

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      {/* Top-left: player info */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-auto">
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg px-3 py-2">
          {user ? (
            <>
              <p className="text-sm font-semibold text-slate-100 leading-none">{user.username}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Lvl {level} &mdash; <span className="capitalize">{user.role}</span>
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-500">Not signed in</p>
          )}
        </div>

        {debugMode && (
          // Placeholder FPS counter — replace with real rAF measurement if needed
          <div className="bg-black/60 border border-green-500/30 rounded px-2 py-1">
            <span className="text-xs font-mono text-green-400">60 FPS</span>
          </div>
        )}
      </div>

      {/* Top-right: coin balance */}
      <div className="absolute top-4 right-4">
        <CoinDisplay
          balance={tokens?.balance ?? 0}
          loading={tokensLoading}
        />
      </div>

      {/* Bottom-left: minimap */}
      <div className="absolute bottom-4 left-4">
        <Minimap roomName={roomId} />
      </div>

      {/* Bottom-center: controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <ControlsHelp />
      </div>

      {/* Bottom-right: chat toggle + panel */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 pointer-events-auto">
        {chatOpen && (
          <ChatPanel
            roomId={roomId}
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
          />
        )}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            aria-label="Open chat"
            className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/50 hover:border-amber-500/50 rounded-lg px-3 py-2 text-slate-300 hover:text-amber-400 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs">Chat</span>
          </button>
        )}
      </div>
    </div>
  )
}
