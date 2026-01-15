import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
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

        if (!userId) break;

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const subData = subscription as unknown as {
          id: string;
          status: string;
          current_period_end: number;
        };

        // Upsert subscription record
        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subData.id,
            status: subData.status,
            plan,
            current_period_end: new Date(
              subData.current_period_end * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );
        break;
      }

      case "customer.subscription.updated": {
        const subUpdated = event.data.object as unknown as {
          customer: string;
          status: string;
          current_period_end: number;
        };
        const customerId = subUpdated.customer;

        // Find user by customer ID
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (existingSub) {
          await supabase
            .from("subscriptions")
            .update({
              status: subUpdated.status,
              current_period_end: new Date(
                subUpdated.current_period_end * 1000
              ).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", existingSub.user_id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subDeleted = event.data.object as unknown as { customer: string };
        const customerId = subDeleted.customer;

        // Find user by customer ID and mark as canceled
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (existingSub) {
          await supabase
            .from("subscriptions")
            .update({
              status: "canceled",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", existingSub.user_id);
        }
        break;
      }
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
