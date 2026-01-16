-- Hayai Feedback Table
-- Run this in your Supabase SQL Editor

-- Feedback table (stores user feedback submissions)
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  page TEXT CHECK (page IN ('home', 'reader')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback
-- Anyone can insert feedback (including anonymous users)
CREATE POLICY "Anyone can insert feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

-- Users can read their own feedback
CREATE POLICY "Users can read own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (for admin access)
CREATE POLICY "Service role full access to feedback"
  ON feedback FOR ALL
  USING (auth.role() = 'service_role');

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);
