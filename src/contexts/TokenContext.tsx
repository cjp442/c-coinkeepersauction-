import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { Token } from '../types'

interface TokenContextType {
  tokens: Token | null
  loading: boolean
  addTokens: (amount: number, description: string) => Promise<void>
  deductTokens: (amount: number, description: string) => Promise<void>
  moveToSafe: (amount: number) => Promise<void>
  moveFromSafe: (amount: number) => Promise<void>
}

const TokenContext = createContext<TokenContextType | undefined>(undefined)

export function TokenProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [tokens, setTokens] = useState<Token | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchWallet(userId: string) {
    const { data, error } = await supabase
      .from('keepers_coins')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (error || !data) return null
    return {
      id: data.id,
      user_id: data.user_id,
      balance: data.balance,
      safe_balance: data.safe_balance,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as Token
  }

  useEffect(() => {
    if (!user) {
      setTokens(null)
      setLoading(false)
      return
    }
    setLoading(true)
    fetchWallet(user.id).then(wallet => {
      setTokens(wallet)
      setLoading(false)
    })
  }, [user?.id])

  const addTokens = async (amount: number, _description: string) => {
    if (!user) return
    await supabase.rpc('add_keepers_coins', { p_user_id: user.id, p_amount: amount })
    const updated = await fetchWallet(user.id)
    setTokens(updated)
  }

  const deductTokens = async (amount: number, _description: string) => {
    if (!user) return
    await supabase.rpc('deduct_keepers_coins', { p_user_id: user.id, p_amount: amount })
    const updated = await fetchWallet(user.id)
    setTokens(updated)
  }

  const moveToSafe = async (amount: number) => {
    if (!user) return
    await supabase.rpc('move_to_safe', { p_user_id: user.id, p_amount: amount })
    const updated = await fetchWallet(user.id)
    setTokens(updated)
  }

  const moveFromSafe = async (amount: number) => {
    if (!user) return
    await supabase.rpc('move_from_safe', { p_user_id: user.id, p_amount: amount })
    const updated = await fetchWallet(user.id)
    setTokens(updated)
  }

  return (
    <TokenContext.Provider value={{ tokens, loading, addTokens, deductTokens, moveToSafe, moveFromSafe }}>
      {children}
    </TokenContext.Provider>
  )
}

export function useTokens() {
  const context = useContext(TokenContext)
  if (context === undefined) {
    throw new Error('useTokens must be used within TokenProvider')
  }
  return context
}
