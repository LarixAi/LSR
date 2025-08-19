import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CredentialsRequest {
  email: string;
  firstName: string;
  lastName: string;
  temporaryPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: CredentialsRequest = await req.json();
    console.log('Sending credentials to:', requestData.email);

    // For now, we'll just log the credentials
    // In a real implementation, you would integrate with an email service like Resend
    console.log(`
      Driver Account Created:
      Name: ${requestData.firstName} ${requestData.lastName}
      Email: ${requestData.email}
      Temporary Password: ${requestData.temporaryPassword}
      
      Instructions: Login to the system and you will be prompted to change your password.
    `);

    // Simulate email sending success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Credentials sent successfully (simulated)',
        recipient: requestData.email
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in send-driver-credentials function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send credentials', 
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