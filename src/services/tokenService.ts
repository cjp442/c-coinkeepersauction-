import { KeepersCoin, CoinTransaction, TokenPurchaseRequest } from '../types/token'

export const tokenService = {
  async getBalance(_userId: string): Promise<KeepersCoin | null> {
    return null
  },
  async purchaseTokens(_request: TokenPurchaseRequest): Promise<void> {},
  async spendTokens(_userId: string, _amount: number, _description: string, _referenceId?: string): Promise<void> {},
  async transferTokens(_fromUserId: string, _toUserId: string, _amount: number, _description: string): Promise<void> {},
  async getTransactionHistory(_userId: string, _limit = 50): Promise<CoinTransaction[]> {
    return []
  },
  async moveToSafe(_userId: string, _amount: number): Promise<void> {},
  async moveFromSafe(_userId: string, _amount: number): Promise<void> {},
}
