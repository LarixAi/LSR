-- CRITICAL FIX: Remove Security Definer Views that bypass RLS
-- These views are a major security vulnerability

-- 1. Drop existing Security Definer Views that bypass RLS
DROP VIEW IF EXISTS public.expiring_licenses CASCADE;
DROP VIEW IF EXISTS public.license_statistics CASCADE;
DROP VIEW IF EXISTS public.notification_stats CASCADE;
DROP VIEW IF EXISTS public.rail_replacement_summary CASCADE;
DROP VIEW IF EXISTS public.school_routes_summary CASCADE;
DROP VIEW IF EXISTS public.school_routes_with_students CASCADE;

-- 2. Replace with secure functions that respect RLS and organization boundaries

-- Secure function for expiring licenses (replaces view)
CREATE OR REPLACE FUNCTION public.get_expiring_licenses(org_id uuid DEFAULT NULL)
RETURNS TABLE(
    id uuid,
    driver_id uuid, 
    license_number text,
    license_type text,
    issuing_authority text,
    issue_date date,
    expiry_date date,
    status text,
    license_class text,
    endorsements text[],
    restrictions text[],
    points_balance integer,
    last_updated timestamp with time zone,
    notes text,
    organization_id uuid,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    medical_certificate_expiry date,
    background_check_expiry date,
    drug_test_expiry date,
    training_expiry date,
    first_name text,
    last_name text,
    email text,
    phone text,
    organization_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    target_org_id uuid;
BEGIN
    -- Get user's organization if not specified
    IF org_id IS NULL THEN
        SELECT organization_id INTO target_org_id
        FROM public.profiles
        WHERE id = auth.uid();
    ELSE
        target_org_id := org_id;
        
        -- Verify user has access to this organization
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (organization_id = target_org_id OR role IN ('admin', 'super_admin'))
        ) THEN
            RAISE EXCEPTION 'Access denied to organization data';
        END IF;
    END IF;

    RETURN QUERY
    SELECT 
        dl.id,
        dl.driver_id,
        dl.license_number,
        dl.license_type,
        dl.issuing_authority,
        dl.issue_date,
        dl.expiry_date,
        dl.status,
        dl.license_class,
        dl.endorsements,
        dl.restrictions,
        dl.points_balance,
        dl.updated_at as last_updated,
        dl.notes,
        dl.organization_id,
        dl.created_at,
        dl.updated_at,
        dl.medical_certificate_expiry,
        dl.background_check_expiry,
        dl.drug_test_expiry,
        dl.training_expiry,
        p.first_name,
        p.last_name,
        p.email,
        p.phone,
        o.name AS organization_name
    FROM public.driver_licenses dl
    JOIN public.profiles p ON dl.driver_id = p.id
    JOIN public.organizations o ON dl.organization_id = o.id
    WHERE dl.organization_id = target_org_id
    AND dl.status = 'active'
    AND dl.expiry_date <= (CURRENT_DATE + INTERVAL '30 days')
    AND dl.expiry_date >= CURRENT_DATE
    ORDER BY dl.expiry_date ASC;
END;
$function$;

-- Secure function for license statistics (replaces view)
CREATE OR REPLACE FUNCTION public.get_license_statistics(org_id uuid DEFAULT NULL)
RETURNS TABLE(
    organization_id uuid,
    total_licenses bigint,
    active_licenses bigint,
    expired_licenses bigint,
    suspended_licenses bigint,
    revoked_licenses bigint,
    expiring_soon bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    target_org_id uuid;
BEGIN
    -- Get user's organization if not specified
    IF org_id IS NULL THEN
        SELECT organization_id INTO target_org_id
        FROM public.profiles
        WHERE id = auth.uid();
    ELSE
        target_org_id := org_id;
        
        -- Verify user has access to this organization
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (organization_id = target_org_id OR role IN ('admin', 'super_admin'))
        ) THEN
            RAISE EXCEPTION 'Access denied to organization data';
        END IF;
    END IF;

    RETURN QUERY
    SELECT 
        target_org_id,
        COUNT(*) AS total_licenses,
        COUNT(*) FILTER (WHERE status = 'active') AS active_licenses,
        COUNT(*) FILTER (WHERE status = 'expired') AS expired_licenses,
        COUNT(*) FILTER (WHERE status = 'suspended') AS suspended_licenses,
        COUNT(*) FILTER (WHERE status = 'revoked') AS revoked_licenses,
        COUNT(*) FILTER (WHERE status = 'active' AND expiry_date <= (CURRENT_DATE + INTERVAL '30 days')) AS expiring_soon
    FROM public.driver_licenses
    WHERE driver_licenses.organization_id = target_org_id;
END;
$function$;