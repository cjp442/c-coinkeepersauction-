// src/services/tokenService.ts

export function getCoinBalance(_userId: string): number {
  return 0
}

export function purchaseCoins(_userId: string, _amount: number): Promise<void> {
  return Promise.resolve()
}

export function getTransactionHistory(_userId: string): unknown[] {
  return []
}

export function getUserLedger(_userId: string): unknown[] {
  return []
}

export function calculateTax(amount: number): number {
  return amount * 0.1
}

export default { getCoinBalance, purchaseCoins, getTransactionHistory, getUserLedger, calculateTax }
