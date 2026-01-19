-- Hayai Security Hardening Migration
-- Run this in your Supabase SQL Editor
-- This migration fixes several security vulnerabilities

-- ============================================
-- 1. FIX: Feedback table RLS policy
-- Previously allowed anyone to insert with ANY user_id
-- Now validates user_id matches authenticated user (or null for anonymous)
-- ============================================

-- Drop the insecure policy
DROP POLICY IF EXISTS "Anyone can insert feedback" ON feedback;

-- Create secure policy: user_id must match auth.uid() or be null
CREATE POLICY "Users can insert feedback with valid user_id"
  ON feedback FOR INSERT
  WITH CHECK (
    -- Allow authenticated users to submit with their own user_id
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- Allow anonymous submissions (user_id must be null)
    (auth.uid() IS NULL AND user_id IS NULL)
    OR
    -- Allow authenticated users to submit anonymously
    (auth.uid() IS NOT NULL AND user_id IS NULL)
  );

-- Add rate limiting tracking table for feedback
CREATE TABLE IF NOT EXISTS feedback_rate_limits (
  ip_hash TEXT PRIMARY KEY,
  submission_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on rate limits table
ALTER TABLE feedback_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate limits (server-side only)
CREATE POLICY "Service role only for feedback_rate_limits"
  ON feedback_rate_limits FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 2. FIX: Restrict profile visibility
-- Previously all profiles were publicly readable
-- Now only authenticated users can view profiles
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are publicly readable" ON profiles;

-- Create more restrictive policy: only authenticated users can view any profile
-- This allows displaying usernames in the app while preventing enumeration by anonymous users
CREATE POLICY "Authenticated users can view profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can always read their own profile (even if above policy changes)
CREATE POLICY "Users can always read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 3. ADD: Avatar storage bucket policies
-- Ensure proper access control for avatar uploads
-- ============================================

-- Note: Storage policies are managed differently in Supabase
-- These need to be applied via the Supabase Dashboard or using storage.objects

-- Policy definitions for reference (apply in Supabase Dashboard > Storage > Policies):
--
-- Bucket: avatars
--
-- SELECT (download):
--   Authenticated users can download any avatar (for viewing profiles)
--   Policy: (auth.role() = 'authenticated')
--
-- INSERT (upload):
--   Users can only upload to their own path (filename starts with their user_id)
--   Policy: (auth.uid()::text = (storage.foldername(name))[1])
--   OR simpler: (auth.uid() IS NOT NULL AND name LIKE auth.uid()::text || '-%')
--
-- UPDATE:
--   Users can only update their own avatars
--   Policy: (auth.uid() IS NOT NULL AND name LIKE auth.uid()::text || '-%')
--
-- DELETE:
--   Users can only delete their own avatars
--   Policy: (auth.uid() IS NOT NULL AND name LIKE auth.uid()::text || '-%')

-- Create storage policies using SQL (if supported by your Supabase version)
-- Note: This syntax may vary - verify in Supabase documentation

-- For avatars bucket - ensure it exists and is public for reads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,  -- Public bucket for avatar URLs to work
  2097152,  -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Storage policies for avatars bucket
-- Drop existing policies first
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Anyone can view avatars (needed for profile pictures to display)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload avatars with their user_id prefix
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatars
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatars
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- 4. ADD: Content validation for feedback
-- Prevent extremely long submissions
-- ============================================

-- Add check constraint for feedback content length
ALTER TABLE feedback
  DROP CONSTRAINT IF EXISTS feedback_content_length;

ALTER TABLE feedback
  ADD CONSTRAINT feedback_content_length
  CHECK (char_length(content) <= 10000);

-- ============================================
-- 5. ADD: Indexes for security-related queries
-- ============================================

-- Index for rate limit lookups
CREATE INDEX IF NOT EXISTS idx_feedback_rate_limits_window
  ON feedback_rate_limits(window_start);

-- Index for feedback by creation time (for monitoring)
CREATE INDEX IF NOT EXISTS idx_feedback_created_desc
  ON feedback(created_at DESC);

-- ============================================
-- Summary of changes:
-- 1. Feedback INSERT policy now validates user_id matches auth.uid()
-- 2. Profile SELECT restricted to authenticated users
-- 3. Avatar storage has proper upload/update/delete restrictions
-- 4. Feedback content limited to 10,000 characters
-- 5. Added indexes for security monitoring
-- ============================================
