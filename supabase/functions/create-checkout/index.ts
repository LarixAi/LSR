
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    // Check if Stripe key is configured
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const { planId, isAnnual = false } = await req.json();
    if (!planId) throw new Error("Plan ID is required");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get plan details - handle both UUID and string plan IDs
    let plan;
    let planError;
    
    // First try to find by UUID
    const { data: planByUuid, error: uuidError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    if (planByUuid) {
      plan = planByUuid;
    } else {
      // If not found by UUID, try to find by name and billing cycle
      const { data: planByName, error: nameError } = await supabaseClient
        .from('subscription_plans')
        .select('*')
        .eq('name', planId.charAt(0).toUpperCase() + planId.slice(1)) // Capitalize first letter
        .eq('billing_cycle', isAnnual ? 'yearly' : 'monthly')
        .single();
      
      plan = planByName;
      planError = nameError;
    }

    if (planError || !plan) throw new Error("Plan not found");
    logStep("Plan found", { planId, planName: plan.name, billingCycle: plan.billing_cycle });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // For now, we'll use the plan price and billing cycle
    // In the future, we can add separate annual/monthly price fields
    const price = plan.price;
    const interval = isAnnual ? "year" : plan.billing_cycle;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { 
              name: plan.name,
              description: `Monthly subscription for ${plan.name} plan` 
            },
            unit_amount: Math.round(price * 100),
            recurring: { interval: interval },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/payment-result?success=true`,
      cancel_url: `${req.headers.get("origin")}/payment-result?canceled=true`,
      metadata: {
        plan_id: planId,
        user_id: user.id,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
