import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ShieldAlert, X } from 'lucide-react'

interface AgeGateModalProps {
  onClose: () => void
  onVerified?: () => void
}

export default function AgeGateModal({ onClose, onVerified }: AgeGateModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/identity-start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
      })
      const json = await res.json()
      if (json.url) {
        window.open(json.url, '_blank')
        onVerified?.()
        onClose()
      } else {
        setError(json.error || 'Failed to start verification.')
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <ShieldAlert className="mx-auto mb-4 text-amber-500" size={48} />
          <h2 className="text-2xl font-bold mb-2">21+ Age Verification Required</h2>
          <p className="text-slate-400 text-sm">
            You must be 21 or older to participate in auctions and purchase tokens.
            Please verify your age to continue.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-400 rounded p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? 'Starting verification...' : 'Verify My Age'}
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          Powered by Stripe Identity. Your data is secure and private.
        </p>
      </div>
    </div>
  )
}
