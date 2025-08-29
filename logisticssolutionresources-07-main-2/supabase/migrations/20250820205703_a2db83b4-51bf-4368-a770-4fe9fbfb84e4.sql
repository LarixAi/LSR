-- Test the trial system by inserting a sample trial
INSERT INTO organization_trials (
  organization_id,
  trial_start_date,
  trial_end_date,
  trial_status,
  max_drivers,
  features
) 
SELECT 
  organization_id,
  now(),
  now() + INTERVAL '14 days',
  'active',
  5,
  'Basic trial features'
FROM profiles 
WHERE role = 'admin' 
LIMIT 1
ON CONFLICT (organization_id) DO UPDATE SET
  trial_start_date = EXCLUDED.trial_start_date,
  trial_end_date = EXCLUDED.trial_end_date,
  trial_status = 'active',
  max_drivers = 5;