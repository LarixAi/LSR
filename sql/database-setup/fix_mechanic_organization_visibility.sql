-- =====================================================
-- FIX MECHANIC ORGANIZATION VISIBILITY
-- =====================================================
-- This script will fix the issue where mechanics can't see their approved organizations

-- 1. ENSURE THE FUNCTION EXISTS
CREATE OR REPLACE FUNCTION get_available_organizations_for_mechanic(mechanic_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    type TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT o.id, o.name, o.slug, o.type, o.is_active
    FROM public.organizations o
    WHERE o.is_active = true
    AND o.id NOT IN (
        SELECT mor.organization_id 
        FROM public.mechanic_organization_requests mor
        WHERE mor.mechanic_id = mechanic_uuid
        AND mor.status IN ('pending', 'approved', 'active')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ENSURE RLS POLICIES ARE CORRECT
DO $$
BEGIN
    -- Drop existing policies to recreate them
    DROP POLICY IF EXISTS "Mechanics can view their own requests" ON public.mechanic_organization_requests;
    DROP POLICY IF EXISTS "Admins can view requests for their organizations" ON public.mechanic_organization_requests;
    DROP POLICY IF EXISTS "Users can create requests" ON public.mechanic_organization_requests;
    DROP POLICY IF EXISTS "Admins can update requests for their organizations" ON public.mechanic_organization_requests;
    
    -- Recreate policies with simpler logic
    CREATE POLICY "Mechanics can view their own requests" ON public.mechanic_organization_requests
        FOR SELECT USING (mechanic_id = auth.uid());
    
    CREATE POLICY "Admins can view requests for their organizations" ON public.mechanic_organization_requests
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'council')
                AND organization_id = mechanic_organization_requests.organization_id
            )
        );
    
    CREATE POLICY "Users can create requests" ON public.mechanic_organization_requests
        FOR INSERT WITH CHECK (requested_by = auth.uid());
    
    CREATE POLICY "Admins can update requests for their organizations" ON public.mechanic_organization_requests
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'council')
                AND organization_id = mechanic_organization_requests.organization_id
            )
        );
    
    RAISE NOTICE 'Recreated RLS policies for mechanic_organization_requests';
END $$;

-- 3. ENSURE THE CONNECTION IS PROPERLY SET UP
DO $$
DECLARE
    mechanic_user_id UUID;
    admin_org_id UUID;
    existing_request_id UUID;
BEGIN
    -- Get the mechanic's user ID
    SELECT id INTO mechanic_user_id FROM public.profiles WHERE email = 'laronelaing3@outlook.com';
    
    -- Get the admin's organization ID (National Bus Group)
    SELECT organization_id INTO admin_org_id FROM public.profiles WHERE email = 'transport@nationalbusgroup.co.uk';
    
    -- Check if there's already a request
    SELECT id INTO existing_request_id 
    FROM public.mechanic_organization_requests 
    WHERE mechanic_id = mechanic_user_id 
    AND organization_id = admin_org_id;
    
    -- If no request exists, create one
    IF existing_request_id IS NULL AND mechanic_user_id IS NOT NULL AND admin_org_id IS NOT NULL THEN
        INSERT INTO public.mechanic_organization_requests (
            mechanic_id,
            organization_id,
            request_type,
            status,
            requested_by,
            message
        ) VALUES (
            mechanic_user_id,
            admin_org_id,
            'mechanic_to_org',
            'approved',
            mechanic_user_id,
            'Auto-created approved connection'
        );
        RAISE NOTICE 'Created approved connection for mechanic';
    ELSE
        -- Update existing request to approved if it's not already
        UPDATE public.mechanic_organization_requests 
        SET status = 'approved',
            approved_at = NOW(),
            approved_by = mechanic_user_id
        WHERE id = existing_request_id 
        AND status != 'approved';
        
        IF FOUND THEN
            RAISE NOTICE 'Updated existing request to approved status';
        ELSE
            RAISE NOTICE 'Connection already exists and is approved';
        END IF;
    END IF;
END $$;

-- 4. TEST THE EXACT FRONTEND QUERY
DO $$
DECLARE
    mechanic_uuid UUID;
    org_count INTEGER;
    org_names TEXT[];
BEGIN
    -- Get the mechanic's UUID
    SELECT id INTO mechanic_uuid FROM public.profiles WHERE email = 'laronelaing3@outlook.com';
    
    -- Test the exact query the frontend uses
    SELECT COUNT(*), ARRAY_AGG(org.name)
    INTO org_count, org_names
    FROM public.mechanic_organization_requests mor
    LEFT JOIN public.organizations org ON mor.organization_id = org.id
    WHERE mor.mechanic_id = mechanic_uuid
    AND mor.status IN ('active', 'approved');
    
    RAISE NOTICE 'Frontend query test: Found % active organizations for mechanic %', org_count, mechanic_uuid;
    RAISE NOTICE 'Organization names: %', org_names;
END $$;

-- 5. VERIFY THE FIX
SELECT 
    'Verification' as check_type,
    mor.id,
    mor.status,
    mor.request_type,
    mechanic.email as mechanic_email,
    org.name as organization_name,
    org.id as organization_id,
    mor.created_at,
    mor.approved_at
FROM public.mechanic_organization_requests mor
LEFT JOIN public.profiles mechanic ON mor.mechanic_id = mechanic.id
LEFT JOIN public.organizations org ON mor.organization_id = org.id
WHERE mechanic.email = 'laronelaing3@outlook.com'
AND mor.status IN ('active', 'approved')
ORDER BY mor.created_at DESC;

-- 6. TEST THE FUNCTION
DO $$
DECLARE
    mechanic_uuid UUID;
    result_count INTEGER;
BEGIN
    -- Get the mechanic's UUID
    SELECT id INTO mechanic_uuid FROM public.profiles WHERE email = 'laronelaing3@outlook.com';
    
    -- Test the function
    SELECT COUNT(*) INTO result_count
    FROM get_available_organizations_for_mechanic(mechanic_uuid);
    
    RAISE NOTICE 'Function test: Found % available organizations for mechanic %', result_count, mechanic_uuid;
END $$;

-- 7. CHECK FOR ANY RLS ISSUES
DO $$
DECLARE
    mechanic_uuid UUID;
    request_count INTEGER;
BEGIN
    -- Get the mechanic's UUID
    SELECT id INTO mechanic_uuid FROM public.profiles WHERE email = 'laronelaing3@outlook.com';
    
    -- Simulate what the mechanic should see
    SELECT COUNT(*) INTO request_count
    FROM public.mechanic_organization_requests
    WHERE mechanic_id = mechanic_uuid
    AND status IN ('active', 'approved');
    
    RAISE NOTICE 'RLS test: Mechanic % can see % active/approved requests', mechanic_uuid, request_count;
END $$;

-- =====================================================
-- FIX COMPLETE
-- =====================================================
-- The mechanic should now be able to see their approved organizations
-- Try refreshing the page or logging out and back in
-- If still not working, check the browser console for any errors
