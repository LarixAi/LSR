
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; frame-src 'none';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, userData } = await req.json()

    // Server-side password validation
    const { data: passwordCheck, error: passwordError } = await supabase.rpc(
      'validate_password_complexity', 
      { password }
    )

    if (passwordError || !passwordCheck.valid) {
      return new Response(
        JSON.stringify({ 
          error: 'Password validation failed', 
          details: passwordCheck?.errors || ['Password does not meet security requirements'] 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Enhanced input sanitization
    const sanitizedData = {
      email: email.toLowerCase().trim(),
      first_name: userData.first_name?.trim().replace(/[<>]/g, ''),
      last_name: userData.last_name?.trim().replace(/[<>]/g, '')
    }

    // Create user with email confirmation required
    const { data, error } = await supabase.auth.admin.createUser({
      email: sanitizedData.email,
      password,
      email_confirm: false, // Require email confirmation
      user_metadata: sanitizedData
    })

    if (error) {
      // Log security event
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_event_type: 'enhanced_signup_failed',
        p_event_details: {
          email: sanitizedData.email,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      })

      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log successful signup attempt and create profile
    if (data.user) {
      // Log signup success
      await supabase.rpc('log_security_event', {
        p_user_id: data.user.id,
        p_event_type: 'enhanced_signup_success',
        p_event_details: {
          email: sanitizedData.email,
          email_confirmed: false,
          timestamp: new Date().toISOString()
        }
      })

      // Ensure a matching profile row exists
      const profilePayload = {
        id: data.user.id,
        user_id: data.user.id,
        email: sanitizedData.email,
        first_name: sanitizedData.first_name || '',
        last_name: sanitizedData.last_name || '',
        role: 'driver', // default role; adjust if you pass roles in userData
        organization_id: null
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' })

      if (profileError) {
        // Log but don't fail the whole request
        await supabase.rpc('log_security_event', {
          p_user_id: data.user.id,
          p_event_type: 'profile_upsert_failed',
          p_event_details: {
            email: sanitizedData.email,
            error: profileError.message,
            timestamp: new Date().toISOString()
          }
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Account created successfully. Please check your email to confirm your account.',
        user: data.user 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Enhanced signup error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
