
-- Add compliance review fields to vehicle_checks table
ALTER TABLE public.vehicle_checks 
ADD COLUMN IF NOT EXISTS compliance_reviewed_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS compliance_reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS compliance_review_status text DEFAULT 'pending' CHECK (compliance_review_status IN ('pending', 'approved', 'rejected', 'requires_action')),
ADD COLUMN IF NOT EXISTS compliance_review_notes text,
ADD COLUMN IF NOT EXISTS review_priority text DEFAULT 'normal' CHECK (review_priority IN ('low', 'normal', 'high', 'urgent'));

-- Create compliance check items table for standardized check requirements
CREATE TABLE IF NOT EXISTS public.compliance_check_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id),
  category text NOT NULL,
  item_name text NOT NULL,
  description text,
  is_mandatory boolean DEFAULT true,
  points_value integer DEFAULT 0,
  regulatory_reference text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create vehicle check responses table to track individual item compliance
CREATE TABLE IF NOT EXISTS public.vehicle_check_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_check_id uuid REFERENCES public.vehicle_checks(id) ON DELETE CASCADE,
  check_item_id uuid REFERENCES public.compliance_check_items(id),
  response_value text NOT NULL,
  notes text,
  is_compliant boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for compliance check items
ALTER TABLE public.compliance_check_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view compliance check items" 
  ON public.compliance_check_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      JOIN public.user_organizations uo ON p.id = uo.user_id
      WHERE p.id = auth.uid() 
      AND uo.organization_id = compliance_check_items.organization_id
      AND uo.is_active = true
    )
  );

CREATE POLICY "Admins and compliance officers can manage check items" 
  ON public.compliance_check_items 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'council', 'compliance_officer')
    )
  );

-- Add RLS policies for vehicle check responses
ALTER TABLE public.vehicle_check_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view check responses for their organization" 
  ON public.vehicle_check_responses 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicle_checks vc
      JOIN public.profiles p ON vc.driver_id = p.id
      JOIN public.user_organizations uo ON p.id = uo.user_id
      WHERE vc.id = vehicle_check_responses.vehicle_check_id
      AND uo.user_id = auth.uid()
      AND uo.is_active = true
    )
  );

CREATE POLICY "Drivers can create check responses for their checks" 
  ON public.vehicle_check_responses 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vehicle_checks vc
      WHERE vc.id = vehicle_check_responses.vehicle_check_id
      AND vc.driver_id = auth.uid()
    )
  );

CREATE POLICY "Compliance officers and admins can manage all responses" 
  ON public.vehicle_check_responses 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'council', 'compliance_officer')
    )
  );

-- Insert default compliance check items
INSERT INTO public.compliance_check_items (category, item_name, description, is_mandatory, points_value, regulatory_reference) VALUES
('Safety Equipment', 'First Aid Kit', 'First aid kit present and within expiry date', true, 10, 'Transport Safety Regulation 4.2'),
('Safety Equipment', 'Fire Extinguisher', 'Fire extinguisher present and serviced', true, 15, 'Fire Safety Code 3.1'),
('Safety Equipment', 'Emergency Triangle', 'Emergency warning triangle available', true, 5, 'Road Traffic Act 12.3'),
('Safety Equipment', 'High Visibility Vest', 'Driver high visibility vest available', true, 5, 'Workplace Safety Act 8.1'),
('Documentation', 'Vehicle Registration', 'Current vehicle registration certificate', true, 20, 'Motor Vehicle Act 5.1'),
('Documentation', 'Insurance Certificate', 'Valid insurance certificate present', true, 25, 'Insurance Act 2.4'),
('Documentation', 'Driver License', 'Valid driver license for vehicle class', true, 30, 'Licensing Act 1.2'),
('Documentation', 'Roadworthiness Certificate', 'Current roadworthiness certificate', true, 20, 'Vehicle Standards 6.1'),
('Vehicle Condition', 'Tire Condition', 'All tires in safe condition with adequate tread', true, 15, 'Vehicle Safety Standard 3.2'),
('Vehicle Condition', 'Brake System', 'Brake system functioning properly', true, 25, 'Brake Safety Standard 1.1'),
('Vehicle Condition', 'Lighting System', 'All lights functioning correctly', true, 10, 'Lighting Standard 2.3'),
('Vehicle Condition', 'Steering System', 'Steering responsive and properly aligned', true, 20, 'Steering Safety 4.1'),
('Cleanliness', 'Interior Cleanliness', 'Vehicle interior clean and presentable', false, 5, 'Service Standard 7.2'),
('Cleanliness', 'Exterior Cleanliness', 'Vehicle exterior clean and professional', false, 5, 'Service Standard 7.1');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_compliance_review ON public.vehicle_checks(compliance_review_status, compliance_reviewed_at);
CREATE INDEX IF NOT EXISTS idx_compliance_check_items_category ON public.compliance_check_items(category, is_active);
CREATE INDEX IF NOT EXISTS idx_vehicle_check_responses_check_id ON public.vehicle_check_responses(vehicle_check_id);
