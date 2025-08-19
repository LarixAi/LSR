-- Fix schedules table structure
-- This script ensures the schedules table has the correct columns

-- First, check if the table exists and what columns it has
DO $$
BEGIN
    -- Check if schedules table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schedules') THEN
        -- Create the table if it doesn't exist
        CREATE TABLE public.schedules (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            driver_id uuid NOT NULL REFERENCES public.profiles(id),
            vehicle_id uuid NOT NULL REFERENCES public.vehicles(id),
            route_id uuid REFERENCES public.routes(id),
            start_time timestamp with time zone NOT NULL,
            end_time timestamp with time zone NOT NULL,
            job_type text NOT NULL DEFAULT 'school_run',
            status text NOT NULL DEFAULT 'scheduled',
            notes text,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now(),
            organization_id uuid NOT NULL REFERENCES public.organizations(id),
            created_by uuid REFERENCES public.profiles(id)
        );
        
        RAISE NOTICE 'Created schedules table';
    ELSE
        RAISE NOTICE 'Schedules table already exists';
    END IF;
    
    -- Check if job_type column exists
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedules' AND column_name = 'job_type') THEN
        -- Add the missing job_type column
        ALTER TABLE public.schedules ADD COLUMN job_type text NOT NULL DEFAULT 'school_run';
        RAISE NOTICE 'Added job_type column to schedules table';
    ELSE
        RAISE NOTICE 'job_type column already exists';
    END IF;
    
    -- Check if organization_id column exists
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedules' AND column_name = 'organization_id') THEN
        -- Add the missing organization_id column
        ALTER TABLE public.schedules ADD COLUMN organization_id uuid NOT NULL REFERENCES public.organizations(id);
        RAISE NOTICE 'Added organization_id column to schedules table';
    ELSE
        RAISE NOTICE 'organization_id column already exists';
    END IF;
    
    -- Check if created_by column exists
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedules' AND column_name = 'created_by') THEN
        -- Add the missing created_by column
        ALTER TABLE public.schedules ADD COLUMN created_by uuid REFERENCES public.profiles(id);
        RAISE NOTICE 'Added created_by column to schedules table';
    ELSE
        RAISE NOTICE 'created_by column already exists';
    END IF;
    
END $$;

-- Enable RLS on schedules if not already enabled
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view schedules in their organization" ON public.schedules;
DROP POLICY IF EXISTS "Drivers can view their own schedules" ON public.schedules;
DROP POLICY IF EXISTS "Admins can manage schedules in their organization" ON public.schedules;

-- Create RLS policies for schedules
CREATE POLICY "Users can view schedules in their organization" 
ON public.schedules 
FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Drivers can view their own schedules" 
ON public.schedules 
FOR SELECT 
USING (driver_id = auth.uid());

CREATE POLICY "Admins can manage schedules in their organization" 
ON public.schedules 
FOR ALL 
USING (
    (organization_id = get_user_organization_id() AND is_organization_admin())
    OR is_admin_user()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_schedules_driver_id ON public.schedules(driver_id);
CREATE INDEX IF NOT EXISTS idx_schedules_vehicle_id ON public.schedules(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON public.schedules(start_time);

-- Create trigger for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_schedules_updated_at ON public.schedules;
CREATE TRIGGER update_schedules_updated_at 
    BEFORE UPDATE ON public.schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO public.schedules (
    driver_id,
    vehicle_id,
    start_time,
    end_time,
    job_type,
    status,
    notes,
    organization_id
) 
SELECT 
    p.id as driver_id,
    v.id as vehicle_id,
    NOW() + INTERVAL '1 day' as start_time,
    NOW() + INTERVAL '1 day' + INTERVAL '2 hours' as end_time,
    'school_run' as job_type,
    'scheduled' as status,
    'Sample schedule for testing' as notes,
    p.organization_id
FROM public.profiles p
CROSS JOIN public.vehicles v
WHERE p.role = 'driver' 
    AND p.organization_id IS NOT NULL
    AND v.organization_id = p.organization_id
LIMIT 1
ON CONFLICT DO NOTHING;

-- Show the final table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'schedules'
ORDER BY ordinal_position;
