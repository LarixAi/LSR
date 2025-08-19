-- CRITICAL SECURITY FIX: Drop and recreate secure functions
-- Drop existing functions and views to implement proper security

-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_dashboard_stats();

-- Drop the views with CASCADE
DROP VIEW IF EXISTS public.dashboard_stats CASCADE;
DROP VIEW IF EXISTS public.documents_with_profiles CASCADE;

-- Create a new secure dashboard stats function with admin-only access
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE (
  active_drivers bigint,
  active_vehicles bigint,
  active_jobs bigint,
  active_routes bigint,
  unread_notifications integer,
  maintenance_alerts integer,
  compliance_issues bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
BEGIN
  -- CRITICAL: Only allow admin/council/super_admin access
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE((SELECT COUNT(*) FROM public.profiles WHERE role = 'driver' AND is_active = true), 0)::bigint,
    COALESCE((SELECT COUNT(*) FROM public.vehicles WHERE is_active = true), 0)::bigint,
    COALESCE((SELECT COUNT(*) FROM public.jobs WHERE status IN ('assigned', 'in_progress')), 0)::bigint,
    COALESCE((SELECT COUNT(*) FROM public.routes WHERE is_active = true), 0)::bigint,
    0::integer,
    0::integer,
    COALESCE((SELECT COUNT(*) FROM public.compliance_violations WHERE status = 'open'), 0)::bigint;
END;
$$;

-- Create a secure function for documents with profiles (organization-scoped)
CREATE OR REPLACE FUNCTION public.get_documents_with_profiles()
RETURNS TABLE (
  id uuid,
  name text,
  file_path text,
  type text,
  category text,
  status text,
  related_entity_type text,
  related_entity_id uuid,
  organization_id uuid,
  file_size integer,
  expiry_date timestamptz,
  uploaded_at timestamptz,
  upload_date timestamptz,
  profiles jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_org_id uuid;
BEGIN
  -- CRITICAL: Get user's organization ID and enforce organization-based access
  SELECT p.organization_id INTO user_org_id
  FROM public.profiles p
  WHERE p.id = auth.uid();

  IF user_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied: User not found or not associated with an organization';
  END IF;

  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.file_path,
    d.type,
    d.category,
    d.status,
    d.related_entity_type,
    d.related_entity_id,
    d.organization_id,
    d.file_size,
    d.expiry_date,
    d.uploaded_at,
    d.uploaded_at as upload_date,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'first_name', p.first_name,
          'last_name', p.last_name,
          'email', p.email
        )
      )
      FROM public.profiles p 
      WHERE p.id = d.uploaded_by),
      '[]'::jsonb
    ) as profiles
  FROM public.documents d
  WHERE d.organization_id = user_org_id;  -- CRITICAL: Organization filtering
END;
$$;

-- Grant execute permissions only to authenticated users
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_documents_with_profiles() TO authenticated;

-- Revoke any public access
REVOKE ALL ON FUNCTION public.get_dashboard_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_documents_with_profiles() FROM PUBLIC;