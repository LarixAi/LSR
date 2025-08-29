
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { email, userData } = await req.json()

    console.log('Creating approved admin for:', email)

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email)
    
    if (existingUser.user) {
      console.log('User already exists, checking profile...')
      
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', existingUser.user.id)
        .single()

      if (!profile) {
        console.log('Creating profile for existing user...')
        // Create profile for existing user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: existingUser.user.id,
            email: email,
            first_name: userData?.first_name || 'Transport',
            last_name: userData?.last_name || 'Admin',
            role: 'admin',
            employment_status: 'active',
            onboarding_status: 'completed',
            is_active: true
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw profileError
        }

        console.log('Profile created successfully for existing user')
      } else {
        console.log('Profile already exists, updating role if needed...')
        // Update role to admin if not already
        if (profile.role !== 'admin') {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              role: 'admin',
              employment_status: 'active',
              onboarding_status: 'completed',
              is_active: true
            })
            .eq('id', existingUser.user.id)

          if (updateError) {
            console.error('Profile update error:', updateError)
            throw updateError
          }
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Admin profile ensured for existing user',
          userId: existingUser.user.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If user doesn't exist, this means they need to sign up first
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'User not found. Please sign up first or check the email address.',
        needsSignup: true
      }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
