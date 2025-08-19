-- Clean up duplicate trial records
-- Run this in Supabase SQL Editor to fix duplicate records

-- First, let's see what duplicates exist
WITH duplicate_trials AS (
  SELECT 
    organization_id,
    COUNT(*) as record_count
  FROM organization_trials
  GROUP BY organization_id
  HAVING COUNT(*) > 1
)
SELECT * FROM duplicate_trials;

-- If duplicates exist, keep only the most recent trial per organization
-- This will delete older duplicate records
DELETE FROM organization_trials 
WHERE id NOT IN (
  SELECT DISTINCT ON (organization_id) id
  FROM organization_trials
  ORDER BY organization_id, created_at DESC
);

-- Verify cleanup worked
SELECT 
    organization_id,
    COUNT(*) as record_count
FROM organization_trials
GROUP BY organization_id
HAVING COUNT(*) > 1
ORDER BY record_count DESC;

-- Show final state
SELECT 
    id,
    organization_id,
    trial_status,
    trial_start_date,
    trial_end_date,
    created_at
FROM organization_trials
ORDER BY organization_id, created_at DESC;
