import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TEST-STRIPE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Test environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const envCheck = {
      stripeKey: !!stripeKey,
      supabaseUrl: !!supabaseUrl,
      supabaseServiceKey: !!supabaseServiceKey,
    };

    logStep("Environment variables check", envCheck);

    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are not configured");
    }

    // Test Stripe connection
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    try {
      const account = await stripe.accounts.retrieve();
      logStep("Stripe connection successful", { accountId: account.id });
    } catch (error) {
      logStep("Stripe connection failed", { error: error.message });
      throw new Error(`Stripe connection failed: ${error.message}`);
    }

    // Test Supabase connection
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    try {
      const { data: plans, error: plansError } = await supabaseClient
        .from('subscription_plans')
        .select('count')
        .limit(1);

      if (plansError) {
        throw plansError;
      }

      logStep("Supabase connection successful");
    } catch (error) {
      logStep("Supabase connection failed", { error: error.message });
      throw new Error(`Supabase connection failed: ${error.message}`);
    }

    // Test subscription plans
    try {
      const { data: plans, error: plansError } = await supabaseClient
        .from('subscription_plans')
        .select('*')
        .limit(10);

      if (plansError) {
        throw plansError;
      }

      logStep("Subscription plans found", { count: plans?.length || 0 });
    } catch (error) {
      logStep("Failed to fetch subscription plans", { error: error.message });
      throw new Error(`Failed to fetch subscription plans: ${error.message}`);
    }

    // Test Stripe customers
    try {
      const customers = await stripe.customers.list({ limit: 5 });
      logStep("Stripe customers found", { count: customers.data.length });
    } catch (error) {
      logStep("Failed to fetch Stripe customers", { error: error.message });
      throw new Error(`Failed to fetch Stripe customers: ${error.message}`);
    }

    // Test Stripe subscriptions
    try {
      const subscriptions = await stripe.subscriptions.list({ limit: 5 });
      logStep("Stripe subscriptions found", { count: subscriptions.data.length });
    } catch (error) {
      logStep("Failed to fetch Stripe subscriptions", { error: error.message });
      throw new Error(`Failed to fetch Stripe subscriptions: ${error.message}`);
    }

    const result = {
      success: true,
      environment: envCheck,
      stripe: {
        connected: true,
        accountId: (await stripe.accounts.retrieve()).id,
        customersCount: (await stripe.customers.list({ limit: 1 })).data.length,
        subscriptionsCount: (await stripe.subscriptions.list({ limit: 1 })).data.length,
      },
      supabase: {
        connected: true,
        plansCount: (await supabaseClient.from('subscription_plans').select('count').limit(1)).data?.length || 0,
      },
      message: "All connections successful"
    };

    logStep("Test completed successfully", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in test", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});


