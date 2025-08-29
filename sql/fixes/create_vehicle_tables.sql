-- Create comprehensive vehicle management tables for PSV vehicles

-- Enhanced vehicles table with PSV information
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS laden_weight INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS mam INTEGER; -- Maximum Authorised Mass
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS body_type TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS engine_type TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS number_of_axles INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS manufacturer_name TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS chassis_number TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS engine_number TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS fuel_tank_capacity INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS max_speed INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS wheelbase INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS overall_length INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS overall_width INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS overall_height INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS unladen_weight INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS gross_vehicle_weight INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS axle_weights JSONB;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS tyre_sizes JSONB;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS brake_type TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS suspension_type TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS emission_standard TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS euro_emission_standard TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS co2_emissions INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS noise_level INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS first_registration_date DATE;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS last_v5_issue_date DATE;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS keeper_changes INTEGER DEFAULT 0;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS previous_keepers INTEGER DEFAULT 0;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS export_marker BOOLEAN DEFAULT FALSE;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_status TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_identity_check TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_use_code TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_body_type_code TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_colour TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_make TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_model TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_engine_size TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_fuel_type TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_transmission TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_door_plan TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_seat_capacity INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_standing_capacity INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_wheelplan TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_revenue_weight INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_real_driving_emissions TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_euro_status TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_particulate_trap TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_nox_control TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_modification_type TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_modification_type_extended TEXT;

-- Create daily running costs table
CREATE TABLE IF NOT EXISTS public.daily_running_costs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    fuel_cost DECIMAL(10,2) DEFAULT 0,
    maintenance_cost DECIMAL(10,2) DEFAULT 0,
    insurance_cost DECIMAL(10,2) DEFAULT 0,
    tax_cost DECIMAL(10,2) DEFAULT 0,
    depreciation_cost DECIMAL(10,2) DEFAULT 0,
    other_costs DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (
        fuel_cost + maintenance_cost + insurance_cost + tax_cost + depreciation_cost + other_costs
    ) STORED,
    mileage_start INTEGER,
    mileage_end INTEGER,
    distance_traveled INTEGER GENERATED ALWAYS AS (mileage_end - mileage_start) STORED,
    fuel_consumed DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tyres table
CREATE TABLE IF NOT EXISTS public.tyres (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    position TEXT NOT NULL, -- Front Left, Front Right, Rear Left, Rear Right, etc.
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    size TEXT NOT NULL,
    load_index TEXT,
    speed_rating TEXT,
    manufacture_date DATE,
    installation_date DATE NOT NULL,
    tread_depth_new DECIMAL(3,1),
    tread_depth_current DECIMAL(3,1),
    pressure_recommended DECIMAL(3,1),
    pressure_current DECIMAL(3,1),
    condition TEXT CHECK (condition IN ('new', 'good', 'fair', 'poor', 'replace')) DEFAULT 'new',
    replacement_date DATE,
    cost DECIMAL(8,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicle assignments table
CREATE TABLE IF NOT EXISTS public.vehicle_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    assignment_type TEXT CHECK (assignment_type IN ('permanent', 'temporary', 'job', 'school_route')) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    job_id UUID, -- Reference to jobs table if exists
    route_id UUID, -- Reference to routes table if exists
    notes TEXT,
    status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create walk around checks table
CREATE TABLE IF NOT EXISTS public.walk_around_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    check_date DATE NOT NULL,
    check_time TIME NOT NULL,
    overall_status TEXT CHECK (overall_status IN ('pass', 'fail', 'warning')) NOT NULL,
    location TEXT,
    weather_conditions TEXT,
    mileage INTEGER,
    notes TEXT,
    defects_found INTEGER DEFAULT 0,
    photos_taken INTEGER DEFAULT 0,
    check_items JSONB, -- Store detailed check items as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service records table
CREATE TABLE IF NOT EXISTS public.service_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    service_type TEXT NOT NULL,
    description TEXT,
    cost DECIMAL(10,2) DEFAULT 0,
    mileage INTEGER,
    vendor TEXT,
    next_service_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inspections table
CREATE TABLE IF NOT EXISTS public.inspections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    inspection_date DATE NOT NULL,
    inspection_type TEXT NOT NULL,
    result TEXT CHECK (result IN ('Passed', 'Failed', 'Conditional')) NOT NULL,
    inspector TEXT,
    notes TEXT,
    next_inspection_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: work_orders table already exists from previous migrations
-- This table is defined in supabase/migrations/20250822000007_create_work_orders_table.sql

-- Create maintenance schedule table
CREATE TABLE IF NOT EXISTS public.maintenance_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    frequency_months INTEGER DEFAULT 12,
    last_performed DATE,
    next_due DATE,
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicle documents table
CREATE TABLE IF NOT EXISTS public.vehicle_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_name TEXT NOT NULL,
    file_url TEXT,
    expiry_date DATE,
    status TEXT CHECK (status IN ('Valid', 'Expired', 'Pending', 'Renewal Required')) DEFAULT 'Valid',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_running_costs_vehicle_id ON public.daily_running_costs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_daily_running_costs_date ON public.daily_running_costs(date);
CREATE INDEX IF NOT EXISTS idx_tyres_vehicle_id ON public.tyres(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tyres_position ON public.tyres(position);
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_vehicle_id ON public.vehicle_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_driver_id ON public.vehicle_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_status ON public.vehicle_assignments(status);
CREATE INDEX IF NOT EXISTS idx_walk_around_checks_vehicle_id ON public.walk_around_checks(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_walk_around_checks_driver_id ON public.walk_around_checks(driver_id);
CREATE INDEX IF NOT EXISTS idx_walk_around_checks_date ON public.walk_around_checks(check_date);
CREATE INDEX IF NOT EXISTS idx_service_records_vehicle_id ON public.service_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_service_records_date ON public.service_records(service_date);
CREATE INDEX IF NOT EXISTS idx_inspections_vehicle_id ON public.inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON public.inspections(inspection_date);
-- Note: work_orders indexes already exist from previous migrations
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_vehicle_id ON public.maintenance_schedule(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_next_due ON public.maintenance_schedule(next_due);
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_vehicle_id ON public.vehicle_documents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_type ON public.vehicle_documents(document_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.daily_running_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tyres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walk_around_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
-- Note: work_orders RLS already enabled from previous migrations
ALTER TABLE public.maintenance_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_running_costs
CREATE POLICY "Users can view daily running costs for their organization vehicles" ON public.daily_running_costs
    FOR SELECT USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert daily running costs for their organization vehicles" ON public.daily_running_costs
    FOR INSERT WITH CHECK (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update daily running costs for their organization vehicles" ON public.daily_running_costs
    FOR UPDATE USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete daily running costs for their organization vehicles" ON public.daily_running_costs
    FOR DELETE USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- RLS Policies for tyres
CREATE POLICY "Users can view tyres for their organization vehicles" ON public.tyres
    FOR SELECT USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert tyres for their organization vehicles" ON public.tyres
    FOR INSERT WITH CHECK (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update tyres for their organization vehicles" ON public.tyres
    FOR UPDATE USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete tyres for their organization vehicles" ON public.tyres
    FOR DELETE USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- RLS Policies for vehicle_assignments
CREATE POLICY "Users can view vehicle assignments for their organization" ON public.vehicle_assignments
    FOR SELECT USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert vehicle assignments for their organization" ON public.vehicle_assignments
    FOR INSERT WITH CHECK (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update vehicle assignments for their organization" ON public.vehicle_assignments
    FOR UPDATE USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete vehicle assignments for their organization" ON public.vehicle_assignments
    FOR DELETE USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- RLS Policies for walk_around_checks
CREATE POLICY "Users can view walk around checks for their organization vehicles" ON public.walk_around_checks
    FOR SELECT USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert walk around checks for their organization vehicles" ON public.walk_around_checks
    FOR INSERT WITH CHECK (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update walk around checks for their organization vehicles" ON public.walk_around_checks
    FOR UPDATE USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete walk around checks for their organization vehicles" ON public.walk_around_checks
    FOR DELETE USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- RLS Policies for service_records
CREATE POLICY "Users can view service records for their organization vehicles" ON public.service_records
    FOR SELECT USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert service records for their organization vehicles" ON public.service_records
    FOR INSERT WITH CHECK (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update service records for their organization vehicles" ON public.service_records
    FOR UPDATE USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete service records for their organization vehicles" ON public.service_records
    FOR DELETE USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- RLS Policies for inspections
CREATE POLICY "Users can view inspections for their organization vehicles" ON public.inspections
    FOR SELECT USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert inspections for their organization vehicles" ON public.inspections
    FOR INSERT WITH CHECK (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update inspections for their organization vehicles" ON public.inspections
    FOR UPDATE USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete inspections for their organization vehicles" ON public.inspections
    FOR DELETE USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- Note: work_orders RLS policies already exist from previous migrations

-- RLS Policies for maintenance_schedule
CREATE POLICY "Users can view maintenance schedule for their organization vehicles" ON public.maintenance_schedule
    FOR SELECT USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert maintenance schedule for their organization vehicles" ON public.maintenance_schedule
    FOR INSERT WITH CHECK (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update maintenance schedule for their organization vehicles" ON public.maintenance_schedule
    FOR UPDATE USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete maintenance schedule for their organization vehicles" ON public.maintenance_schedule
    FOR DELETE USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- RLS Policies for vehicle_documents
CREATE POLICY "Users can view vehicle documents for their organization vehicles" ON public.vehicle_documents
    FOR SELECT USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert vehicle documents for their organization vehicles" ON public.vehicle_documents
    FOR INSERT WITH CHECK (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update vehicle documents for their organization vehicles" ON public.vehicle_documents
    FOR UPDATE USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete vehicle documents for their organization vehicles" ON public.vehicle_documents
    FOR DELETE USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles 
            WHERE organization_id = (
                SELECT organization_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_daily_running_costs_updated_at
    BEFORE UPDATE ON public.daily_running_costs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_tyres_updated_at
    BEFORE UPDATE ON public.tyres
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_vehicle_assignments_updated_at
    BEFORE UPDATE ON public.vehicle_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_walk_around_checks_updated_at
    BEFORE UPDATE ON public.walk_around_checks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add comments to tables and columns
COMMENT ON TABLE public.daily_running_costs IS 'Track daily operational costs for vehicles';
COMMENT ON TABLE public.tyres IS 'Manage tyre inventory and condition for vehicles';
COMMENT ON TABLE public.vehicle_assignments IS 'Track driver assignments to vehicles';
COMMENT ON TABLE public.walk_around_checks IS 'Store vehicle walk-around check results';

COMMENT ON COLUMN public.vehicles.laden_weight IS 'Weight of vehicle when loaded (kg)';
COMMENT ON COLUMN public.vehicles.mam IS 'Maximum Authorised Mass (kg)';
COMMENT ON COLUMN public.vehicles.body_type IS 'Type of vehicle body (e.g., Minibus, Coach)';
COMMENT ON COLUMN public.vehicles.engine_type IS 'Type of engine (e.g., Diesel, Petrol, Electric)';
COMMENT ON COLUMN public.vehicles.number_of_axles IS 'Number of axles on the vehicle';
COMMENT ON COLUMN public.vehicles.manufacturer_name IS 'Name of the vehicle manufacturer';
COMMENT ON COLUMN public.vehicles.chassis_number IS 'Vehicle chassis number';
COMMENT ON COLUMN public.vehicles.engine_number IS 'Vehicle engine number';
COMMENT ON COLUMN public.vehicles.fuel_tank_capacity IS 'Fuel tank capacity in litres';
COMMENT ON COLUMN public.vehicles.max_speed IS 'Maximum speed in mph';
COMMENT ON COLUMN public.vehicles.wheelbase IS 'Wheelbase in millimeters';
COMMENT ON COLUMN public.vehicles.overall_length IS 'Overall length in millimeters';
COMMENT ON COLUMN public.vehicles.overall_width IS 'Overall width in millimeters';
COMMENT ON COLUMN public.vehicles.overall_height IS 'Overall height in millimeters';
COMMENT ON COLUMN public.vehicles.unladen_weight IS 'Weight of vehicle when empty (kg)';
COMMENT ON COLUMN public.vehicles.gross_vehicle_weight IS 'Gross vehicle weight (kg)';
COMMENT ON COLUMN public.vehicles.axle_weights IS 'JSON object containing axle weights';
COMMENT ON COLUMN public.vehicles.tyre_sizes IS 'JSON object containing tyre sizes for different positions';
COMMENT ON COLUMN public.vehicles.brake_type IS 'Type of braking system';
COMMENT ON COLUMN public.vehicles.suspension_type IS 'Type of suspension system';
COMMENT ON COLUMN public.vehicles.emission_standard IS 'Emission standard (e.g., Euro 6)';
COMMENT ON COLUMN public.vehicles.euro_emission_standard IS 'Euro emission standard';
COMMENT ON COLUMN public.vehicles.co2_emissions IS 'CO2 emissions in g/km';
COMMENT ON COLUMN public.vehicles.noise_level IS 'Noise level in dB';
COMMENT ON COLUMN public.vehicles.first_registration_date IS 'Date of first registration';
COMMENT ON COLUMN public.vehicles.last_v5_issue_date IS 'Date of last V5 issue';
COMMENT ON COLUMN public.vehicles.keeper_changes IS 'Number of keeper changes';
COMMENT ON COLUMN public.vehicles.previous_keepers IS 'Number of previous keepers';
COMMENT ON COLUMN public.vehicles.export_marker IS 'Whether vehicle is marked for export';
COMMENT ON COLUMN public.vehicles.vehicle_status IS 'Current status of the vehicle';
COMMENT ON COLUMN public.vehicles.vehicle_identity_check IS 'Vehicle identity check result';
COMMENT ON COLUMN public.vehicles.vehicle_use_code IS 'Vehicle use code (e.g., PSV)';
COMMENT ON COLUMN public.vehicles.vehicle_body_type_code IS 'Vehicle body type code';
COMMENT ON COLUMN public.vehicles.vehicle_colour IS 'Vehicle colour';
COMMENT ON COLUMN public.vehicles.vehicle_make IS 'Vehicle make';
COMMENT ON COLUMN public.vehicles.vehicle_model IS 'Vehicle model';
COMMENT ON COLUMN public.vehicles.vehicle_engine_size IS 'Vehicle engine size';
COMMENT ON COLUMN public.vehicles.vehicle_fuel_type IS 'Vehicle fuel type';
COMMENT ON COLUMN public.vehicles.vehicle_transmission IS 'Vehicle transmission type';
COMMENT ON COLUMN public.vehicles.vehicle_door_plan IS 'Vehicle door plan';
COMMENT ON COLUMN public.vehicles.vehicle_seat_capacity IS 'Vehicle seat capacity';
COMMENT ON COLUMN public.vehicles.vehicle_standing_capacity IS 'Vehicle standing capacity';
COMMENT ON COLUMN public.vehicles.vehicle_wheelplan IS 'Vehicle wheel plan';
COMMENT ON COLUMN public.vehicles.vehicle_revenue_weight IS 'Vehicle revenue weight';
COMMENT ON COLUMN public.vehicles.vehicle_real_driving_emissions IS 'Real driving emissions status';
COMMENT ON COLUMN public.vehicles.vehicle_euro_status IS 'Euro status';
COMMENT ON COLUMN public.vehicles.vehicle_particulate_trap IS 'Particulate trap status';
COMMENT ON COLUMN public.vehicles.vehicle_nox_control IS 'NOx control status';
COMMENT ON COLUMN public.vehicles.vehicle_modification_type IS 'Vehicle modification type';
COMMENT ON COLUMN public.vehicles.vehicle_modification_type_extended IS 'Extended vehicle modification type';
