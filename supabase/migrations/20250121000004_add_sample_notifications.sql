-- Add sample notification data for testing
-- This migration adds some sample notifications to demonstrate the system

-- Insert sample notifications for testing
INSERT INTO public.notifications (user_id, type, title, message, read, action_url, created_at) 
SELECT 
  p.id as user_id,
  CASE 
    WHEN p.role = 'admin' THEN 'info'
    WHEN p.role = 'driver' THEN 'success'
    ELSE 'warning'
  END as type,
  CASE 
    WHEN p.role = 'admin' THEN 'System Update Available'
    WHEN p.role = 'driver' THEN 'Route Assignment'
    ELSE 'Account Verification'
  END as title,
  CASE 
    WHEN p.role = 'admin' THEN 'A new system update is available. Please review the changes and schedule deployment.'
    WHEN p.role = 'driver' THEN 'You have been assigned to route LSR-001 for tomorrow. Please review the schedule.'
    ELSE 'Please complete your account verification to access all features.'
  END as message,
  false as read,
  CASE 
    WHEN p.role = 'admin' THEN '/system-updates'
    WHEN p.role = 'driver' THEN '/driver/schedule'
    ELSE '/profile'
  END as action_url,
  now() - interval '1 day' as created_at
FROM public.profiles p
WHERE p.role IN ('admin', 'driver', 'council')
LIMIT 10;

-- Add a few more recent notifications
INSERT INTO public.notifications (user_id, type, title, message, read, action_url, created_at) 
SELECT 
  p.id as user_id,
  'success' as type,
  'Welcome to LSR Transport' as title,
  'Welcome to LSR Transport Management System. Your account has been successfully activated.' as message,
  false as read,
  '/dashboard' as action_url,
  now() - interval '2 hours' as created_at
FROM public.profiles p
WHERE p.role IN ('admin', 'driver', 'council')
LIMIT 5;
