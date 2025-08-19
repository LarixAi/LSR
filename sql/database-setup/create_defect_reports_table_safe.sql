-- Create Defect Reports Table and Sample Data (Safe Version)
-- This script safely handles existing function dependencies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Mechanics can view defect reports" ON public.defect_reports;
DROP POLICY IF EXISTS "Mechanics can manage defect reports" ON public.defect_reports;

-- Drop existing trigger if it exists (only for defect_reports)
DROP TRIGGER IF EXISTS update_defect_reports_updated_at ON public.defect_reports;

-- Create defect_reports table (will not recreate if exists)
CREATE TABLE IF NOT EXISTS public.defect_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id),
    reported_by UUID REFERENCES public.profiles(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    defect_type VARCHAR(20) CHECK (defect_type IN ('safety', 'mechanical', 'electrical', 'cosmetic', 'other')),
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) CHECK (status IN ('reported', 'investigating', 'repairing', 'resolved', 'closed')) DEFAULT 'reported',
    location VARCHAR(255),
    reported_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_date TIMESTAMP WITH TIME ZONE,
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    actual_cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on defect_reports table
ALTER TABLE public.defect_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Mechanics can view defect reports" ON public.defect_reports
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

CREATE POLICY "Mechanics can manage defect reports" ON public.defect_reports
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

-- Update the existing function safely (don't drop it)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger for defect_reports only
CREATE TRIGGER update_defect_reports_updated_at 
    BEFORE UPDATE ON public.defect_reports
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Get Jimmy's profile ID and some vehicle IDs
DO $$
DECLARE
    jimmy_id UUID;
    vehicle_ids UUID[];
BEGIN
    -- Get Jimmy's profile ID
    SELECT id INTO jimmy_id FROM profiles WHERE email = 'laronelaing3@outlook.com';
    
    -- Get some vehicle IDs
    SELECT ARRAY_AGG(id) INTO vehicle_ids FROM vehicles LIMIT 5;
    
    -- Insert sample defect reports (only if they don't exist)
    INSERT INTO public.defect_reports (
        defect_number, vehicle_id, reported_by, title, description, 
        defect_type, severity, status, location, reported_date, estimated_cost
    ) VALUES
        ('DEF-2024-001', vehicle_ids[1], jimmy_id, 'Brake System Failure', 'Front brake pads completely worn out, brake pedal goes to floor', 'safety', 'critical', 'investigating', 'Front brake system', NOW() - INTERVAL '2 days', 150.00),
        ('DEF-2024-002', vehicle_ids[2], jimmy_id, 'Engine Oil Leak', 'Oil leaking from engine block, creating puddle under vehicle', 'mechanical', 'high', 'repairing', 'Engine compartment', NOW() - INTERVAL '1 day', 200.00),
        ('DEF-2024-003', vehicle_ids[3], jimmy_id, 'Electrical System Fault', 'Dashboard lights flickering, battery not charging properly', 'electrical', 'medium', 'reported', 'Electrical system', NOW() - INTERVAL '3 hours', 80.00),
        ('DEF-2024-004', vehicle_ids[4], jimmy_id, 'Tire Wear Issue', 'Front left tire showing excessive wear on inner edge', 'safety', 'medium', 'resolved', 'Front left wheel', NOW() - INTERVAL '5 days', 120.00),
        ('DEF-2024-005', vehicle_ids[5], jimmy_id, 'Air Conditioning Failure', 'AC not cooling, compressor making unusual noise', 'mechanical', 'low', 'closed', 'Air conditioning system', NOW() - INTERVAL '1 week', 300.00),
        ('DEF-2024-006', vehicle_ids[1], jimmy_id, 'Steering Wheel Vibration', 'Steering wheel vibrates at high speeds, wheel balance issue', 'safety', 'high', 'investigating', 'Steering system', NOW() - INTERVAL '4 hours', 90.00),
        ('DEF-2024-007', vehicle_ids[2], jimmy_id, 'Exhaust System Damage', 'Exhaust pipe cracked, loud noise when accelerating', 'mechanical', 'medium', 'reported', 'Exhaust system', NOW() - INTERVAL '6 hours', 180.00),
        ('DEF-2024-008', vehicle_ids[3], jimmy_id, 'Headlight Malfunction', 'Right headlight not working, bulb needs replacement', 'electrical', 'low', 'resolved', 'Front right headlight', NOW() - INTERVAL '2 days', 25.00)
    ON CONFLICT (defect_number) DO NOTHING;
    
    RAISE NOTICE 'Sample defect reports created successfully';
END $$;

-- Verify the data
SELECT 'Defect Reports:' as info;
SELECT 
    defect_number,
    title,
    defect_type,
    severity,
    status,
    location,
    estimated_cost,
    reported_date
FROM defect_reports 
ORDER BY created_at DESC;

-- Show defect reports by status
SELECT 'Defect Reports by Status:' as info;
SELECT 
    status,
    COUNT(*) as count,
    STRING_AGG(defect_number, ', ') as defect_numbers
FROM defect_reports 
GROUP BY status
ORDER BY status;

-- Show defect reports by severity
SELECT 'Defect Reports by Severity:' as info;
SELECT 
    severity,
    COUNT(*) as count,
    STRING_AGG(defect_number, ', ') as defect_numbers
FROM defect_reports 
GROUP BY severity
ORDER BY 
    CASE severity 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
    END;

-- Show total estimated costs
SELECT 'Total Estimated Costs:' as info;
SELECT 
    SUM(estimated_cost) as total_estimated,
    SUM(actual_cost) as total_actual,
    COUNT(*) as total_defects
FROM defect_reports;
