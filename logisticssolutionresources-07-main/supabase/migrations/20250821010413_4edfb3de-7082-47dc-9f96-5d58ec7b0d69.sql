-- Add unique constraint on organization_id to organization_trials table
ALTER TABLE organization_trials ADD CONSTRAINT organization_trials_organization_id_unique UNIQUE (organization_id);

-- Now insert the sample trial
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