import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-STRIPE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get all subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      status: 'all',
      expand: ['data.customer', 'data.items.data.price.product']
    });

    logStep("Found subscriptions", { count: subscriptions.data.length });

    let syncedCount = 0;
    let errorCount = 0;

    for (const subscription of subscriptions.data) {
      try {
        const customer = subscription.customer as Stripe.Customer;
        if (!customer.email) continue;

        // Find user by email
        const { data: users } = await supabaseClient.auth.admin.listUsers();
        const user = users.users.find(u => u.email === customer.email);
        
        if (!user) {
          logStep("User not found", { email: customer.email });
          continue;
        }

        // Get user's organization
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (!profile?.organization_id) {
          logStep("Organization not found", { userId: user.id });
          continue;
        }

        // Get the first item (assuming one subscription per customer)
        const item = subscription.items.data[0];
        if (!item?.price?.product) continue;

        const product = item.price.product as Stripe.Product;
        
        // Find matching plan by name
        const { data: plan } = await supabaseClient
          .from('subscription_plans')
          .select('*')
          .eq('name', product.name)
          .eq('billing_cycle', item.price.recurring?.interval || 'monthly')
          .single();

        if (!plan) {
          logStep("Plan not found", { productName: product.name });
          continue;
        }

        // Map Stripe status to our status
        const status = subscription.status === 'active' ? 'active' : 
                      subscription.status === 'canceled' ? 'cancelled' : 
                      subscription.status === 'past_due' ? 'pending' : 'expired';

        // Create or update subscription record
        const { error } = await supabaseClient
          .from('subscriptions')
          .upsert({
            organization_id: profile.organization_id,
            plan_id: plan.id,
            status: status,
            amount: plan.price,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customer.id,
            start_date: new Date(subscription.start_date * 1000).toISOString(),
            next_billing_date: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
            auto_renew: !subscription.cancel_at_period_end,
          });

        if (error) {
          logStep("Error updating subscription", { error: error.message, subscriptionId: subscription.id });
          errorCount++;
        } else {
          syncedCount++;
          logStep("Subscription synced", { subscriptionId: subscription.id, organizationId: profile.organization_id });
        }

      } catch (error) {
        logStep("Error processing subscription", { error: error.message, subscriptionId: subscription.id });
        errorCount++;
      }
    }

    logStep("Sync completed", { synced: syncedCount, errors: errorCount });

    return new Response(JSON.stringify({ 
      success: true, 
      synced: syncedCount, 
      errors: errorCount,
      total: subscriptions.data.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in sync", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});



