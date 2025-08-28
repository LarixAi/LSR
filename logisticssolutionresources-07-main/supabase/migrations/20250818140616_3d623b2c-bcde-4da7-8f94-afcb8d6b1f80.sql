-- Reset password for transport@nationalbusgroup.co.uk to force password change
UPDATE profiles 
SET must_change_password = true 
WHERE email = 'transport@nationalbusgroup.co.uk';