import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface PasswordResetNotificationRequest {
  email: string;
  firstName: string;
  lastName: string;
  temporaryPassword: string;
  resetType: 'admin_reset' | 'bulk_reset' | 'force_change';
  organizationName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const requestData: PasswordResetNotificationRequest = await req.json();
    console.log('Sending password reset notification to:', requestData.email);

    // For now, we'll just log the notification details
    // In a real implementation, you would integrate with an email service like Resend
    const resetMessage = `
      Password Reset Notification:
      Name: ${requestData.firstName} ${requestData.lastName}
      Email: ${requestData.email}
      Temporary Password: ${requestData.temporaryPassword}
      Reset Type: ${requestData.resetType}
      Organization: ${requestData.organizationName || 'Your Organization'}
      
      Instructions: 
      1. Login to the system using your email and the temporary password above
      2. You will be prompted to change your password upon first login
      3. Choose a strong, unique password for security
      
      This temporary password will expire in 24 hours for security reasons.
      
      If you did not request this password reset, please contact your system administrator immediately.
    `;

    console.log(resetMessage);

    // TODO: Replace with actual email service integration
    // Example with Resend:
    /*
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const emailResponse = await resend.emails.send({
      from: "Transport Management <noreply@yourdomain.com>",
      to: [requestData.email],
      subject: `Password Reset - ${requestData.organizationName || 'Transport Management'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Notification</h2>
          
          <p>Hello ${requestData.firstName},</p>
          
          <p>Your password has been reset by an administrator. Please use the following temporary credentials to login:</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Email:</strong> ${requestData.email}<br>
            <strong>Temporary Password:</strong> <code style="background: #e0e0e0; padding: 2px 4px;">${requestData.temporaryPassword}</code>
          </div>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>This temporary password will expire in 24 hours</li>
            <li>You will be required to change your password upon first login</li>
            <li>Choose a strong, unique password for security</li>
          </ul>
          
          <p>If you did not request this password reset, please contact your system administrator immediately.</p>
          
          <p>Best regards,<br>${requestData.organizationName || 'Transport Management'} Team</p>
        </div>
      `,
    });
    */

    // Simulate email sending success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset notification sent successfully (simulated)',
        recipient: requestData.email,
        resetType: requestData.resetType
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in send-password-reset-notification function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send password reset notification', 
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