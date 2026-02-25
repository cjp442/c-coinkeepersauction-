// src/services/tokenService.ts
// Token economy service — wire Supabase calls and Stripe webhooks here.

export const TOKEN_PRICE_USD = 0.01 // $0.01 per Keeper Token
export const TAX_RATE = 0.10        // 10 %

/** Return USD cost + tax breakdown for a token purchase */
export function calculatePurchaseCost(tokenAmount: number) {
  const subtotal = tokenAmount * TOKEN_PRICE_USD
  const tax = subtotal * TAX_RATE
  return { subtotal, tax, total: subtotal + tax }
}

/**
 * Initiate a Stripe Checkout session for token purchase.
 * Replace the fetch URL with your actual Vercel/Supabase Edge Function endpoint.
 */
export async function initiatePurchase(userId: string, tokenAmount: number): Promise<{ url: string }> {
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, tokenAmount }),
  })
  if (!res.ok) throw new Error('Failed to create checkout session')
  return res.json()
}

/**
 * Stripe webhook handler — called server-side when payment succeeds.
 *
 * Deploy as /api/webhooks/stripe (Vercel serverless function or Supabase Edge Function).
 * Verifies the Stripe-Signature header and calls `add_keepers_coins` RPC on success.
 *
 * Example body (checkout.session.completed):
 *   { userId, tokenAmount, paymentIntentId }
 *
 * @see sql/schema.sql  add_keepers_coins()
 */
export async function handleStripeWebhook(
  rawBody: string,
  signature: string,
  webhookSecret: string,
): Promise<void> {
  // Server-side only — import stripe and verify signature:
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  // const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  // if (event.type === 'checkout.session.completed') {
  //   const { userId, tokenAmount } = event.data.object.metadata
  //   await supabase.rpc('add_keepers_coins', { p_user_id: userId, p_amount: Number(tokenAmount) })
  //   await supabase.from('coin_transactions').insert({
  //     user_id: userId, type: 'purchase', amount: tokenAmount,
  //     tax_amount: Math.floor(tokenAmount * TAX_RATE),
  //     net_amount: tokenAmount, description: 'Stripe token purchase',
  //     payment_reference: event.data.object.payment_intent,
  //   })
  // }
  console.info('[Webhook] handleStripeWebhook — implement server-side', { signature, webhookSecret: !!webhookSecret, rawBody: rawBody.slice(0, 40) })
}

/** Fetch coin balance for a user (Supabase) */
export async function getCoinBalance(userId: string): Promise<number> {
  // const { data } = await supabase.from('keepers_coins').select('balance').eq('user_id', userId).single()
  // return data?.balance ?? 0
  return 0
}

/** Fetch transaction history for a user */
export async function getTransactionHistory(userId: string) {
  // const { data } = await supabase.from('coin_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  // return data ?? []
  return []
}
