import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { X, Send } from 'lucide-react'

interface ChatMessage {
  id: string
  sender: string
  text: string
  timestamp: Date
}

interface ChatPanelProps {
  roomId: string
  isOpen?: boolean
  onClose?: () => void
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'System', text: 'Welcome to the room!', timestamp: new Date() },
]

export default function ChatPanel({ roomId: _roomId, isOpen = true, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = () => {
    const text = input.trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'You', text, timestamp: new Date() },
    ])
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage()
  }

  if (!isOpen) return null

  return (
    <div className="flex flex-col w-72 max-h-80 bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-hidden pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50">
        <span className="text-xs font-semibold text-slate-300">Chat</span>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id}>
            <span className="text-xs font-semibold text-amber-400">{msg.sender}</span>
            <span className="text-xs text-slate-500 ml-1">{formatTime(msg.timestamp)}</span>
            <p className="text-xs text-slate-300 break-words">{msg.text}</p>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-1.5 px-2 py-2 border-t border-slate-700/50">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          maxLength={200}
          className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
        />
        <button
          onClick={sendMessage}
          aria-label="Send message"
          className="text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-40"
          disabled={!input.trim()}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
