-- =====================================================
-- FIX MECHANIC ORGANIZATION CONNECTION
-- =====================================================
-- This script will create the connection between the mechanic and National Bus Group

DO $$
DECLARE
    mechanic_user_id UUID;
    national_bus_group_id UUID := 'd1ad845e-8989-4563-9691-dc1b3c86c4ce';
    existing_request_id UUID;
BEGIN
    -- Get mechanic user ID
    SELECT id INTO mechanic_user_id FROM public.profiles WHERE email = 'laronelaing3@outlook.com';
    
    IF mechanic_user_id IS NULL THEN
        RAISE NOTICE 'Mechanic user not found';
        RETURN;
    END IF;
    
    -- Check if mechanic_organization_requests table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'mechanic_organization_requests'
    ) THEN
        RAISE NOTICE 'Creating mechanic_organization_requests table...';
        
        CREATE TABLE public.mechanic_organization_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            mechanic_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
            request_type TEXT NOT NULL CHECK (request_type IN ('mechanic_to_org', 'org_to_mechanic')),
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'terminated')),
            requested_by UUID NOT NULL REFERENCES public.profiles(id),
            approved_by UUID REFERENCES public.profiles(id),
            approved_at TIMESTAMP WITH TIME ZONE,
            terminated_by UUID REFERENCES public.profiles(id),
            terminated_at TIMESTAMP WITH TIME ZONE,
            termination_reason TEXT,
            message TEXT,
            response_message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE public.mechanic_organization_requests ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
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
        
        RAISE NOTICE 'Created mechanic_organization_requests table and policies';
    END IF;
    
    -- Check if there's already a request between these users
    SELECT id INTO existing_request_id 
    FROM public.mechanic_organization_requests 
    WHERE mechanic_id = mechanic_user_id 
    AND organization_id = national_bus_group_id;
    
    -- If no existing request, create one
    IF existing_request_id IS NULL THEN
        INSERT INTO public.mechanic_organization_requests (
            mechanic_id,
            organization_id,
            request_type,
            status,
            requested_by,
            message
        ) VALUES (
            mechanic_user_id,
            national_bus_group_id,
            'mechanic_to_org',
            'approved', -- Set to approved to establish connection immediately
            mechanic_user_id,
            'Auto-created connection to enable mechanic access'
        );
        RAISE NOTICE 'Created organization connection between mechanic and National Bus Group';
    ELSE
        -- Update existing request to approved status
        UPDATE public.mechanic_organization_requests 
        SET status = 'approved',
            approved_by = mechanic_user_id,
            approved_at = NOW()
        WHERE id = existing_request_id;
        RAISE NOTICE 'Updated existing request to approved status';
    END IF;
    
END $$;

-- VERIFY THE CONNECTION WAS CREATED
SELECT 
    'Verification' as check_type,
    mor.id,
    mor.mechanic_id,
    mor.organization_id,
    mor.status,
    mechanic.email as mechanic_email,
    org.name as organization_name
FROM public.mechanic_organization_requests mor
LEFT JOIN public.profiles mechanic ON mor.mechanic_id = mechanic.id
LEFT JOIN public.organizations org ON mor.organization_id = org.id
WHERE mechanic.email = 'laronelaing3@outlook.com'
AND mor.organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce'
ORDER BY mor.created_at DESC;

-- SIMULATE THE FRONTEND QUERY AGAIN
SELECT 
    'Frontend query after fix' as check_type,
    mor.id,
    mor.mechanic_id,
    mor.organization_id,
    mor.status,
    org.id as org_id,
    org.name as org_name,
    org.slug as org_slug
FROM public.mechanic_organization_requests mor
LEFT JOIN public.organizations org ON mor.organization_id = org.id
WHERE mor.mechanic_id = (SELECT id FROM public.profiles WHERE email = 'laronelaing3@outlook.com')
AND mor.status IN ('active', 'approved')
ORDER BY mor.created_at DESC;

-- =====================================================
-- CONNECTION FIXED
-- =====================================================
-- The mechanic should now be able to select the National Bus Group organization
-- Try refreshing the page and checking the organization selector
