-- Fix security issues with documents view
-- Remove security definer properties and use proper RLS instead

-- Drop the problematic view
DROP VIEW IF EXISTS public.documents_with_profiles;

-- Recreate the view without security definer
CREATE VIEW public.documents_with_profiles AS
SELECT 
  d.id,
  d.name,
  d.type,
  d.category,
  d.status,
  d.uploaded_at,
  d.created_at as upload_date,
  d.expiry_date,
  d.related_entity_type,
  d.related_entity_id,
  d.organization_id,
  d.file_size,
  d.file_path,
  jsonb_build_object(
    'first_name', p.first_name,
    'last_name', p.last_name
  ) as profiles
FROM public.documents d
LEFT JOIN public.profiles p ON d.uploaded_by = p.id;

-- Apply proper RLS to the view
ALTER VIEW public.documents_with_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the view
CREATE POLICY "documents_with_profiles_org_access" 
ON public.documents_with_profiles
FOR SELECT 
USING (organization_id IN (
  SELECT profiles.organization_id
  FROM profiles
  WHERE profiles.id = auth.uid()
));