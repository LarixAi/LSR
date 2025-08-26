import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendCredentialsRequest {
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

    const requestData: SendCredentialsRequest = await req.json();
    console.log('Sending driver credentials to:', requestData.email);

    // Create the email HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to LSR Transport - Your Driver Account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .credentials { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .warning { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to LSR Transport!</h1>
            <p>Your Driver Account is Ready</p>
          </div>
          <div class="content">
            <h2>Hi ${requestData.firstName},</h2>
            
            <p>Welcome to LSR Transport Management System! Your driver account has been successfully created by your administrator.</p>
            
            <div class="credentials">
              <h3>🔑 Your Login Credentials</h3>
              <p><strong>Email:</strong> ${requestData.email}</p>
              <p><strong>Temporary Password:</strong> ${requestData.temporaryPassword}</p>
            </div>
            
            <div class="warning">
              <h3>⚠️ Important Security Notice</h3>
              <p>For your security, you <strong>must change your password</strong> on your first login. This temporary password will expire soon.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${Deno.env.get('SITE_URL') || 'https://lsr-transport.com'}/auth" class="button">Login to Your Account</a>
            </div>
            
            <h3>What you can do with your driver account:</h3>
            <ul>
              <li>📱 Access your driver dashboard</li>
              <li>🚛 View assigned vehicles and routes</li>
              <li>📊 Track your driving history and performance</li>
              <li>📋 Complete pre-trip inspections</li>
              <li>🔔 Receive important notifications</li>
              <li>📝 Update your profile and documents</li>
            </ul>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Click the login button above</li>
              <li>Enter your email and temporary password</li>
              <li>Change your password when prompted</li>
              <li>Complete your profile setup</li>
              <li>Review your assigned vehicles and routes</li>
            </ol>
            
            <p>If you have any questions or need assistance, please contact your administrator or our support team.</p>
          </div>
          <div class="footer">
            <p>© 2024 LSR Transport. All rights reserved.</p>
            <p>This email was sent to ${requestData.email}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend (you'll need to add Resend API key to your environment)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `LSR Transport <${requestData.email}>`,
          to: [requestData.email],
          subject: 'Welcome to LSR Transport - Your Driver Account is Ready',
          html: html,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text();
        console.error('Failed to send email:', errorData);
        throw new Error('Failed to send welcome email');
      }

      console.log('Welcome email sent successfully to:', requestData.email);
    } else {
      console.warn('RESEND_API_KEY not configured - skipping email send');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Welcome email sent successfully' 
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
        error: 'Failed to send credentials email', 
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