import React, { useState } from 'react'
import { Html } from '@react-three/drei'

const ChatSystem: React.FC = () => {
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([
    { user: 'System', text: '✨ Welcome to Keepers Auction!' },
  ])
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { user: 'You', text: input }])
      setInput('')
    }
  }

  return (
    <Html position={[-9, 1, 0]} scale={0.5}>
      <div style={{ width: '300px', height: isOpen ? '400px' : '60px', backgroundColor: 'rgba(0, 0, 0, 0.9)', border: '2px solid #ffd700', borderRadius: '8px', display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: 'Arial', overflow: 'hidden', transition: 'height 0.3s ease' }}>
        <div onClick={() => setIsOpen(!isOpen)} style={{ padding: '10px', backgroundColor: '#ffd700', color: '#000', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', textAlign: 'center' }}>
          💬 CHAT {isOpen ? '▼' : '▲'}
        </div>
        {isOpen && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px', fontSize: '12px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{msg.user}:</span> {msg.text}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '5px', padding: '8px' }}>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type message..." style={{ flex: 1, padding: '5px', borderRadius: '4px', border: 'none', fontSize: '12px' }} />
              <button onClick={handleSend} style={{ padding: '5px 10px', backgroundColor: '#ffd700', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </Html>
  )
}

export default ChatSystem