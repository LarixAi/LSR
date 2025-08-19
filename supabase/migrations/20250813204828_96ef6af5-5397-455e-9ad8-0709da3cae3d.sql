-- Create a simple view without security definer properties
-- The view will inherit security from the underlying tables

-- Drop any existing view
DROP VIEW IF EXISTS public.documents_with_profiles;

-- Create clean view that inherits RLS from underlying tables
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