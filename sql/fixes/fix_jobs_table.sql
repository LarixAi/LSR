-- Fix Jobs Table for DriverJobs Functionality

-- Ensure all necessary columns exist in the jobs table
-- This script adds any missing columns that might be needed for the DriverJobs page

-- Add missing columns if they don't exist
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS assigned_driver_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS assigned_vehicle_id UUID REFERENCES public.vehicles(id);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS pickup_location TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS delivery_location TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS customer_contact TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS estimated_duration INTEGER;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS actual_duration INTEGER;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- Ensure status and priority have proper constraints
ALTER TABLE public.jobs ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.jobs ALTER COLUMN priority SET DEFAULT 'medium';

-- Add constraints if they don't exist
DO $$
BEGIN
    -- Status constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'jobs_status_check'
    ) THEN
        ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check 
        CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled'));
    END IF;
    
    -- Priority constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'jobs_priority_check'
    ) THEN
        ALTER TABLE public.jobs ADD CONSTRAINT jobs_priority_check 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
    END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "jobs_org_members_select" ON public.jobs;
DROP POLICY IF EXISTS "jobs_org_admins_manage" ON public.jobs;
DROP POLICY IF EXISTS "jobs_assigned_user_access" ON public.jobs;
DROP POLICY IF EXISTS "Drivers can view their assigned jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins and council can manage jobs" ON public.jobs;

-- Create comprehensive RLS policies
-- Policy 1: Organization members can view jobs in their organization
CREATE POLICY "jobs_org_members_select" 
ON public.jobs 
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid()
  )
);

-- Policy 2: Admins can manage jobs in their organization
CREATE POLICY "jobs_org_admins_manage" 
ON public.jobs 
FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'council', 'super_admin')
  )
)
WITH CHECK (
  organization_id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'council', 'super_admin')
  )
);

-- Policy 3: Drivers can view and update jobs assigned to them
CREATE POLICY "jobs_assigned_user_access" 
ON public.jobs 
FOR ALL
TO authenticated
USING (
  assigned_driver_id = auth.uid() OR 
  organization_id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'council', 'super_admin')
  )
)
WITH CHECK (
  assigned_driver_id = auth.uid() OR 
  organization_id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'council', 'super_admin')
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_driver_id ON public.jobs(assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_vehicle_id ON public.jobs(assigned_vehicle_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON public.jobs(priority);
CREATE INDEX IF NOT EXISTS idx_jobs_start_date ON public.jobs(start_date);
CREATE INDEX IF NOT EXISTS idx_jobs_organization_id ON public.jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON public.jobs(created_by);

-- Add trigger for updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_jobs_updated_at'
    ) THEN
        CREATE TRIGGER update_jobs_updated_at 
            BEFORE UPDATE ON public.jobs 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Verify the table structure
SELECT 
    'Jobs Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'jobs'
ORDER BY ordinal_position;

-- Verify RLS policies
SELECT 
    'RLS Policies' as check_type,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'jobs'
ORDER BY policyname;

-- Verify indexes
SELECT 
    'Indexes' as check_type,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'jobs'
ORDER BY indexname;

-- Show sample data if any exists
SELECT 
    'Sample Data' as check_type,
    COUNT(*) as total_jobs,
    COUNT(CASE WHEN assigned_driver_id IS NOT NULL THEN 1 END) as assigned_jobs,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_jobs,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_jobs
FROM public.jobs;
