// Tests for token locking/bidding logic
// These tests validate the wallet state transitions expected from SQL RPCs

interface Wallet {
  balance: number
  locked_tokens: number
  safe_balance: number
}

function lockTokens(wallet: Wallet, amount: number): Wallet {
  if (wallet.balance < amount) throw new Error('Insufficient balance')
  return { ...wallet, balance: wallet.balance - amount, locked_tokens: wallet.locked_tokens + amount }
}

function releaseLockedTokens(wallet: Wallet, amount: number): Wallet {
  if (wallet.locked_tokens < amount) throw new Error('Insufficient locked tokens')
  return { ...wallet, balance: wallet.balance + amount, locked_tokens: wallet.locked_tokens - amount }
}

function settleBid(
  winner: Wallet,
  seller: Wallet,
  amount: number
): { winner: Wallet; seller: Wallet } {
  if (winner.locked_tokens < amount) throw new Error('Winner does not have enough locked tokens')
  return {
    winner: { ...winner, locked_tokens: winner.locked_tokens - amount },
    seller: { ...seller, balance: seller.balance + amount },
  }
}

describe('Token Bidding', () => {
  it('locks tokens when a bid is placed: balance decreases, locked_tokens increases', () => {
    const wallet: Wallet = { balance: 100, locked_tokens: 0, safe_balance: 0 }
    const updated = lockTokens(wallet, 30)
    expect(updated.balance).toBe(70)
    expect(updated.locked_tokens).toBe(30)
  })

  it('throws when bid exceeds balance', () => {
    const wallet: Wallet = { balance: 10, locked_tokens: 0, safe_balance: 0 }
    expect(() => lockTokens(wallet, 20)).toThrow('Insufficient balance')
  })

  it('releases locked tokens when outbid: locked_tokens decreases, balance returns', () => {
    const wallet: Wallet = { balance: 70, locked_tokens: 30, safe_balance: 0 }
    const updated = releaseLockedTokens(wallet, 30)
    expect(updated.balance).toBe(100)
    expect(updated.locked_tokens).toBe(0)
  })

  it('throws when releasing more than locked', () => {
    const wallet: Wallet = { balance: 70, locked_tokens: 10, safe_balance: 0 }
    expect(() => releaseLockedTokens(wallet, 30)).toThrow('Insufficient locked tokens')
  })

  it('settles bid: winner locked tokens deducted, seller receives amount', () => {
    const winner: Wallet = { balance: 70, locked_tokens: 30, safe_balance: 0 }
    const seller: Wallet = { balance: 0, locked_tokens: 0, safe_balance: 0 }
    const result = settleBid(winner, seller, 30)
    expect(result.winner.locked_tokens).toBe(0)
    expect(result.seller.balance).toBe(30)
  })

  it('settle bid throws when winner has insufficient locked tokens', () => {
    const winner: Wallet = { balance: 100, locked_tokens: 10, safe_balance: 0 }
    const seller: Wallet = { balance: 0, locked_tokens: 0, safe_balance: 0 }
    expect(() => settleBid(winner, seller, 30)).toThrow()
  })
})
