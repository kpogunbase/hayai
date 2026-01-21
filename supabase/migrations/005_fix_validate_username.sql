-- Fix mutable search_path security warning for validate_username function
-- This prevents search_path hijacking attacks

CREATE OR REPLACE FUNCTION public.validate_username(username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
BEGIN
  -- Username must be 3-20 characters, alphanumeric and underscores only
  RETURN username ~ '^[a-zA-Z0-9_]{3,20}$';
END;
$$;
