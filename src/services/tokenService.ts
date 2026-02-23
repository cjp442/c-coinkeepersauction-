import { createClient } from '@supabase/supabase-js'
import { KeepersCoin, CoinTransaction, TokenPurchaseRequest } from '../types/token'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
)

const TAX_RATE = 0.05

export const tokenService = {
  async getBalance(userId: string): Promise<KeepersCoin | null> {
    const { data, error } = await supabase.from('keepers_coins').select('*').eq('user_id', userId).single()
    if (error) return null
    return data
  },
  async purchaseTokens(request: TokenPurchaseRequest): Promise<void> {
    const tax = Math.floor(request.amount * TAX_RATE)
    const net = request.amount - tax
    const { error: txError } = await supabase.from('coin_transactions').insert({
      user_id: request.userId, type: 'purchase', amount: request.amount,
      tax_amount: tax, net_amount: net,
      description: `Purchased ${request.amount} Keepers Coins`,
      payment_reference: request.paymentReference,
    })
    if (txError) throw txError
    const { error: balError } = await supabase.rpc('add_keepers_coins', { p_user_id: request.userId, p_amount: net })
    if (balError) throw balError
  },
  async spendTokens(userId: string, amount: number, description: string, referenceId?: string): Promise<void> {
    const tax = Math.floor(amount * TAX_RATE)
    const total = amount + tax
    const { error: txError } = await supabase.from('coin_transactions').insert({
      user_id: userId, type: 'spend', amount: total, tax_amount: tax, net_amount: amount, description, reference_id: referenceId,
    })
    if (txError) throw txError
    const { error: balError } = await supabase.rpc('deduct_keepers_coins', { p_user_id: userId, p_amount: total })
    if (balError) throw balError
  },
  async transferTokens(fromUserId: string, toUserId: string, amount: number, description: string): Promise<void> {
    const tax = Math.floor(amount * TAX_RATE)
    await Promise.all([
      supabase.from('coin_transactions').insert({ user_id: fromUserId, type: 'transfer_out', amount, tax_amount: tax, net_amount: amount, description }),
      supabase.from('coin_transactions').insert({ user_id: toUserId, type: 'transfer_in', amount: amount - tax, tax_amount: 0, net_amount: amount - tax, description }),
    ])
    await supabase.rpc('transfer_keepers_coins', { p_from_user_id: fromUserId, p_to_user_id: toUserId, p_amount: amount, p_tax: tax })
  },
  async getTransactionHistory(userId: string, limit = 50): Promise<CoinTransaction[]> {
    const { data, error } = await supabase.from('coin_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit)
    if (error) throw error
    return data || []
  },
  async moveToSafe(userId: string, amount: number): Promise<void> {
    const { error } = await supabase.rpc('move_to_safe', { p_user_id: userId, p_amount: amount })
    if (error) throw error
  },
  async moveFromSafe(userId: string, amount: number): Promise<void> {
    const { error } = await supabase.rpc('move_from_safe', { p_user_id: userId, p_amount: amount })
    if (error) throw error
  }
}
