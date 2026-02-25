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
  const webhookSecret = Deno.env.get('STRIPE_IDENTITY_WEBHOOK_SECRET') ?? ''
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

  if (event.type === 'identity.verification_session.verified') {
    const session = event.data.object as Stripe.Identity.VerificationSession
    const userId = session.metadata?.userId

    if (userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase
        .from('users')
        .update({ age_verified: true, verified_at: new Date().toISOString() })
        .eq('id', userId)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
