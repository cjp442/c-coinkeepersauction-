// Tests for age gating logic

interface User {
  id: string
  email: string
  username: string
  role: string
  age_verified: boolean
}

function canPurchaseTokens(user: User | null): boolean {
  if (!user) return false
  return user.age_verified === true
}

function canJoinAuction(user: User | null): boolean {
  if (!user) return false
  return user.age_verified === true
}

function shouldShowAgeGate(user: User | null, action: 'purchase' | 'auction'): boolean {
  if (!user) return false
  if (action === 'purchase') return !canPurchaseTokens(user)
  if (action === 'auction') return !canJoinAuction(user)
  return false
}

describe('Age Gating', () => {
  const unverifiedUser: User = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    role: 'user',
    age_verified: false,
  }

  const verifiedUser: User = {
    id: '2',
    email: 'verified@example.com',
    username: 'verifieduser',
    role: 'user',
    age_verified: true,
  }

  it('shows age gate modal when user is not verified and tries to purchase', () => {
    expect(shouldShowAgeGate(unverifiedUser, 'purchase')).toBe(true)
  })

  it('does not show age gate when user is verified', () => {
    expect(shouldShowAgeGate(verifiedUser, 'purchase')).toBe(false)
  })

  it('blocks token purchase when not age verified', () => {
    expect(canPurchaseTokens(unverifiedUser)).toBe(false)
  })

  it('allows token purchase when age verified', () => {
    expect(canPurchaseTokens(verifiedUser)).toBe(true)
  })

  it('blocks auction join when not age verified', () => {
    expect(canJoinAuction(unverifiedUser)).toBe(false)
  })

  it('allows auction join when age verified', () => {
    expect(canJoinAuction(verifiedUser)).toBe(true)
  })

  it('shows age gate for auction when not verified', () => {
    expect(shouldShowAgeGate(unverifiedUser, 'auction')).toBe(true)
  })

  it('does not show age gate for null user', () => {
    expect(shouldShowAgeGate(null, 'purchase')).toBe(false)
  })
})
