export interface KeepersCoin {
  id: string
  userId: string
  balance: number
  safeBalance: number
  createdAt: string
  updatedAt: string
}

export interface CoinTransaction {
  id: string
  userId: string
  type: 'purchase' | 'transfer_in' | 'transfer_out' | 'spend' | 'earn' | 'tax'
  amount: number
  taxAmount: number
  netAmount: number
  description: string
  referenceId?: string
  createdAt: string
}

export interface TokenPurchaseRequest {
  userId: string
  amount: number
  paymentMethod: string
  paymentReference: string
}
