-- Add email column to profiles table (already inserted by auth.service.js on signup)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create a helper to look up emails from auth.users (used by handleAdvance fallback)
CREATE OR REPLACE FUNCTION get_user_email(p_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT email FROM auth.users WHERE id = p_user_id;
$$;
