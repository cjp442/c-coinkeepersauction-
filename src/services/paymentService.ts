// src/services/paymentService.ts
// Stripe payment integration for auction settlement and subscriptions.
// The secret key must be provided via environment variables in production.

import Stripe from 'stripe'

const stripeSecretKey = import.meta.env?.VITE_STRIPE_SECRET_KEY ?? ''

// Note: Stripe should only be initialized server-side.
// This file serves as a type-safe reference for payment operation signatures.
// In production, call your backend API instead of invoking Stripe directly.

let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!_stripe) {
    if (!stripeSecretKey) throw new Error('VITE_STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-01-28.clover' })
  }
  return _stripe
}

export const processPayment = async (
  amount: number,
  currency: string,
  paymentMethodId: string,
): Promise<Stripe.PaymentIntent> => {
  const stripe = getStripe()
  return stripe.paymentIntents.create({
    amount,
    currency,
    payment_method: paymentMethodId,
    confirm: true,
    automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
  })
}

export const createSubscription = async (
  customerId: string,
  priceId: string,
): Promise<Stripe.Subscription> => {
  const stripe = getStripe()
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
  })
}

export const manageTransaction = async (
  transactionId: string,
): Promise<Stripe.BalanceTransaction> => {
  const stripe = getStripe()
  return stripe.balanceTransactions.retrieve(transactionId)
}

export default { processPayment, createSubscription, manageTransaction }
