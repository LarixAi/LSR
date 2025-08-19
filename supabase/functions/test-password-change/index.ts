import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('=== TEST PASSWORD CHANGE FUNCTION ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Log environment variables (without exposing sensitive data)
    console.log('Environment variables check:');
    console.log('- SUPABASE_URL exists:', !!Deno.env.get('SUPABASE_URL'));
    console.log('- SUPABASE_SERVICE_ROLE_KEY exists:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    
    // Try to parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body parsed successfully:', requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body', 
          details: parseError.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Extract and validate parameters
    const { targetUserId, newPassword, adminUserId } = requestBody;
    
    console.log('Extracted parameters:');
    console.log('- targetUserId:', targetUserId, '(exists:', !!targetUserId, ')');
    console.log('- adminUserId:', adminUserId, '(exists:', !!adminUserId, ')');
    console.log('- newPassword:', newPassword ? '[REDACTED]' : null, '(exists:', !!newPassword, ')');
    
    // Check for missing parameters
    const missingParams = [];
    if (!targetUserId) missingParams.push('targetUserId');
    if (!newPassword) missingParams.push('newPassword');
    if (!adminUserId) missingParams.push('adminUserId');
    
    if (missingParams.length > 0) {
      console.error('Missing required parameters:', missingParams);
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters', 
          details: missingParams 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log('All parameters present and valid');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test function executed successfully',
        receivedParams: {
          targetUserId,
          adminUserId,
          hasNewPassword: !!newPassword
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in test function:', error);
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

