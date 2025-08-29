import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RedemptionRequest {
  loyalty_card_id: string;
  reward_id: string;
  points_to_redeem: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with service role for admin operations
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

    // Get user from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { loyalty_card_id, reward_id, points_to_redeem }: RedemptionRequest = await req.json();

    // Validate loyalty card belongs to user
    const { data: loyaltyCard, error: cardError } = await supabase
      .from('customer_loyalty_cards')
      .select('*')
      .eq('id', loyalty_card_id)
      .eq('customer_id', user.id)
      .single();

    if (cardError || !loyaltyCard) {
      console.error('Loyalty card error:', cardError);
      return new Response(JSON.stringify({ error: 'Loyalty card not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has enough points
    if (loyaltyCard.total_points < points_to_redeem) {
      return new Response(JSON.stringify({ error: 'Insufficient points' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get reward details
    const { data: reward, error: rewardError } = await supabase
      .from('loyalty_rewards')
      .select('*')
      .eq('id', reward_id)
      .eq('is_active', true)
      .single();

    if (rewardError || !reward) {
      console.error('Reward error:', rewardError);
      return new Response(JSON.stringify({ error: 'Reward not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify points required match
    if (reward.points_required !== points_to_redeem) {
      return new Response(JSON.stringify({ error: 'Points mismatch' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Start transaction: deduct points and create redemption record
    const { error: updateError } = await supabase
      .from('customer_loyalty_cards')
      .update({ 
        total_points: loyaltyCard.total_points - points_to_redeem,
        updated_at: new Date().toISOString()
      })
      .eq('id', loyalty_card_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update points' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Record the transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('loyalty_transactions')
      .insert({
        loyalty_card_id,
        reward_id,
        transaction_type: 'redeemed',
        points: -points_to_redeem,
        description: `Redeemed: ${reward.name}`
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      // Rollback points if transaction fails
      await supabase
        .from('customer_loyalty_cards')
        .update({ 
          total_points: loyaltyCard.total_points,
          updated_at: new Date().toISOString()
        })
        .eq('id', loyalty_card_id);

      return new Response(JSON.stringify({ error: 'Failed to record transaction' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Redemption successful: ${points_to_redeem} points for ${reward.name}`);

    return new Response(JSON.stringify({
      success: true,
      transaction_id: transaction.id,
      remaining_points: loyaltyCard.total_points - points_to_redeem,
      redeemed_reward: reward.name
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in loyalty-redemption function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);