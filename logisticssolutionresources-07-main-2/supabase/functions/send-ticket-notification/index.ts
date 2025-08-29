import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TicketNotificationRequest {
  ticketNumber: string;
  subject: string;
  description: string;
  priority: string;
  category: string;
  submittedBy: string;
  submittedAt: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      ticketNumber, 
      subject, 
      description, 
      priority, 
      category, 
      submittedBy,
      submittedAt 
    }: TicketNotificationRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Support Tickets <onboarding@resend.dev>",
      to: ["transport@logisticssolutionresources.com"],
      subject: `New Support Ticket: ${ticketNumber} - ${subject}`,
      html: `
        <h2>New Support Ticket Submitted</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Ticket Details</h3>
          <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Priority:</strong> ${priority}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Submitted By:</strong> ${submittedBy}</p>
          <p><strong>Submitted At:</strong> ${new Date(submittedAt).toLocaleString()}</p>
        </div>
        <div style="margin: 20px 0;">
          <h3>Description</h3>
          <div style="background: #ffffff; padding: 15px; border: 1px solid #ddd; border-radius: 4px;">
            ${description.replace(/\n/g, '<br>')}
          </div>
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Please log into the admin panel to view and respond to this ticket.
        </p>
      `,
    });

    console.log("Ticket notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending ticket notification:", error);
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