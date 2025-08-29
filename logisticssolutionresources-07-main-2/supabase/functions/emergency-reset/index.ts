import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface EmergencyResetRequest {
  email: string;
  adminSecret: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { email, adminSecret }: EmergencyResetRequest = await req.json();

    // Initialize Supabase with service role
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

    // Check rate limiting for emergency resets
    const { data: rateLimitCheck, error: rateLimitError } = await supabaseClient.rpc('check_auth_rate_limit', {
      user_identifier: email,
      max_attempts: 2,
      window_minutes: 60
    });

    if (rateLimitError || !rateLimitCheck) {
      console.error('Rate limit exceeded for emergency reset:', email);
      
      // Log security event
      await supabaseClient.rpc('log_security_event', {
        event_type: 'emergency_reset_rate_limit_exceeded',
        event_details: { 
          email,
          ip: req.headers.get('x-forwarded-for') || 'unknown'
        },
        severity: 'warning'
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Rate limit exceeded for emergency resets. Please wait before trying again.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 429 
        }
      );
    }

    // Verify admin secret
    const expectedSecret = Deno.env.get('ADMIN_RESET_SECRET');
    if (!expectedSecret || adminSecret !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: 'Invalid admin secret' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the user by email
    const { data: users, error: getUserError } = await supabaseClient.auth.admin.listUsers();
    
    if (getUserError) {
      throw getUserError;
    }

    const targetUser = users.users.find(u => u.email === email);
    
    if (!targetUser) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate new temporary password
    const temporaryPassword = 'TempPass' + Math.floor(Math.random() * 10000) + '!';

    // Reset the password using admin API
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      targetUser.id,
      { password: temporaryPassword }
    );

    if (updateError) {
      throw updateError;
    }

    // Mark profile for password change
    await supabaseClient
      .from('profiles')
      .update({ must_change_password: true })
      .eq('id', targetUser.id);

    console.log(`Emergency password reset for ${email}: ${temporaryPassword}`);

    // Log security event for emergency reset
    await supabaseClient.rpc('log_security_event', {
      event_type: 'emergency_password_reset',
      event_details: {
        target_email: email,
        reset_method: 'admin_secret'
      },
      severity: 'info',
      ip_address: req.headers.get('x-forwarded-for') || null
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Password reset successfully',
        temporaryPassword: temporaryPassword,
        email: email
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in emergency-reset function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Emergency reset failed', 
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