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

  const addTokens = (amount: number, _description: string): Promise<void> => {
    if (!tokens) return Promise.resolve()
    const updated = {
      ...tokens,
      balance: tokens.balance + amount,
      updated_at: new Date().toISOString(),
    }
    setTokens(updated)
    localStorage.setItem('tokens', JSON.stringify(updated))
    return Promise.resolve()
  }

  const deductTokens = (amount: number, _description: string): Promise<void> => {
    if (!tokens || tokens.balance < amount) return Promise.resolve()
    const updated = {
      ...tokens,
      balance: tokens.balance - amount,
      updated_at: new Date().toISOString(),
    }
    setTokens(updated)
    localStorage.setItem('tokens', JSON.stringify(updated))
    return Promise.resolve()
  }

  const moveToSafe = (amount: number): Promise<void> => {
    if (!tokens || tokens.balance < amount) return Promise.resolve()
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
    if (!tokens || tokens.safe_balance < amount) return Promise.resolve()
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
