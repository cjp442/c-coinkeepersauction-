import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'
import { corsHeaders } from '../_shared/cors.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const signature = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
  } catch (e: any) {
    return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${e.message}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    const { userId, tokenAmount } = intent.metadata

    if (userId && tokenAmount) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase.rpc('add_keepers_coins', {
        p_user_id: userId,
        p_amount: parseInt(tokenAmount, 10),
      })

      await supabase.from('coin_transactions').insert({
        user_id: userId,
        type: 'purchase',
        amount: parseInt(tokenAmount, 10),
        description: `Purchased ${tokenAmount} tokens`,
        reference_id: intent.id,
      })
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
