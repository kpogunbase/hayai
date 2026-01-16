-- Hayai Subscriptions & Usage Tables
-- Run this in your Supabase SQL Editor

-- Subscriptions table (stores Stripe subscription data)
CREATE TABLE IF NOT EXISTS subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  plan TEXT CHECK (plan IN ('monthly', 'yearly')),
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage table (tracks upload counts with period resets)
CREATE TABLE IF NOT EXISTS usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_count INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (for webhooks)
CREATE POLICY "Service role full access to subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for usage
-- Users can read their own usage
CREATE POLICY "Users can read own usage"
  ON usage FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own usage
CREATE POLICY "Users can update own usage"
  ON usage FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own usage
CREATE POLICY "Users can insert own usage"
  ON usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for webhooks)
CREATE POLICY "Service role full access to usage"
  ON usage FOR ALL
  USING (auth.role() = 'service_role');

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- If tables already exist, add missing columns
DO $$
BEGIN
  -- Add period_start to usage if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usage' AND column_name = 'period_start'
  ) THEN
    ALTER TABLE usage ADD COLUMN period_start TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;
