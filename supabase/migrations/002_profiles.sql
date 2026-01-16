-- Hayai User Profiles
-- Run this in your Supabase SQL Editor

-- Profiles table (stores username and avatar)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Anyone can read profiles (for displaying usernames/avatars)
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Function to validate username format
CREATE OR REPLACE FUNCTION validate_username(username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Username must be 3-20 characters, alphanumeric and underscores only
  RETURN username ~ '^[a-zA-Z0-9_]{3,20}$';
END;
$$ LANGUAGE plpgsql;

-- Add constraint for username format
ALTER TABLE profiles
  ADD CONSTRAINT valid_username
  CHECK (username IS NULL OR validate_username(username));

-- Create storage bucket for avatars (run this separately if it fails)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;
