import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
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
  const [tokens, setTokens] = useState<Token | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedTokens = localStorage.getItem('tokens')
    if (storedTokens) {
      setTokens(JSON.parse(storedTokens))
    } else {
      const mockTokens: Token = {
        id: '1',
        user_id: '1',
        balance: 0,
        safe_balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setTokens(mockTokens)
      localStorage.setItem('tokens', JSON.stringify(mockTokens))
    }
    setLoading(false)
  }, [])

  const addTokens = (amount: number, description: string): Promise<void> => {
    if (!tokens) return Promise.reject(new Error('Token wallet not loaded'))
    const updated = {
      ...tokens,
      balance: tokens.balance + amount,
      updated_at: new Date().toISOString(),
    }
    setTokens(updated)
    localStorage.setItem('tokens', JSON.stringify(updated))
    // Log description for future backend integration
    console.debug('[TokenContext] addTokens:', amount, description)
    return Promise.resolve()
  }

  const deductTokens = (amount: number, description: string): Promise<void> => {
    if (!tokens) return Promise.reject(new Error('Token wallet not loaded'))
    if (tokens.balance < amount) return Promise.reject(new Error('Insufficient Keeper Coins balance'))
    const updated = {
      ...tokens,
      balance: tokens.balance - amount,
      updated_at: new Date().toISOString(),
    }
    setTokens(updated)
    localStorage.setItem('tokens', JSON.stringify(updated))
    console.debug('[TokenContext] deductTokens:', amount, description)
    return Promise.resolve()
  }

  const moveToSafe = (amount: number): Promise<void> => {
    if (!tokens) return Promise.reject(new Error('Token wallet not loaded'))
    if (tokens.balance < amount) return Promise.reject(new Error('Insufficient balance to move to safe'))
    const updated = {
      ...tokens,
      balance: tokens.balance - amount,
      safe_balance: tokens.safe_balance + amount,
      updated_at: new Date().toISOString(),
    }
    setTokens(updated)
    localStorage.setItem('tokens', JSON.stringify(updated))
    return Promise.resolve()
  }

  const moveFromSafe = (amount: number): Promise<void> => {
    if (!tokens) return Promise.reject(new Error('Token wallet not loaded'))
    if (tokens.safe_balance < amount) return Promise.reject(new Error('Insufficient safe balance'))
    const updated = {
      ...tokens,
      balance: tokens.balance + amount,
      safe_balance: tokens.safe_balance - amount,
      updated_at: new Date().toISOString(),
    }
    setTokens(updated)
    localStorage.setItem('tokens', JSON.stringify(updated))
    return Promise.resolve()
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
