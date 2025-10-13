import { stripe, SUBSCRIPTION_PLANS, SubscriptionTier } from './config';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];

export class SubscriptionService {
  static async createCheckoutSession(
    userId: string,
    planId: SubscriptionTier,
    successUrl: string,
    cancelUrl: string
  ): Promise<string | null> {
    try {
      const plan = SUBSCRIPTION_PLANS[planId];

      if (!plan.priceId) {
        throw new Error('Price ID not found for plan');
      }

      // Get or create Stripe customer
      const customer = await this.getOrCreateCustomer(userId);

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        line_items: [
          {
            price: plan.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        allow_promotion_codes: true,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          planId,
        },
      });

      return session.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }
  }

  static async getOrCreateCustomer(userId: string): Promise<any> {
    // Check if customer exists in our database
    const { data: user } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    // Check for existing subscription with Stripe customer ID
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .not('stripe_customer_id', 'is', null)
      .single();

    if (existingSubscription?.stripe_customer_id) {
      return await stripe.customers.retrieve(existingSubscription.stripe_customer_id);
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.full_name || undefined,
      metadata: {
        userId,
      },
    });

    return customer;
  }

  static async handleSubscriptionCreated(subscription: any): Promise<void> {
    const userId = subscription.metadata?.userId;
    const planId = subscription.metadata?.planId;

    if (!userId || !planId) {
      console.error('Missing metadata in subscription:', subscription.id);
      return;
    }

    const plan = SUBSCRIPTION_PLANS[planId as SubscriptionTier];

    // Create subscription record
    await supabase.from('subscriptions').insert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      plan_name: plan.name,
      plan_amount: plan.price * 100, // Convert to cents
      plan_currency: 'usd',
      plan_interval: 'month',
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    });

    // Update user profile
    await supabase
      .from('users')
      .update({
        subscription_tier: planId,
        credits_remaining: plan.credits,
        max_agents: plan.maxAgents,
        max_workflows: plan.maxWorkflows,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  }

  static async handleSubscriptionUpdated(subscription: any): Promise<void> {
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (!existingSub) {
      console.error('Subscription not found:', subscription.id);
      return;
    }

    // Update subscription record
    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);
  }

  static async handleSubscriptionDeleted(subscription: any): Promise<void> {
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (!existingSub) {
      console.error('Subscription not found:', subscription.id);
      return;
    }

    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    // Downgrade user to free plan
    const freePlan = SUBSCRIPTION_PLANS.free;
    await supabase
      .from('users')
      .update({
        subscription_tier: 'free',
        max_agents: freePlan.maxAgents,
        max_workflows: freePlan.maxWorkflows,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingSub.user_id);
  }

  static async getUserSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);

      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  }
}