-- Add Verification Tokens Table
-- This migration creates a table for email verification and password reset tokens

-- Create verification_tokens table
CREATE TABLE IF NOT EXISTS public.verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('email_verification', 'password_reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add email verification fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON public.verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON public.verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_type ON public.verification_tokens(type);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON public.verification_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_used ON public.verification_tokens(used);

-- Enable Row Level Security
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for verification_tokens
CREATE POLICY "Users can view their own tokens" ON public.verification_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens" ON public.verification_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON public.verification_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.verification_tokens 
  WHERE expires_at < NOW() OR used = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create function to get user verification status
CREATE OR REPLACE FUNCTION public.get_user_verification_status(user_id_param UUID)
RETURNS TABLE(
  email_verified BOOLEAN,
  email_verified_at TIMESTAMPTZ,
  has_active_tokens BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.email_verified,
    p.email_verified_at,
    EXISTS (
      SELECT 1 FROM public.verification_tokens 
      WHERE user_id = user_id_param 
      AND expires_at > NOW() 
      AND used = false
    ) as has_active_tokens
  FROM public.profiles p
  WHERE p.id = user_id_param;
END;
$$;
