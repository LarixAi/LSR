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
    console.log('check-missing-auth-users function called');
    
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

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the JWT token
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', { id: user.id, email: user.email });

    // Get the user's profile to check permissions
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'User profile not found', details: profileError?.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin permissions
    if (userProfile.role !== 'admin' && userProfile.role !== 'council' && userProfile.role !== 'super_admin') {
      console.error('Insufficient permissions:', userProfile.role);
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User has permission, checking profiles...');

    // Get all profiles in the user's organization
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, email, first_name, last_name, role, organization_id')
      .eq('organization_id', userProfile.organization_id);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profiles', details: profilesError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found profiles:', profiles.length);

    // Get all Auth users
    const { data: authUsers, error: authUsersError } = await supabaseClient.auth.admin.listUsers();
    
    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch auth users', details: authUsersError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found auth users:', authUsers.users.length);

    // Create a set of Auth user IDs for quick lookup
    const authUserIds = new Set(authUsers.users.map(u => u.id));

    // Find profiles that don't have corresponding Auth users
    const missingAuthUsers = profiles.filter(profile => !authUserIds.has(profile.id));

    console.log('Missing auth users:', missingAuthUsers.length);

    return new Response(
      JSON.stringify({ 
        success: true,
        totalProfiles: profiles.length,
        totalAuthUsers: authUsers.users.length,
        missingAuthUsers: missingAuthUsers.length,
        missingUsers: missingAuthUsers,
        message: `Found ${missingAuthUsers.length} profiles without corresponding Auth users`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in check-missing-auth-users:', error);
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

