-- Check for duplicate trial records
-- Run this in Supabase SQL Editor to diagnose the issue

-- Check all trial records
SELECT 
    id,
    organization_id,
    trial_status,
    trial_start_date,
    trial_end_date,
    created_at
FROM organization_trials
ORDER BY organization_id, created_at DESC;

-- Check for duplicate organization_ids
SELECT 
    organization_id,
    COUNT(*) as record_count
FROM organization_trials
GROUP BY organization_id
HAVING COUNT(*) > 1
ORDER BY record_count DESC;

-- Check specific organization (replace with your org ID)
-- SELECT 
--     id,
--     organization_id,
--     trial_status,
--     trial_start_date,
--     trial_end_date,
--     created_at
-- FROM organization_trials
-- WHERE organization_id = 'your-organization-id-here'
-- ORDER BY created_at DESC;
