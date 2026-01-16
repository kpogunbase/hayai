import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import Stripe from "stripe";

// Type for subscription with period end (the SDK types may not include all fields)
interface SubscriptionWithPeriod {
  id: string;
  status: string;
  customer: string;
  current_period_end?: number;
  items?: {
    data: Array<{
      current_period_end?: number;
    }>;
  };
}

function getSubscriptionPeriodEnd(subscription: SubscriptionWithPeriod): number {
  // Try direct property first
  if (subscription.current_period_end) {
    return subscription.current_period_end;
  }
  // Fall back to first item's period end
  if (subscription.items?.data?.[0]?.current_period_end) {
    return subscription.items.data[0].current_period_end;
  }
  // Default to 30 days from now
  return Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("Webhook: No signature provided");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const plan = session.metadata?.plan as "monthly" | "yearly";

        if (!userId) {
          console.error("Webhook: No user ID in session metadata");
          break;
        }

        if (!session.subscription) {
          console.error("Webhook: No subscription ID in session");
          break;
        }

        // Get subscription details
        const subscriptionData = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const subWithPeriod = subscriptionData as unknown as SubscriptionWithPeriod;

        // Upsert subscription record
        const { error: upsertError } = await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subWithPeriod.id,
            status: subWithPeriod.status,
            plan,
            current_period_end: new Date(
              getSubscriptionPeriodEnd(subWithPeriod) * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

        if (upsertError) {
          console.error("Webhook: Failed to upsert subscription:", upsertError);
        } else {
          console.log(`Webhook: Subscription created for user ${userId}, plan: ${plan}`);
        }

        // Reset usage count for the new subscription period
        await supabase.from("usage").upsert(
          {
            user_id: userId,
            upload_count: 0,
            period_start: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as unknown as SubscriptionWithPeriod;
        const customerId = subscription.customer;

        // Find user by customer ID
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (existingSub) {
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update({
              status: subscription.status,
              current_period_end: new Date(
                getSubscriptionPeriodEnd(subscription) * 1000
              ).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", existingSub.user_id);

          if (updateError) {
            console.error("Webhook: Failed to update subscription:", updateError);
          } else {
            console.log(`Webhook: Subscription updated for user ${existingSub.user_id}`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as unknown as SubscriptionWithPeriod;
        const customerId = subscription.customer;

        // Find user by customer ID and mark as canceled
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (existingSub) {
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update({
              status: "canceled",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", existingSub.user_id);

          if (updateError) {
            console.error("Webhook: Failed to cancel subscription:", updateError);
          } else {
            console.log(`Webhook: Subscription canceled for user ${existingSub.user_id}`);
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        // Handle successful recurring payment - reset usage for monthly subscribers
        const invoice = event.data.object as unknown as {
          billing_reason: string;
          subscription: string | null;
        };

        if (invoice.billing_reason === "subscription_cycle" && invoice.subscription) {
          const subscriptionData = await stripe.subscriptions.retrieve(
            invoice.subscription
          );
          const subWithPeriod = subscriptionData as unknown as SubscriptionWithPeriod;
          const customerId = subWithPeriod.customer;

          const { data: existingSub } = await supabase
            .from("subscriptions")
            .select("user_id, plan")
            .eq("stripe_customer_id", customerId)
            .single();

          if (existingSub && existingSub.plan === "monthly") {
            // Reset usage for new billing period
            await supabase.from("usage").upsert(
              {
                user_id: existingSub.user_id,
                upload_count: 0,
                period_start: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                onConflict: "user_id",
              }
            );
            console.log(`Webhook: Usage reset for monthly user ${existingSub.user_id}`);
          }
        }
        break;
      }

      default:
        // Unhandled event type
        console.log(`Webhook: Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
