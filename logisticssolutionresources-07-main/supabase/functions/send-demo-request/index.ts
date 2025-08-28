
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
console.log("Resend API Key exists:", !!resendApiKey);
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, user-agent, x-platform",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DemoRequestData {
  name: string;
  email: string;
  company?: string;
  message?: string;
  fleetSize?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received demo request at:", new Date().toISOString());
    
    // Check if Resend API key is configured
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured!");
      return new Response(
        JSON.stringify({ 
          error: "Email service not configured. Please contact support.",
          details: "RESEND_API_KEY missing" 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const demoData: DemoRequestData = await req.json();
    console.log("Demo data received:", JSON.stringify(demoData, null, 2));
    
    const { name, email, company, message, fleetSize } = demoData;
    
    // Send email to admin team
    const adminEmailResponse = await resend.emails.send({
      from: `LSR Demo Requests <${Deno.env.get("RESEND_FROM_EMAIL") || "no-reply@logisticssolutionresources.com"}>`,
      to: ["transport@logisticssolutionresources.com"],
      subject: `New Demo Request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">New Demo Request</h1>
            <p style="color: #bfdbfe; margin: 10px 0 0 0;">LSR - Logistics Solution Resources</p>
          </div>
          <div style="padding: 40px 20px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Demo Request Details</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">Name:</td>
                  <td style="padding: 10px 0; color: #6b7280;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">Email:</td>
                  <td style="padding: 10px 0; color: #6b7280;">${email}</td>
                </tr>
                ${company ? `
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">Company:</td>
                  <td style="padding: 10px 0; color: #6b7280;">${company}</td>
                </tr>
                ` : ''}
                ${fleetSize ? `
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">Fleet Size:</td>
                  <td style="padding: 10px 0; color: #6b7280;">${fleetSize} vehicles</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            ${message ? `
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #374151; margin: 0 0 10px 0;">Message:</h3>
              <p style="color: #6b7280; margin: 0; line-height: 1.6;">${message}</p>
            </div>
            ` : ''}
            
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <p style="color: #1e40af; margin: 0; font-weight: bold;">📧 Next Steps</p>
              <p style="color: #1e40af; margin: 5px 0 0 0; font-size: 14px;">
                Please reach out to ${name} at ${email} to schedule their demo.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Admin email response:", JSON.stringify(adminEmailResponse, null, 2));
    
    if (!adminEmailResponse.data) {
      console.error("Failed to send admin email:", adminEmailResponse);
      const errMsg = (adminEmailResponse as any)?.error?.error || (adminEmailResponse as any)?.error || "Failed to send admin notification email";
      return new Response(
        JSON.stringify({ error: errMsg }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: `LSR Team <${Deno.env.get("RESEND_FROM_EMAIL") || "no-reply@logisticssolutionresources.com"}>`,
      to: [email],
      subject: "Thank you for requesting a demo - LSR",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Thank You!</h1>
            <p style="color: #bfdbfe; margin: 10px 0 0 0;">LSR - Logistics Solution Resources</p>
          </div>
          <div style="padding: 40px 20px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Hi ${name},</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Thank you for your interest in LSR! We've received your demo request and our team will be in touch within 24 hours to schedule your personalized demonstration.
            </p>
            
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">🚛 What to Expect</h3>
              <ul style="color: #1e40af; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Personalized demo tailored to your fleet needs</li>
                <li>Overview of transport management features</li>
                <li>Discussion of pricing and implementation</li>
                <li>Q&A session with our transport experts</li>
              </ul>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              In the meantime, feel free to reach out to us at admin@logisticssolutionresources.com if you have any questions.
            </p>
            
            <p style="color: #64748b; font-size: 14px;">
              Best regards,<br>
              The LSR Team
            </p>
          </div>
        </div>
      `,
    });

    console.log("User email response:", JSON.stringify(userEmailResponse, null, 2));
    
    if (!userEmailResponse.data) {
      console.error("Failed to send user email:", userEmailResponse);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      adminEmailId: adminEmailResponse.data?.id,
      userEmailId: userEmailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-demo-request function:", error);
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
