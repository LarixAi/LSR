-- Create missing compliance tables
-- This migration adds the training_completions and driver_compliance_scores tables

-- Create training_completions table
CREATE TABLE IF NOT EXISTS public.training_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    training_type VARCHAR(100) NOT NULL,
    training_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'expired')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completion_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    score INTEGER,
    max_score INTEGER,
    certificate_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create driver_compliance_scores table
CREATE TABLE IF NOT EXISTS public.driver_compliance_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
    risk_level VARCHAR(20) NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    license_score INTEGER DEFAULT 0 CHECK (license_score >= 0 AND license_score <= 40),
    training_score INTEGER DEFAULT 0 CHECK (training_score >= 0 AND training_score <= 30),
    violation_score INTEGER DEFAULT 0 CHECK (violation_score >= 0 AND violation_score <= 30),
    last_assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_assessment_date TIMESTAMP WITH TIME ZONE,
    assessment_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_training_completions_driver_id ON public.training_completions(driver_id);
CREATE INDEX IF NOT EXISTS idx_training_completions_organization_id ON public.training_completions(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_completions_status ON public.training_completions(status);
CREATE INDEX IF NOT EXISTS idx_training_completions_due_date ON public.training_completions(due_date);

CREATE INDEX IF NOT EXISTS idx_driver_compliance_scores_driver_id ON public.driver_compliance_scores(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_compliance_scores_organization_id ON public.driver_compliance_scores(organization_id);
CREATE INDEX IF NOT EXISTS idx_driver_compliance_scores_risk_level ON public.driver_compliance_scores(risk_level);

-- Add RLS policies for training_completions
ALTER TABLE public.training_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own training completions" ON public.training_completions
    FOR SELECT USING (
        auth.uid() = driver_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Users can insert their own training completions" ON public.training_completions
    FOR INSERT WITH CHECK (
        auth.uid() = driver_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Users can update their own training completions" ON public.training_completions
    FOR UPDATE USING (
        auth.uid() = driver_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Admins can delete training completions" ON public.training_completions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

-- Add RLS policies for driver_compliance_scores
ALTER TABLE public.driver_compliance_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own compliance scores" ON public.driver_compliance_scores
    FOR SELECT USING (
        auth.uid() = driver_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Users can insert their own compliance scores" ON public.driver_compliance_scores
    FOR INSERT WITH CHECK (
        auth.uid() = driver_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Users can update their own compliance scores" ON public.driver_compliance_scores
    FOR UPDATE USING (
        auth.uid() = driver_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Admins can delete compliance scores" ON public.driver_compliance_scores
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
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

-- Add updated_at triggers
CREATE TRIGGER handle_training_completions_updated_at
    BEFORE UPDATE ON public.training_completions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_driver_compliance_scores_updated_at
    BEFORE UPDATE ON public.driver_compliance_scores
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert some sample training data for testing
INSERT INTO public.training_completions (
    driver_id, 
    organization_id, 
    training_type, 
    training_name, 
    status, 
    progress, 
    completion_date, 
    due_date
) VALUES 
-- Sample completed training
(
    (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1),
    (SELECT id FROM public.organizations LIMIT 1),
    'driver-safety-fundamentals',
    'Driver Safety Fundamentals',
    'completed',
    100,
    NOW() - INTERVAL '30 days',
    NOW() + INTERVAL '335 days'
),
-- Sample in-progress training
(
    (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1),
    (SELECT id FROM public.organizations LIMIT 1),
    'vehicle-inspection-training',
    'Daily Vehicle Inspection Procedures',
    'in_progress',
    65,
    NULL,
    NOW() + INTERVAL '15 days'
),
-- Sample not started training
(
    (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1),
    (SELECT id FROM public.organizations LIMIT 1),
    'emergency-procedures',
    'Emergency Response Procedures',
    'not_started',
    0,
    NULL,
    NOW() + INTERVAL '60 days'
)
ON CONFLICT DO NOTHING;

-- Insert sample compliance score
INSERT INTO public.driver_compliance_scores (
    driver_id,
    organization_id,
    overall_score,
    risk_level,
    license_score,
    training_score,
    violation_score,
    next_assessment_date
) VALUES (
    (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1),
    (SELECT id FROM public.organizations LIMIT 1),
    85,
    'low',
    32,
    25,
    28,
    NOW() + INTERVAL '30 days'
)
ON CONFLICT DO NOTHING;

-- Update database types
COMMENT ON TABLE public.training_completions IS 'Stores driver training completion records';
COMMENT ON TABLE public.driver_compliance_scores IS 'Stores driver compliance assessment scores';

COMMENT ON COLUMN public.training_completions.training_type IS 'Type/category of training (e.g., driver-safety-fundamentals)';
COMMENT ON COLUMN public.training_completions.status IS 'Current status of training completion';
COMMENT ON COLUMN public.training_completions.progress IS 'Progress percentage (0-100)';
COMMENT ON COLUMN public.driver_compliance_scores.overall_score IS 'Overall compliance score (0-100)';
COMMENT ON COLUMN public.driver_compliance_scores.risk_level IS 'Risk assessment level (low/medium/high)';
