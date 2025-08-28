import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QRValidationRequest {
  qr_data: string;
  action?: 'validate' | 'scan' | 'redeem';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { qr_data, action = 'validate' }: QRValidationRequest = await req.json();

    // Parse QR code data
    let qrDataParsed;
    try {
      qrDataParsed = JSON.parse(qr_data);
    } catch (parseError) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Invalid QR code format' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate QR code structure
    if (!qrDataParsed.type || qrDataParsed.type !== 'loyalty_card' || !qrDataParsed.loyalty_code) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Invalid loyalty QR code' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find loyalty card by code
    const { data: loyaltyCard, error: cardError } = await supabase
      .from('customer_loyalty_cards')
      .select(`
        *,
        customer_profiles!inner(*)
      `)
      .eq('loyalty_code', qrDataParsed.loyalty_code)
      .single();

    if (cardError || !loyaltyCard) {
      console.error('Loyalty card lookup error:', cardError);
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Loyalty card not found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get recent transactions for this card
    const { data: recentTransactions, error: transactionError } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('loyalty_card_id', loyaltyCard.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (transactionError) {
      console.error('Transaction lookup error:', transactionError);
    }

    // Log the scan/validation event
    await supabase
      .from('loyalty_transactions')
      .insert({
        loyalty_card_id: loyaltyCard.id,
        transaction_type: 'scanned',
        points: 0,
        description: `QR code ${action} at ${new Date().toISOString()}`
      });

    console.log(`QR code ${action} successful for loyalty code: ${qrDataParsed.loyalty_code}`);

    const response = {
      valid: true,
      loyalty_card: {
        id: loyaltyCard.id,
        loyalty_code: loyaltyCard.loyalty_code,
        total_points: loyaltyCard.total_points,
        tier: loyaltyCard.tier,
        customer_id: loyaltyCard.customer_id
      },
      customer_info: loyaltyCard.customer_profiles ? {
        company_name: loyaltyCard.customer_profiles.company_name,
        phone: loyaltyCard.customer_profiles.phone
      } : null,
      recent_transactions: recentTransactions || [],
      scanned_at: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in qr-code-validation function:', error);
    return new Response(JSON.stringify({ 
      valid: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);