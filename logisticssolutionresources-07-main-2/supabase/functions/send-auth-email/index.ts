
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailData {
  email_action_type: string;
  user: {
    email: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    site_url: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received auth email request");
    const authData: AuthEmailData = await req.json();
    console.log("Auth data:", JSON.stringify(authData, null, 2));
    
    const { email_action_type, user, email_data } = authData;
    
    const firstName = user.user_metadata?.first_name || '';
    const greeting = firstName ? `Hi ${firstName}` : 'Hello';
    
    let subject = '';
    let htmlContent = '';
    
    // Construct the verification URL
    const verificationUrl = `${email_data.site_url}/auth/callback?token_hash=${email_data.token_hash}&type=${email_action_type}&redirect_to=${email_data.redirect_to}`;
    
    switch (email_action_type) {
      case 'signup':
        subject = 'Welcome to LSR - Verify Your Email';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to LSR!</h1>
              <p style="color: #bfdbfe; margin: 10px 0 0 0;">Logistics Solution Resources</p>
            </div>
            <div style="padding: 40px 20px; background: #f8fafc;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">${greeting},</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                Thank you for signing up for LSR, your comprehensive transport management platform. 
                To complete your registration and start using the system, please verify your email address.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);">
                  Verify Email Address
                </a>
              </div>
              <p style="color: #64748b; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #3b82f6; word-break: break-all;">${verificationUrl}</a>
              </p>
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">🚛 What's Next?</h3>
                <p style="color: #1e40af; margin: 0; font-size: 14px;">
                  Once verified, you'll have access to our complete transport management suite including vehicle tracking, driver management, and route optimization.
                </p>
              </div>
              <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                If you didn't create an account with LSR, you can safely ignore this email.
              </p>
            </div>
          </div>
        `;
        break;
        
      case 'recovery':
        subject = 'Reset Your LSR Password';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
              <p style="color: #fecaca; margin: 10px 0 0 0;">LSR - Logistics Solution Resources</p>
            </div>
            <div style="padding: 40px 20px; background: #f8fafc;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">${greeting},</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your LSR account. 
                Click the button below to create a new password and regain access to your transport management dashboard.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.39);">
                  Reset Password
                </a>
              </div>
              <p style="color: #64748b; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #ef4444; word-break: break-all;">${verificationUrl}</a>
              </p>
              <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 16px;">🔒 Security Notice</h3>
                <p style="color: #dc2626; margin: 0; font-size: 14px;">
                  This password reset link will expire in 1 hour for your security. If you need a new link, please request another password reset.
                </p>
              </div>
              <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </div>
          </div>
        `;
        break;
        
      case 'email_change':
        subject = 'Confirm Your New Email Address - LSR';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Email Change Request</h1>
              <p style="color: #a7f3d0; margin: 10px 0 0 0;">LSR - Logistics Solution Resources</p>
            </div>
            <div style="padding: 40px 20px; background: #f8fafc;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">${greeting},</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                Please confirm your new email address by clicking the button below. This will update your LSR account to use this new email for all future communications.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39);">
                  Confirm New Email
                </a>
              </div>
              <p style="color: #64748b; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #10b981; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>
          </div>
        `;
        break;
        
      default:
        subject = 'LSR Account Notification';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Account Notification</h1>
              <p style="color: #bfdbfe; margin: 10px 0 0 0;">LSR - Logistics Solution Resources</p>
            </div>
            <div style="padding: 40px 20px; background: #f8fafc;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">${greeting},</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                Please click the button below to proceed with your account action.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Continue
                </a>
              </div>
            </div>
          </div>
        `;
    }

    console.log("Sending email to:", user.email);
    console.log("Email subject:", subject);

    const emailResponse = await resend.emails.send({
      from: "LSR - Logistics Solution Resources <admin@logisticssolutionresources.com>",
      to: [user.email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
