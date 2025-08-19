import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateDriverRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  hireDate?: string;
  cdlNumber?: string;
  medicalCardExpiry?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the JWT token
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData: CreateDriverRequest = await req.json();
    console.log('Creating driver with data:', requestData);

    // Generate a temporary password for the driver
    const temporaryPassword = Math.random().toString(36).slice(-12);

    // Create auth user first
    const { data: authUser, error: authUserError } = await supabaseClient.auth.admin.createUser({
      email: requestData.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        first_name: requestData.firstName,
        last_name: requestData.lastName,
        role: 'driver'
      }
    });

    if (authUserError) {
      console.error('Error creating auth user:', authUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user account', details: authUserError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authUser.user) {
      throw new Error('User creation failed - no user returned');
    }

    // Create profile record
    const profileData = {
      id: authUser.user.id,
      email: requestData.email,
      first_name: requestData.firstName,
      last_name: requestData.lastName,
      role: 'driver',
      phone: requestData.phone || null,
      address: requestData.address || null,
      city: requestData.city || null,
      state: requestData.state || null,
      zip_code: requestData.zipCode || null,
      hire_date: requestData.hireDate || null,
      cdl_number: requestData.cdlNumber || null,
      medical_card_expiry: requestData.medicalCardExpiry || null,
      is_active: true,
      must_change_password: true,
      organization_id: user.user_metadata?.organization_id || null
    };

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Clean up the auth user if profile creation fails
      await supabaseClient.auth.admin.deleteUser(authUser.user.id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to create driver profile', details: profileError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send credentials to driver via edge function
    try {
      await supabaseClient.functions.invoke('send-driver-credentials', {
        body: {
          email: requestData.email,
          firstName: requestData.firstName,
          lastName: requestData.lastName,
          temporaryPassword: temporaryPassword
        }
      });
    } catch (emailError) {
      console.warn('Failed to send credentials email:', emailError);
      // Don't fail the entire operation if email fails
    }

    console.log('Driver created successfully:', profile);

    return new Response(
      JSON.stringify({ 
        success: true, 
        driver: profile,
        message: 'Driver created successfully. Login credentials have been sent to their email.'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in create-driver function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);