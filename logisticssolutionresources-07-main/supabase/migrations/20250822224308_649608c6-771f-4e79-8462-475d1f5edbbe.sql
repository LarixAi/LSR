-- Add sample notification data for testing using only basic columns
-- Insert a few simple notifications to test the system

DO $$
DECLARE
    org_id UUID;
    admin_user_id UUID;
BEGIN
    -- Get the first organization
    SELECT id INTO org_id FROM public.organizations LIMIT 1;
    
    -- Get an admin user to use as the creator  
    SELECT id INTO admin_user_id FROM public.profiles WHERE role IN ('admin', 'council') LIMIT 1;
    
    -- Only proceed if we have both organization and admin user
    IF org_id IS NOT NULL AND admin_user_id IS NOT NULL THEN
        -- Try to insert a simple notification first to test the table structure
        INSERT INTO public.notification_messages (
            title,
            organization_id,
            created_by
        ) VALUES (
            'Test Notification - Driver Communication',
            org_id,
            admin_user_id
        );
        
        RAISE NOTICE 'Test notification created successfully';
    ELSE
        RAISE NOTICE 'Missing requirements - Org: %, Admin: %', org_id, admin_user_id;
    END IF;
END $$;

-- Check our notifications
SELECT COUNT(*) as total_notifications FROM public.notification_messages;