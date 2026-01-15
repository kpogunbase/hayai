import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return stripeInstance;
}

// Export for backwards compatibility
export const stripe = {
  get checkout() {
    return getStripe().checkout;
  },
  get customers() {
    return getStripe().customers;
  },
  get subscriptions() {
    return getStripe().subscriptions;
  },
  get billingPortal() {
    return getStripe().billingPortal;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
};

export const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || "",
  yearly: process.env.STRIPE_PRICE_YEARLY || "",
};

export const PRICE_AMOUNTS = {
  monthly: 299, // $2.99
  yearly: 2000, // $20.00
};
