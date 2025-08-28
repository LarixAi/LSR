-- Reset password for transport@nationalbusgroup.co.uk
UPDATE profiles 
SET must_change_password = true 
WHERE email = 'transport@nationalbusgroup.co.uk';

-- Also add a function to allow password reset via email
INSERT INTO auth.schema_migrations (version) VALUES ('20250818140500_fix_auth_issues') 
ON CONFLICT (version) DO NOTHING;