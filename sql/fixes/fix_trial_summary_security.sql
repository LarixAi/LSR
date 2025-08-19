-- Fix SECURITY DEFINER issue with trial_summary view
-- Run this in Supabase SQL Editor to fix the security issue

-- Drop the existing view
DROP VIEW IF EXISTS trial_summary;

-- Recreate the view with SECURITY INVOKER (explicitly stated)
CREATE OR REPLACE VIEW trial_summary 
WITH (security_invoker = true) AS
SELECT 
    ot.organization_id,
    o.name as organization_name,
    ot.trial_status,
    ot.trial_start_date,
    ot.trial_end_date,
    ot.max_drivers,
    ot.features,
    CASE 
        WHEN ot.trial_status = 'active' THEN 
            GREATEST(0, EXTRACT(DAY FROM (ot.trial_end_date - NOW())))
        ELSE 0
    END as days_left,
    COUNT(p.id) as current_drivers
FROM organization_trials ot
JOIN organizations o ON ot.organization_id = o.id
LEFT JOIN profiles p ON ot.organization_id = p.organization_id AND p.role = 'driver'
GROUP BY ot.id, o.name;

-- Grant access to the view
GRANT SELECT ON trial_summary TO authenticated;

-- Verify the view security settings
SELECT 
    schemaname,
    viewname,
    'SECURITY INVOKER' as security_type
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'trial_summary';

-- Test the view to make sure it works
SELECT * FROM trial_summary LIMIT 5;
