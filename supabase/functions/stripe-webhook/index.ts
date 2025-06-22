import Stripe from 'npm:stripe@^14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    
    if (!signature) {
      return new Response('No signature provided', { status: 400 });
    }

    // Check for Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY environment variable is not set');
      return new Response('Stripe configuration error', { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      return new Response('Webhook secret not configured', { status: 500 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
          // Handle subscription creation
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          await handleSubscriptionUpdate(supabase, subscription);
        } else if (session.mode === 'payment') {
          // Handle one-time payment (lifetime access)
          await handleOneTimePayment(supabase, session);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabase, subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(supabase, invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('Webhook processed successfully', { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(`Webhook error: ${error.message}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});

async function handleSubscriptionUpdate(supabase: any, subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Find user by Stripe customer ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (profileError || !profile) {
    console.error('User not found for customer:', customerId);
    return;
  }

  const userId = profile.id;
  const status = subscription.status;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  
  // Determine premium tier based on subscription
  let premiumTier = 'premium';
  if (subscription.items.data[0]?.price?.lookup_key) {
    premiumTier = subscription.items.data[0].price.lookup_key;
  }

  // Update user profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_status: status,
      premium_access_until: status === 'active' ? currentPeriodEnd : null,
      premium_tier: status === 'active' ? premiumTier : null,
      role: status === 'active' ? 'premium' : 'free',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating user profile:', updateError);
    return;
  }

  // Update or create user subscription record
  const { error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      status: status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,stripe_subscription_id'
    });

  if (subscriptionError) {
    console.error('Error updating subscription record:', subscriptionError);
  }

  console.log(`Updated subscription for user ${userId}: ${status}`);
}

async function handleOneTimePayment(supabase: any, session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, total_spending')
    .eq('stripe_customer_id', customerId)
    .single();

  if (profileError || !profile) {
    console.error('User not found for customer:', customerId);
    return;
  }

  const userId = profile.id;
  const amountPaid = (session.amount_total || 0) / 100; // Convert from cents

  // Update user profile for lifetime access
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      premium_access_until: null, // Lifetime access
      premium_tier: 'lifetime',
      role: 'premium',
      total_spending: (profile.total_spending || 0) + amountPaid,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating user profile for lifetime access:', updateError);
  }

  console.log(`Granted lifetime access to user ${userId}`);
}

async function handleInvoicePaid(supabase: any, invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, total_spending')
    .eq('stripe_customer_id', customerId)
    .single();

  if (profileError || !profile) {
    console.error('User not found for customer:', customerId);
    return;
  }

  const userId = profile.id;
  const amountPaid = (invoice.amount_paid || 0) / 100; // Convert from cents

  // Update total spending
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      total_spending: (profile.total_spending || 0) + amountPaid,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating total spending:', updateError);
  }

  console.log(`Updated spending for user ${userId}: +$${amountPaid}`);
}

async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (profileError || !profile) {
    console.error('User not found for customer:', customerId);
    return;
  }

  const userId = profile.id;

  // Update subscription status to past_due
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating subscription status to past_due:', updateError);
  }

  console.log(`Payment failed for user ${userId}, status updated to past_due`);
}