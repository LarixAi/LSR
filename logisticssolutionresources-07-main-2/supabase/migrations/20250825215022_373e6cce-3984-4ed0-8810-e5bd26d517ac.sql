-- Add User Agreement Fields to Profiles Table
-- This migration adds user agreement tracking to the profiles table

-- Add user agreement fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_version TEXT,
ADD COLUMN IF NOT EXISTS privacy_policy_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_policy_accepted_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS privacy_policy_version TEXT;

-- Create user_agreements table to manage agreement versions
CREATE TABLE IF NOT EXISTS public.user_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_type TEXT NOT NULL CHECK (agreement_type IN ('terms_of_service', 'privacy_policy')),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agreement_type, version)
);

-- Create user_agreement_acceptances table to track individual acceptances
CREATE TABLE IF NOT EXISTS public.user_agreement_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agreement_id UUID NOT NULL REFERENCES public.user_agreements(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  UNIQUE(user_id, agreement_id)
);

-- Insert default agreements
INSERT INTO public.user_agreements (agreement_type, version, title, content) VALUES
(
  'terms_of_service',
  '1.0.0',
  'Terms of Service',
  '## Terms of Service

### 1. Acceptance of Terms
By accessing and using the LSR Transport Management System (TMS), you accept and agree to be bound by the terms and provision of this agreement.

### 2. Use License
Permission is granted to temporarily download one copy of the materials (information or software) on LSR TMS for personal, non-commercial transitory viewing only.

### 3. Disclaimer
The materials on LSR TMS are provided on an ''as is'' basis. LSR TMS makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

### 4. Limitations
In no event shall LSR TMS or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on LSR TMS.

### 5. Revisions and Errata
The materials appearing on LSR TMS could include technical, typographical, or photographic errors. LSR TMS does not warrant that any of the materials on its website are accurate, complete or current.

### 6. Links
LSR TMS has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by LSR TMS of the site.

### 7. Modifications
LSR TMS may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these Terms and Conditions of Use.

### 8. Governing Law
Any claim relating to LSR TMS shall be governed by the laws of the United Kingdom without regard to its conflict of law provisions.'
),
(
  'privacy_policy',
  '1.0.0',
  'Privacy Policy',
  '## Privacy Policy

### 1. Information We Collect
We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.

### 2. How We Use Your Information
We use the information we collect to:
- Provide, maintain, and improve our services
- Process transactions and send related information
- Send technical notices, updates, security alerts, and support messages
- Respond to your comments, questions, and customer service requests

### 3. Information Sharing
We do not share, sell, or otherwise disclose your personal information for purposes other than those outlined in this Privacy Policy.

### 4. Data Security
We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure.

### 5. Data Retention
We will retain your information for as long as your account is active or as needed to provide you services.

### 6. Your Rights
You have the right to:
- Access your personal information
- Correct inaccurate personal information
- Request deletion of your personal information
- Object to processing of your personal information

### 7. Changes to This Policy
We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.

### 8. Contact Us
If you have any questions about this Privacy Policy, please contact us.'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_agreements_type_version ON public.user_agreements(agreement_type, version);
CREATE INDEX IF NOT EXISTS idx_user_agreement_acceptances_user_id ON public.user_agreement_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agreement_acceptances_agreement_id ON public.user_agreement_acceptances(agreement_id);

-- Enable Row Level Security
ALTER TABLE public.user_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_agreement_acceptances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_agreements (read-only for all authenticated users)
CREATE POLICY "Users can view active agreements" ON public.user_agreements
  FOR SELECT USING (is_active = true);

-- Create RLS policies for user_agreement_acceptances
CREATE POLICY "Users can view their own acceptances" ON public.user_agreement_acceptances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own acceptances" ON public.user_agreement_acceptances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to get latest agreement version
CREATE OR REPLACE FUNCTION public.get_latest_agreement_version(agreement_type_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  latest_version TEXT;
BEGIN
  SELECT version INTO latest_version
  FROM public.user_agreements
  WHERE agreement_type = agreement_type_param
    AND is_active = true
  ORDER BY effective_date DESC
  LIMIT 1;
  
  RETURN latest_version;
END;
$$;

-- Create function to check if user needs to accept agreements
CREATE OR REPLACE FUNCTION public.check_user_agreement_status(user_id_param UUID)
RETURNS TABLE(
  needs_terms_acceptance BOOLEAN,
  needs_privacy_acceptance BOOLEAN,
  latest_terms_version TEXT,
  latest_privacy_version TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  latest_terms TEXT;
  latest_privacy TEXT;
  user_terms_version TEXT;
  user_privacy_version TEXT;
BEGIN
  -- Get latest versions
  SELECT get_latest_agreement_version('terms_of_service') INTO latest_terms;
  SELECT get_latest_agreement_version('privacy_policy') INTO latest_privacy;
  
  -- Get user's accepted versions
  SELECT terms_version, privacy_policy_version 
  INTO user_terms_version, user_privacy_version
  FROM public.profiles 
  WHERE id = user_id_param;
  
  RETURN QUERY
  SELECT 
    (latest_terms IS NOT NULL AND (user_terms_version IS NULL OR user_terms_version != latest_terms)) as needs_terms_acceptance,
    (latest_privacy IS NOT NULL AND (user_privacy_version IS NULL OR user_privacy_version != latest_privacy)) as needs_privacy_acceptance,
    latest_terms,
    latest_privacy;
END;
$$;