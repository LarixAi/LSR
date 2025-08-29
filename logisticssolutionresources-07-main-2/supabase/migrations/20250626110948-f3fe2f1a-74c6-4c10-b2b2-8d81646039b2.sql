
-- First, add the compliance officer role to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'compliance_officer';
