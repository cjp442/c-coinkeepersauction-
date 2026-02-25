import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'

const VoiceChat: React.FC = () => {
  const [isActive, setIsActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const toggleVoice = async () => {
    if (!isActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        setHasPermission(true)
        setIsActive(true)
        setIsMuted(false)
      } catch {
        setHasPermission(false)
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      setIsActive(false)
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = isMuted })
      setIsMuted(m => !m)
    }
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100, display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button
        onClick={toggleVoice}
        title={isActive ? 'Leave voice chat' : 'Join voice chat'}
        style={{ padding: '10px 16px', backgroundColor: isActive ? '#16a34a' : '#374151', color: '#fff', border: `2px solid ${isActive ? '#22c55e' : '#4b5563'}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold' }}
      >
        {isActive ? <Mic size={15} /> : <MicOff size={15} />}
        {isActive ? 'Voice On' : 'Voice'}
      </button>

      {isActive && (
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          style={{ padding: '10px 14px', backgroundColor: isMuted ? '#dc2626' : '#374151', color: '#fff', border: `2px solid ${isMuted ? '#ef4444' : '#4b5563'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      )}

      {hasPermission === false && (
        <div style={{ padding: '8px 12px', backgroundColor: '#7f1d1d', color: '#fca5a5', borderRadius: '8px', fontSize: '12px' }}>
          Mic blocked
        </div>
      )}
    </div>
  )
}

export default VoiceChat
