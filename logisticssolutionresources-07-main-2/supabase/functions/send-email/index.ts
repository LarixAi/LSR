import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  content: string;
  templateId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { recipientEmail, recipientName, subject, content, templateId }: SendEmailRequest = await req.json();

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, first_name, last_name')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error('User organization not found');
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Transport System <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: subject,
      html: content,
    });

    if (emailResponse.error) {
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    // Log email in database
    const { error: logError } = await supabase
      .from('email_logs')
      .insert({
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        subject: subject,
        content: content,
        status: 'sent',
        template_used: templateId || null,
        organization_id: profile.organization_id,
        sent_by: user.id
      });

    if (logError) {
      console.error('Failed to log email:', logError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    
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