-- =====================================================
-- MIGRATION: ADD MISSING COLUMNS TO DRIVER_POINTS_HISTORY
-- =====================================================

-- Add missing columns to driver_points_history table if they don't exist
DO $$ 
BEGIN
    -- Add recorded_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'driver_points_history' 
        AND column_name = 'recorded_date'
    ) THEN
        ALTER TABLE public.driver_points_history ADD COLUMN recorded_date DATE DEFAULT CURRENT_DATE;
        RAISE NOTICE 'Added recorded_date column to driver_points_history table';
    ELSE
        RAISE NOTICE 'recorded_date column already exists in driver_points_history table';
    END IF;

    -- Add description column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'driver_points_history' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE public.driver_points_history ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to driver_points_history table';
    ELSE
        RAISE NOTICE 'description column already exists in driver_points_history table';
    END IF;

    -- Add violation_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'driver_points_history' 
        AND column_name = 'violation_type'
    ) THEN
        ALTER TABLE public.driver_points_history ADD COLUMN violation_type TEXT;
        RAISE NOTICE 'Added violation_type column to driver_points_history table';
    ELSE
        RAISE NOTICE 'violation_type column already exists in driver_points_history table';
    END IF;

    -- Add penalty_amount column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'driver_points_history' 
        AND column_name = 'penalty_amount'
    ) THEN
        ALTER TABLE public.driver_points_history ADD COLUMN penalty_amount DECIMAL(10,2);
        RAISE NOTICE 'Added penalty_amount column to driver_points_history table';
    ELSE
        RAISE NOTICE 'penalty_amount column already exists in driver_points_history table';
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'driver_points_history' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.driver_points_history ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE 'Added status column to driver_points_history table';
    ELSE
        RAISE NOTICE 'status column already exists in driver_points_history table';
    END IF;

    -- Add notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'driver_points_history' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.driver_points_history ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added notes column to driver_points_history table';
    ELSE
        RAISE NOTICE 'notes column already exists in driver_points_history table';
    END IF;

    -- Add organization_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'driver_points_history' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.driver_points_history ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added organization_id column to driver_points_history table';
    ELSE
        RAISE NOTICE 'organization_id column already exists in driver_points_history table';
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'driver_points_history' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.driver_points_history ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to driver_points_history table';
    ELSE
        RAISE NOTICE 'created_at column already exists in driver_points_history table';
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'driver_points_history' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.driver_points_history ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to driver_points_history table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in driver_points_history table';
    END IF;

END $$;

-- =====================================================
-- CREATE INDEXES IF THEY DON'T EXIST
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_driver_points_history_driver_id ON public.driver_points_history(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_points_history_organization_id ON public.driver_points_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_driver_points_history_recorded_date ON public.driver_points_history(recorded_date);
CREATE INDEX IF NOT EXISTS idx_driver_points_history_status ON public.driver_points_history(status);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY IF NOT ALREADY ENABLED
-- =====================================================

ALTER TABLE public.driver_points_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES (DROP EXISTING FIRST TO AVOID CONFLICTS)
-- =====================================================

-- Drop existing policies for driver_points_history if they exist
DROP POLICY IF EXISTS "Users can view driver points history in their organization" ON public.driver_points_history;
DROP POLICY IF EXISTS "Users can insert driver points history in their organization" ON public.driver_points_history;
DROP POLICY IF EXISTS "Users can update driver points history in their organization" ON public.driver_points_history;
DROP POLICY IF EXISTS "Users can delete driver points history in their organization" ON public.driver_points_history;

-- Create RLS policies for driver_points_history
CREATE POLICY "Users can view driver points history in their organization" ON public.driver_points_history
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert driver points history in their organization" ON public.driver_points_history
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update driver points history in their organization" ON public.driver_points_history
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete driver points history in their organization" ON public.driver_points_history
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- CREATE UPDATED_AT TRIGGER
-- =====================================================

-- Driver points history trigger
CREATE OR REPLACE FUNCTION update_driver_points_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_driver_points_history_updated_at ON public.driver_points_history;
CREATE TRIGGER trigger_update_driver_points_history_updated_at
    BEFORE UPDATE ON public.driver_points_history
    FOR EACH ROW
    EXECUTE FUNCTION update_driver_points_history_updated_at();

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Check the structure of the driver_points_history table
SELECT 
    'driver_points_history' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'driver_points_history' 
ORDER BY ordinal_position;
