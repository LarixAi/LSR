-- Add missing columns to rail_replacement_services table
ALTER TABLE public.rail_replacement_services 
ADD COLUMN IF NOT EXISTS service_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS service_type TEXT CHECK (service_type IN ('planned', 'emergency', 'maintenance', 'strike', 'weather', 'other')),
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled', 'suspended')),
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS frequency TEXT,
ADD COLUMN IF NOT EXISTS vehicles_required INTEGER,
ADD COLUMN IF NOT EXISTS vehicles_assigned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS passengers_affected INTEGER,
ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS revenue DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS rail_operator TEXT,
ADD COLUMN IF NOT EXISTS operator_contact TEXT,
ADD COLUMN IF NOT EXISTS operator_phone TEXT,
ADD COLUMN IF NOT EXISTS operator_email TEXT,
ADD COLUMN IF NOT EXISTS special_requirements TEXT[],
ADD COLUMN IF NOT EXISTS route_details TEXT,
ADD COLUMN IF NOT EXISTS pickup_locations TEXT[],
ADD COLUMN IF NOT EXISTS dropoff_locations TEXT[],
ADD COLUMN IF NOT EXISTS performance_metrics JSONB,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_service_code 
ON public.rail_replacement_services(service_code);

CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_service_type 
ON public.rail_replacement_services(service_type);

CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_priority 
ON public.rail_replacement_services(priority);

CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_status 
ON public.rail_replacement_services(status);

CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_start_date 
ON public.rail_replacement_services(start_date);

CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_end_date 
ON public.rail_replacement_services(end_date);

CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_rail_operator 
ON public.rail_replacement_services(rail_operator);

CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_created_at 
ON public.rail_replacement_services(created_at);
