import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('create-missing-auth-user function called');
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body:', requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const { profileId, adminUserId } = requestBody;

    if (!profileId || !adminUserId) {
      console.error('Missing required parameters:', { profileId: !!profileId, adminUserId: !!adminUserId });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters', 
          details: { profileId: !!profileId, adminUserId: !!adminUserId } 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Verifying admin user:', adminUserId);

    // Verify the admin user has permission
    const { data: adminProfile, error: adminError } = await supabaseClient
      .from('profiles')
      .select('role, organization_id')
      .eq('id', adminUserId)
      .single()

    if (adminError || !adminProfile) {
      console.error('Admin profile error:', adminError);
      return new Response(
        JSON.stringify({ error: 'Admin user not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (adminProfile.role !== 'admin' && adminProfile.role !== 'council' && adminProfile.role !== 'super_admin') {
      console.error('Insufficient permissions for admin:', adminProfile.role);
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Getting target profile:', profileId);

    // Get the target profile
    const { data: targetProfile, error: targetError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (targetError || !targetProfile) {
      console.error('Target profile error:', targetError);
      return new Response(
        JSON.stringify({ error: 'Target profile not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if target user is in the same organization
    if (targetProfile.organization_id !== adminProfile.organization_id) {
      console.error('Organization mismatch');
      return new Response(
        JSON.stringify({ error: 'Can only create users in your organization' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user already exists in Auth
    const { data: existingAuthUser, error: authCheckError } = await supabaseClient.auth.admin.getUserById(profileId);

    if (existingAuthUser.user) {
      console.log('User already exists in Auth:', existingAuthUser.user.email);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User already exists in authentication system',
          user: {
            id: existingAuthUser.user.id,
            email: existingAuthUser.user.email
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Creating Auth user for profile:', targetProfile.email);

    // Create the user in Auth
    const { data: newAuthUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email: targetProfile.email,
      password: 'temporary_password_123', // They'll need to change this
      email_confirm: true,
      user_metadata: {
        first_name: targetProfile.first_name,
        last_name: targetProfile.last_name,
        role: targetProfile.role
      }
    })

    if (createError) {
      console.error('Auth user creation error:', createError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create user in authentication system', 
          details: createError 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Auth user created successfully:', newAuthUser.user.email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User created in authentication system successfully',
        user: {
          id: newAuthUser.user.id,
          email: newAuthUser.user.email
        },
        note: 'User will need to change their password on first login'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in create-missing-auth-user:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        stack: error.stack,
        type: error.constructor.name
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

