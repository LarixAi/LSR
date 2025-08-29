import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TierNotificationRequest {
  customer_id: string;
  old_tier: string;
  new_tier: string;
  total_points: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { customer_id, old_tier, new_tier, total_points }: TierNotificationRequest = await req.json();

    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('user_id', customer_id)
      .single();

    if (customerError || !customer) {
      console.error('Customer lookup error:', customerError);
      return new Response(JSON.stringify({ error: 'Customer not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user email from auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(customer_id);
    
    if (userError || !userData.user?.email) {
      console.error('User email lookup error:', userError);
      return new Response(JSON.stringify({ error: 'User email not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Define tier benefits
    const tierBenefits = {
      bronze: ['1 point per £1 spent', 'Special member offers'],
      silver: ['1 point per £1 spent', '5% discount on all rides', 'Priority booking', 'Special member offers'],
      gold: ['1.5 points per £1 spent', '10% discount on all rides', 'Priority booking', 'Free cancellation', 'Dedicated support'],
      platinum: ['2 points per £1 spent', '15% discount on all rides', 'Priority booking', 'Free cancellation', 'Dedicated support', 'Exclusive platinum rewards']
    };

    const tierColors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2'
    };

    // Generate email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Loyalty Tier Upgrade</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: ${tierColors[new_tier as keyof typeof tierColors]}; margin-bottom: 10px;">Congratulations!</h1>
          <h2 style="color: #666; font-weight: normal;">You've been upgraded to ${new_tier.charAt(0).toUpperCase() + new_tier.slice(1)} tier!</h2>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: ${tierColors[new_tier as keyof typeof tierColors]}; margin-top: 0;">Your New Status</h3>
          <p><strong>Tier:</strong> ${new_tier.charAt(0).toUpperCase() + new_tier.slice(1)}</p>
          <p><strong>Total Points:</strong> ${total_points.toLocaleString()}</p>
          <p><strong>Previous Tier:</strong> ${old_tier.charAt(0).toUpperCase() + old_tier.slice(1)}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #333;">Your ${new_tier.charAt(0).toUpperCase() + new_tier.slice(1)} Benefits</h3>
          <ul style="padding-left: 20px;">
            ${tierBenefits[new_tier as keyof typeof tierBenefits]?.map(benefit => `<li>${benefit}</li>`).join('') || ''}
          </ul>
        </div>

        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
          <p style="margin: 0; text-align: center;"><strong>Keep earning points with every ride to unlock even more rewards!</strong></p>
        </div>

        <div style="text-align: center; color: #666; font-size: 14px;">
          <p>Thank you for your continued loyalty!</p>
          <p>The Transport Team</p>
        </div>
      </body>
      </html>
    `;

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "Transport Loyalty <noreply@yourdomain.com>",
      to: [userData.user.email],
      subject: `🎉 Congratulations! You've reached ${new_tier.charAt(0).toUpperCase() + new_tier.slice(1)} tier!`,
      html: emailHtml,
    });

    if (emailResponse.error) {
      console.error('Email sending error:', emailResponse.error);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the notification
    await supabase
      .from('loyalty_transactions')
      .insert({
        loyalty_card_id: (await supabase
          .from('customer_loyalty_cards')
          .select('id')
          .eq('customer_id', customer_id)
          .single()).data?.id,
        transaction_type: 'notification',
        points: 0,
        description: `Tier upgrade notification sent: ${old_tier} → ${new_tier}`
      });

    console.log(`Tier upgrade notification sent to ${userData.user.email}: ${old_tier} → ${new_tier}`);

    return new Response(JSON.stringify({
      success: true,
      email_sent: true,
      new_tier,
      total_points
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in loyalty-tier-notification function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);