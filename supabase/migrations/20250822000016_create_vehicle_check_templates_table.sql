-- Create vehicle_check_templates table for vehicle check template management
CREATE TABLE IF NOT EXISTS public.vehicle_check_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  category TEXT CHECK (category IN ('pre_trip', 'post_trip', 'weekly', 'monthly', 'custom')),
  vehicle_types TEXT[], -- Array of vehicle types this template applies to
  required_checks INTEGER DEFAULT 0,
  optional_checks INTEGER DEFAULT 0,
  estimated_completion_time_minutes INTEGER,
  safety_critical BOOLEAN DEFAULT false,
  compliance_required BOOLEAN DEFAULT false,
  compliance_standards TEXT[], -- Array of compliance standards this template meets
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_check_templates_organization_id ON public.vehicle_check_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_check_templates_name ON public.vehicle_check_templates(name);
CREATE INDEX IF NOT EXISTS idx_vehicle_check_templates_category ON public.vehicle_check_templates(category);
CREATE INDEX IF NOT EXISTS idx_vehicle_check_templates_is_active ON public.vehicle_check_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_vehicle_check_templates_is_default ON public.vehicle_check_templates(is_default);
CREATE INDEX IF NOT EXISTS idx_vehicle_check_templates_created_at ON public.vehicle_check_templates(created_at);

-- Enable Row Level Security
ALTER TABLE public.vehicle_check_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view vehicle check templates from their organization" ON public.vehicle_check_templates
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert vehicle check templates for their organization" ON public.vehicle_check_templates
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update vehicle check templates from their organization" ON public.vehicle_check_templates
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete vehicle check templates from their organization" ON public.vehicle_check_templates
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger
CREATE TRIGGER handle_vehicle_check_templates_updated_at
  BEFORE UPDATE ON public.vehicle_check_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
