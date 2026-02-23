import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, username: string, role: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize user from localStorage or API
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (email: string, _password: string): Promise<void> => {
    try {
      // API call would go here
      const mockUser: User = {
        id: '1',
        email,
        username: email.split('@')[0],
        role: 'user',
        created_at: new Date().toISOString(),
      }
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
      return Promise.resolve()
    } catch (error) {
      console.error('Login error:', error)
      return Promise.reject(error)
    }
  }

  const signup = (email: string, _password: string, username: string, role: string): Promise<void> => {
    try {
      // API call would go here
      const mockUser: User = {
        id: Math.random().toString(),
        email,
        username,
        role: (role as User['role']) || 'user',
        created_at: new Date().toISOString(),
      }
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
      return Promise.resolve()
    } catch (error) {
      console.error('Signup error:', error)
      return Promise.reject(error)
    }
  }

  const logout = (): Promise<void> => {
    setUser(null)
    localStorage.removeItem('user')
    return Promise.resolve()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
