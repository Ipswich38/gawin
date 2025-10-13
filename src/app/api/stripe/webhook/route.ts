import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/config';
import { SubscriptionService } from '@/lib/stripe/subscription';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    );

    console.log(`Processing webhook: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
        await SubscriptionService.handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await SubscriptionService.handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await SubscriptionService.handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        console.log('Payment succeeded for subscription:', event.data.object.subscription);
        break;

      case 'invoice.payment_failed':
        console.log('Payment failed for subscription:', event.data.object.subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}