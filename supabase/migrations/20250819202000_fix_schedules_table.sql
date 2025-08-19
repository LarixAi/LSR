-- Fix schedules table by adding missing job_type column
-- This migration fixes the "column schedules.job_type does not exist" error

-- Add job_type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'schedules' 
        AND column_name = 'job_type'
    ) THEN
        ALTER TABLE public.schedules ADD COLUMN job_type text NOT NULL DEFAULT 'school_run';
        RAISE NOTICE 'Added job_type column to schedules table';
    ELSE
        RAISE NOTICE 'job_type column already exists in schedules table';
    END IF;
END $$;

-- Ensure organization_id column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'schedules' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.schedules ADD COLUMN organization_id uuid NOT NULL REFERENCES public.organizations(id);
        RAISE NOTICE 'Added organization_id column to schedules table';
    ELSE
        RAISE NOTICE 'organization_id column already exists in schedules table';
    END IF;
END $$;

-- Ensure created_by column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'schedules' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.schedules ADD COLUMN created_by uuid REFERENCES public.profiles(id);
        RAISE NOTICE 'Added created_by column to schedules table';
    ELSE
        RAISE NOTICE 'created_by column already exists in schedules table';
    END IF;
END $$;

-- Insert sample data for testing if table is empty
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
    AND NOT EXISTS (SELECT 1 FROM public.schedules LIMIT 1)
LIMIT 1
ON CONFLICT DO NOTHING;
