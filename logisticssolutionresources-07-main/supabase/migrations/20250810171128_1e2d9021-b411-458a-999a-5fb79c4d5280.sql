-- Additional Migration: Fix Missing Tables and Columns
-- This migration addresses the 400 errors for existing tables

-- Create compliance_violations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.compliance_violations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    violation_type TEXT NOT NULL,
    violation_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    penalty_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    job_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create incidents table if it doesn't exist (separate from incident_reports)
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    incident_type TEXT NOT NULL,
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    description TEXT,
    severity TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix existing tables - Add missing organization_id columns
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.vehicles ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added organization_id column to vehicles table';
    ELSE
        RAISE NOTICE 'organization_id column already exists in vehicles table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'routes' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.routes ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added organization_id column to routes table';
    ELSE
        RAISE NOTICE 'organization_id column already exists in routes table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicle_checks' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.vehicle_checks ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added organization_id column to vehicle_checks table';
    ELSE
        RAISE NOTICE 'organization_id column already exists in vehicle_checks table';
    END IF;
END $$;

-- Enable RLS for new tables
ALTER TABLE public.compliance_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Users can view compliance_violations for their organization" ON public.compliance_violations
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert compliance_violations for their organization" ON public.compliance_violations
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can view jobs for their organization" ON public.jobs
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert jobs for their organization" ON public.jobs
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can view incidents for their organization" ON public.incidents
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert incidents for their organization" ON public.incidents
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_compliance_violations_org_date ON public.compliance_violations(organization_id, violation_date);
CREATE INDEX IF NOT EXISTS idx_jobs_org_status ON public.jobs(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_incidents_org_date ON public.incidents(organization_id, incident_date);