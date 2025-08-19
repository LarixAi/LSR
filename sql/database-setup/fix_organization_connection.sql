-- =====================================================
-- FIX ORGANIZATION CONNECTION
-- =====================================================
-- This script will fix the organization connection between
-- laronelaing3@outlook.com and transport@nationalbusgroup.co.uk

-- 1. FIRST, LET'S IDENTIFY THE USERS AND THEIR ORGANIZATIONS
DO $$
DECLARE
    mechanic_user_id UUID;
    admin_user_id UUID;
    mechanic_org_id UUID;
    admin_org_id UUID;
    existing_request_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO mechanic_user_id FROM public.profiles WHERE email = 'laronelaing3@outlook.com';
    SELECT id INTO admin_user_id FROM public.profiles WHERE email = 'transport@nationalbusgroup.co.uk';
    
    -- Get organization IDs
    SELECT organization_id INTO mechanic_org_id FROM public.profiles WHERE id = mechanic_user_id;
    SELECT organization_id INTO admin_org_id FROM public.profiles WHERE id = admin_user_id;
    
    -- Check if mechanic_organization_requests table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'mechanic_organization_requests'
    ) THEN
        RAISE NOTICE 'Creating mechanic_organization_requests table...';
        
        -- Create the table
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
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(mechanic_id, organization_id)
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_mechanic_org_requests_mechanic_id ON public.mechanic_organization_requests(mechanic_id);
        CREATE INDEX IF NOT EXISTS idx_mechanic_org_requests_organization_id ON public.mechanic_organization_requests(organization_id);
        CREATE INDEX IF NOT EXISTS idx_mechanic_org_requests_status ON public.mechanic_organization_requests(status);
        
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
    END IF;
    
    -- Check if there's already a request between these users
    SELECT id INTO existing_request_id 
    FROM public.mechanic_organization_requests 
    WHERE mechanic_id = mechanic_user_id 
    AND organization_id = admin_org_id;
    
    -- If no existing request, create one
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
            'approved', -- Set to approved to establish connection immediately
            mechanic_user_id,
            'Auto-created connection to restore missing relationship'
        );
        
        RAISE NOTICE 'Created organization connection between mechanic and admin organization';
    ELSE
        RAISE NOTICE 'Connection already exists or users not found';
    END IF;
    
    -- Display the current status
    RAISE NOTICE 'Mechanic User ID: %, Admin User ID: %, Mechanic Org ID: %, Admin Org ID: %', 
        mechanic_user_id, admin_user_id, mechanic_org_id, admin_org_id;
END $$;

-- 2. VERIFY THE CONNECTION WAS CREATED
SELECT 
    'Connection verification' as check_type,
    mor.id,
    mor.status,
    mor.request_type,
    mechanic.email as mechanic_email,
    org.name as organization_name,
    requester.email as requester_email,
    mor.created_at,
    mor.approved_at
FROM public.mechanic_organization_requests mor
LEFT JOIN public.profiles mechanic ON mor.mechanic_id = mechanic.id
LEFT JOIN public.organizations org ON mor.organization_id = org.id
LEFT JOIN public.profiles requester ON mor.requested_by = requester.id
WHERE (mechanic.email IN ('laronelaing3@outlook.com', 'transport@nationalbusgroup.co.uk')
   OR requester.email IN ('laronelaing3@outlook.com', 'transport@nationalbusgroup.co.uk'))
ORDER BY mor.created_at DESC;

-- 3. SHOW CURRENT USER STATUS
SELECT 
    'Current user status' as check_type,
    p.email,
    p.role,
    p.organization_id,
    o.name as organization_name,
    CASE 
        WHEN p.role = 'mechanic' THEN 'Can request to join organizations'
        WHEN p.role = 'admin' THEN 'Can approve mechanic requests'
        ELSE 'Other role'
    END as capabilities
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.email IN ('laronelaing3@outlook.com', 'transport@nationalbusgroup.co.uk')
ORDER BY p.email;

-- =====================================================
-- FIX COMPLETE
-- =====================================================
-- This script should restore the organization connection
-- between the mechanic and admin users
