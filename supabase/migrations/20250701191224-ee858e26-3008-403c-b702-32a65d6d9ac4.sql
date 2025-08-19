
-- First, let's ensure the documents table has proper organization_id constraint
-- and update any missing organization_id values

-- Update documents table to ensure organization_id is properly set
UPDATE public.documents 
SET organization_id = (
  SELECT organization_id 
  FROM public.profiles 
  WHERE profiles.id = documents.related_entity_id
  LIMIT 1
)
WHERE organization_id IS NULL 
AND related_entity_type = 'user';

-- Make organization_id not nullable for better data integrity
ALTER TABLE public.documents 
ALTER COLUMN organization_id SET NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_organization_id 
ON public.documents(organization_id);

-- Update RLS policies for documents to enforce organization separation
DROP POLICY IF EXISTS "Drivers and admins can view documents" ON public.documents;
DROP POLICY IF EXISTS "documents_user_access" ON public.documents;

-- Create new strict organization-based policies
CREATE POLICY "Users can view documents in their organization" 
ON public.documents FOR SELECT 
USING (
  organization_id = get_user_organization_id()
);

CREATE POLICY "Users can manage documents in their organization" 
ON public.documents FOR ALL 
USING (
  (organization_id = get_user_organization_id()) AND 
  (
    -- Admin/council can manage all documents in their org
    is_organization_admin() OR 
    -- Users can manage their own documents
    related_entity_id = auth.uid()
  )
);

-- Ensure profiles table has proper organization constraint
-- Make sure every user has an organization_id
UPDATE public.profiles 
SET organization_id = (
  SELECT id FROM public.organizations 
  WHERE contact_email = profiles.email 
  OR contact_email = 'transport@transentrix.com'
  LIMIT 1
)
WHERE organization_id IS NULL 
AND role = 'admin';

-- For the specific admin account mentioned
UPDATE public.profiles 
SET organization_id = (
  SELECT id FROM public.organizations 
  WHERE contact_email = 'transportbusgroup@gmail.com'
  OR name ILIKE '%transport%'
  LIMIT 1
)
WHERE email = 'transportbusgroup@gmail.com' 
AND organization_id IS NULL;

-- Create organization for transportbusgroup@gmail.com if it doesn't exist
INSERT INTO public.organizations (name, slug, contact_email, is_active)
VALUES (
  'Transport Bus Group',
  'transport-bus-group', 
  'transportbusgroup@gmail.com',
  true
)
ON CONFLICT (contact_email) DO NOTHING;

-- Update the admin account to link to this organization
UPDATE public.profiles 
SET organization_id = (
  SELECT id FROM public.organizations 
  WHERE contact_email = 'transportbusgroup@gmail.com'
)
WHERE email = 'transportbusgroup@gmail.com';
