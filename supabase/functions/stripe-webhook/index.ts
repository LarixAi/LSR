import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Processing event", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabaseClient);
        break;
      
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabaseClient);
        break;
      
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabaseClient);
        break;
      
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabaseClient);
        break;
      
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, supabaseClient);
        break;
      
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabaseClient);
        break;
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabaseClient: any) {
  logStep("Processing checkout session completed", { sessionId: session.id });
  
  if (session.mode !== "subscription" || !session.subscription) {
    logStep("Not a subscription checkout session");
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const planId = session.metadata?.plan_id;
  const userId = session.metadata?.user_id;

  if (!customerId || !subscriptionId || !planId || !userId) {
    throw new Error("Missing required metadata");
  }

  // Get user's organization
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .single();

  if (!profile?.organization_id) {
    throw new Error("User organization not found");
  }

  // Get plan details
  const { data: plan } = await supabaseClient
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (!plan) {
    throw new Error("Plan not found");
  }

  // Create or update subscription record
  const { error } = await supabaseClient
    .from('subscriptions')
    .upsert({
      organization_id: profile.organization_id,
      plan_id: planId,
      status: 'active',
      amount: plan.price,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      start_date: new Date().toISOString(),
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      auto_renew: true,
    });

  if (error) {
    throw error;
  }

  logStep("Subscription record created/updated", { subscriptionId, organizationId: profile.organization_id });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabaseClient: any) {
  logStep("Processing subscription created", { subscriptionId: subscription.id });
  
  // This is handled by checkout.session.completed for new subscriptions
  // This handler is for subscriptions created outside of checkout
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabaseClient: any) {
  logStep("Processing subscription updated", { subscriptionId: subscription.id });
  
  const status = subscription.status === 'active' ? 'active' : 
                 subscription.status === 'canceled' ? 'cancelled' : 
                 subscription.status === 'past_due' ? 'pending' : 'expired';

  const { error } = await supabaseClient
    .from('subscriptions')
    .update({
      status: status,
      next_billing_date: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      auto_renew: subscription.cancel_at_period_end ? false : true,
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    throw error;
  }

  logStep("Subscription updated", { subscriptionId: subscription.id, status });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabaseClient: any) {
  logStep("Processing subscription deleted", { subscriptionId: subscription.id });
  
  const { error } = await supabaseClient
    .from('subscriptions')
    .update({
      status: 'cancelled',
      auto_renew: false,
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    throw error;
  }

  logStep("Subscription cancelled", { subscriptionId: subscription.id });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabaseClient: any) {
  logStep("Processing invoice payment succeeded", { invoiceId: invoice.id });
  
  if (!invoice.subscription) return;

  // Create billing history record
  const { error } = await supabaseClient
    .from('billing_history')
    .insert({
      subscription_id: invoice.subscription as string,
      amount: invoice.amount_paid / 100, // Convert from cents
      status: 'paid',
      description: invoice.description || 'Subscription payment',
      payment_method: 'Stripe',
      tax_amount: invoice.tax / 100 || 0,
      discount_amount: invoice.discount ? invoice.discount.amount_off / 100 : 0,
      stripe_invoice_id: invoice.id,
    });

  if (error) {
    throw error;
  }

  logStep("Billing history record created", { invoiceId: invoice.id });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabaseClient: any) {
  logStep("Processing invoice payment failed", { invoiceId: invoice.id });
  
  if (!invoice.subscription) return;

  // Create billing history record for failed payment
  const { error } = await supabaseClient
    .from('billing_history')
    .insert({
      subscription_id: invoice.subscription as string,
      amount: invoice.amount_due / 100, // Convert from cents
      status: 'failed',
      description: invoice.description || 'Failed subscription payment',
      payment_method: 'Stripe',
      tax_amount: invoice.tax / 100 || 0,
      discount_amount: invoice.discount ? invoice.discount.amount_off / 100 : 0,
      stripe_invoice_id: invoice.id,
    });

  if (error) {
    throw error;
  }

  logStep("Failed payment record created", { invoiceId: invoice.id });
}


