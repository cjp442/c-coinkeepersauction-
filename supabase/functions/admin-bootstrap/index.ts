import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Protect with service role key
  const authHeader = req.headers.get('Authorization') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!authHeader.includes(serviceRoleKey)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    )

    const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? ''
    if (!adminEmail) {
      return new Response(JSON.stringify({ error: 'ADMIN_EMAIL not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if admin user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existing = existingUsers?.users?.find((u: any) => u.email === adminEmail)

    let userId: string
    if (existing) {
      userId = existing.id
    } else {
      const tempPassword = crypto.randomUUID()
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: tempPassword,
        email_confirm: true,
      })
      if (error || !newUser?.user) throw error ?? new Error('Failed to create user')
      userId = newUser.user.id
    }

    // Upsert into public.users
    await supabase.from('users').upsert({
      id: userId,
      email: adminEmail,
      username: 'thecoinkeeper',
      role: 'admin',
      age_verified: true,
    })

    return new Response(JSON.stringify({ success: true, userId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
