-- Add Sample Data for Advanced Notifications Testing
-- This creates notification messages for testing purposes

-- Create sample notification messages for existing users in the system
DO $$
DECLARE
    org_id UUID;
    admin_user_id UUID;
    user_count INTEGER;
BEGIN
    -- Get the first organization
    SELECT id INTO org_id FROM public.organizations LIMIT 1;
    
    -- Get an admin user to use as the creator
    SELECT id INTO admin_user_id FROM public.profiles WHERE role IN ('admin', 'council') LIMIT 1;
    
    -- Count existing users
    SELECT COUNT(*) INTO user_count FROM public.profiles WHERE organization_id = org_id;
    
    IF org_id IS NOT NULL AND admin_user_id IS NOT NULL THEN
        -- Insert sample notification messages for testing
        INSERT INTO public.notification_messages (
            id,
            title,
            content,
            category,
            priority,
            recipient_role,
            organization_id,
            created_by,
            created_at,
            expires_at
        ) VALUES 
        (
            gen_random_uuid(),
            'Welcome to the Fleet Management System',
            'Welcome to our advanced fleet management and notification system. This message is for all drivers.',
            'general',
            'medium',
            'driver',
            org_id,
            admin_user_id,
            NOW(),
            NOW() + INTERVAL '30 days'
        ),
        (
            gen_random_uuid(),
            'Vehicle Inspection Reminder',
            'Please remember to complete your daily vehicle inspection before starting your route.',
            'safety',
            'high',
            'driver',
            org_id,
            admin_user_id,
            NOW(),
            NOW() + INTERVAL '7 days'
        ),
        (
            gen_random_uuid(),
            'Emergency Contact Update Required',
            'Please update your emergency contact information in your profile by the end of this week.',
            'safety',
            'high',
            'driver',
            org_id,
            admin_user_id,
            NOW(),
            NOW() + INTERVAL '7 days'
        ),
        (
            gen_random_uuid(),
            'Monthly Safety Meeting',
            'Reminder: Monthly safety meeting scheduled for next Friday at 2 PM in the main conference room.',
            'meeting',
            'medium',
            'driver',
            org_id,
            admin_user_id,
            NOW(),
            NOW() + INTERVAL '14 days'
        ),
        (
            gen_random_uuid(),
            'New Route Assignment Available',
            'A new route assignment is available. Please check your schedule for details.',
            'general',
            'low',
            'driver',
            org_id,
            admin_user_id,
            NOW(),
            NOW() + INTERVAL '30 days'
        ),
        (
            gen_random_uuid(),
            'License Renewal Reminder',
            'Your commercial driver''s license expires soon. Please ensure renewal is completed before the expiration date.',
            'compliance',
            'high',
            'driver',
            org_id,
            admin_user_id,
            NOW() - INTERVAL '1 hour',
            NOW() + INTERVAL '30 days'
        ),
        (
            gen_random_uuid(),
            'Vehicle Maintenance Scheduled',
            'Your assigned vehicle is scheduled for maintenance tomorrow. Please coordinate with the maintenance team.',
            'maintenance',
            'medium',
            'driver',
            org_id,
            admin_user_id,
            NOW() - INTERVAL '2 hours',
            NOW() + INTERVAL '3 days'
        ),
        (
            gen_random_uuid(),
            'System Maintenance Notice',
            'The fleet management system will undergo maintenance this Sunday from 2 AM to 6 AM. Limited functionality during this time.',
            'system',
            'low',
            NULL, -- For all users
            org_id,
            admin_user_id,
            NOW() - INTERVAL '30 minutes',
            NOW() + INTERVAL '5 days'
        );
        
        RAISE NOTICE 'Sample notification messages created for organization: % (% existing users found)', org_id, user_count;
    ELSE
        RAISE NOTICE 'No organization or admin user found. Organization: %, Admin: %', org_id, admin_user_id;
    END IF;
END $$;

-- Show the created notifications
SELECT 
    'Sample notifications created:' as info,
    COUNT(*) as count 
FROM public.notification_messages 
WHERE title LIKE '%Fleet Management%' OR title LIKE '%Vehicle Inspection%';

-- Show recent notification messages
SELECT 
    title,
    category,
    priority,
    recipient_role,
    created_at,
    expires_at
FROM public.notification_messages 
ORDER BY created_at DESC
LIMIT 10;