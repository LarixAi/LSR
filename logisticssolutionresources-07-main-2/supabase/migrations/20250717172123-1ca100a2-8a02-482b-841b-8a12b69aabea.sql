-- Step 1: Add missing enum values for user roles
-- These need to be added separately before being used in policies

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'council';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'compliance_officer';