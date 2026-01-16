import { NextRequest, NextResponse } from "next/server";
import { getStripe, PRICES } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Validate environment
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Payment system is not configured" },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      console.error("NEXT_PUBLIC_SITE_URL is not configured");
      return NextResponse.json(
        { error: "Site URL is not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to subscribe" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const plan = body.plan as string;

    if (plan !== "monthly" && plan !== "yearly") {
      return NextResponse.json(
        { error: "Invalid subscription plan" },
        { status: 400 }
      );
    }

    const priceId = PRICES[plan as keyof typeof PRICES];

    if (!priceId) {
      console.error(`Price ID not configured for plan: ${plan}`);
      return NextResponse.json(
        { error: `${plan} plan is not available. Please contact support.` },
        { status: 500 }
      );
    }

    const stripe = getStripe();

    // Check if user already has a Stripe customer
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    if (!session.url) {
      console.error("Stripe session created but no URL returned");
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);

    // Handle specific Stripe errors
    if (error instanceof Error) {
      if (error.message.includes("No such price")) {
        return NextResponse.json(
          { error: "This plan is not available. Please contact support." },
          { status: 400 }
        );
      }
      if (error.message.includes("Invalid API Key")) {
        return NextResponse.json(
          { error: "Payment system configuration error" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create checkout session. Please try again." },
      { status: 500 }
    );
  }
}
