-- First, let's create a proper notification permissions system
CREATE TABLE IF NOT EXISTS public.notification_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_role TEXT NOT NULL,
  recipient_role TEXT NOT NULL,
  can_send BOOLEAN NOT NULL DEFAULT true,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_role, recipient_role, organization_id)
);

-- Enable RLS on notification permissions
ALTER TABLE public.notification_permissions ENABLE ROW LEVEL SECURITY;

-- Create policy for notification permissions
CREATE POLICY "Users can view organization notification permissions"
ON public.notification_permissions
FOR SELECT
TO authenticated
USING (organization_id IN (
  SELECT organization_id FROM profiles WHERE id = auth.uid()
));

-- Insert default notification permissions based on requirements
INSERT INTO public.notification_permissions (sender_role, recipient_role, can_send) VALUES
('admin', 'driver', true),
('admin', 'mechanic', true), 
('admin', 'council', true),
('admin', 'parent', true),
('driver', 'admin', true),
('driver', 'mechanic', true),
('driver', 'parent', true),
('parent', 'driver', true),
('parent', 'council', true),
('mechanic', 'admin', true),
('council', 'admin', true),
('council', 'parent', true)
ON CONFLICT (sender_role, recipient_role, organization_id) DO NOTHING;

-- Add function to check notification permissions
CREATE OR REPLACE FUNCTION public.can_send_notification(
  sender_user_id UUID,
  recipient_user_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  sender_role TEXT;
  recipient_role TEXT;
  sender_org_id UUID;
  recipient_org_id UUID;
  can_send_flag BOOLEAN := false;
BEGIN
  -- Get sender info
  SELECT role, organization_id INTO sender_role, sender_org_id
  FROM public.profiles 
  WHERE id = sender_user_id;
  
  -- Get recipient info
  SELECT role, organization_id INTO recipient_role, recipient_org_id
  FROM public.profiles 
  WHERE id = recipient_user_id;
  
  -- Check if both users are in the same organization
  IF sender_org_id != recipient_org_id OR sender_org_id IS NULL OR recipient_org_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check permissions table
  SELECT COALESCE(np.can_send, false) INTO can_send_flag
  FROM public.notification_permissions np
  WHERE np.sender_role = sender_role
    AND np.recipient_role = recipient_role
    AND (np.organization_id = sender_org_id OR np.organization_id IS NULL);
  
  RETURN COALESCE(can_send_flag, false);
END;
$$;

-- Create enhanced function to get defect reports from both tables
CREATE OR REPLACE FUNCTION public.get_defect_reports(org_id UUID)
RETURNS TABLE(
  id UUID,
  defect_number TEXT,
  source_table TEXT,
  vehicle_id UUID,
  driver_id UUID,
  report_date DATE,
  defect_status TEXT,
  priority TEXT,
  defects_description TEXT,
  notes TEXT,
  vehicle_number TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  license_plate TEXT,
  driver_first_name TEXT,
  driver_last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  -- Get defects from vehicle_inspections
  SELECT 
    vi.id,
    vi.defect_number,
    'vehicle_inspections'::TEXT as source_table,
    vi.vehicle_id,
    vi.driver_id,
    vi.inspection_date as report_date,
    vi.overall_status as defect_status,
    CASE 
      WHEN vi.overall_status = 'failed' THEN 'urgent'
      WHEN vi.overall_status = 'flagged' THEN 'high'
      ELSE 'medium'
    END as priority,
    COALESCE(
      (SELECT string_agg(iq.question_text || ': ' || iq.response, '; ')
       FROM inspection_questions iq 
       WHERE iq.inspection_id = vi.id 
       AND iq.response IN ('fail', 'flag')), 
      'Defects found during inspection'
    ) as defects_description,
    vi.notes,
    v.vehicle_number,
    v.make as vehicle_make,
    v.model as vehicle_model,
    v.license_plate,
    p.first_name as driver_first_name,
    p.last_name as driver_last_name,
    vi.created_at
  FROM public.vehicle_inspections vi
  LEFT JOIN public.vehicles v ON vi.vehicle_id = v.id
  LEFT JOIN public.profiles p ON vi.driver_id = p.id
  WHERE vi.defects_found = true
    AND vi.organization_id = org_id
    AND v.organization_id_new = org_id

  UNION ALL

  -- Get defects from vehicle_checks  
  SELECT 
    vc.id,
    vc.defect_number,
    'vehicle_checks'::TEXT as source_table,
    vc.vehicle_id,
    vc.driver_id,
    vc.check_date as report_date,
    CASE 
      WHEN vc.requires_maintenance = true THEN 'requires_maintenance'
      WHEN vc.issues_found = true THEN 'issues_found'
      ELSE 'resolved'
    END as defect_status,
    COALESCE(vc.maintenance_priority, 'medium') as priority,
    CASE 
      WHEN vc.issues_reported IS NOT NULL AND array_length(vc.issues_reported, 1) > 0 
      THEN array_to_string(vc.issues_reported, '; ')
      ELSE 'Issues found during vehicle check'
    END as defects_description,
    vc.notes,
    v.vehicle_number,
    v.make as vehicle_make,
    v.model as vehicle_model,
    v.license_plate,
    p.first_name as driver_first_name,
    p.last_name as driver_last_name,
    vc.created_at
  FROM public.vehicle_checks vc
  LEFT JOIN public.vehicles v ON vc.vehicle_id = v.id
  LEFT JOIN public.profiles p ON vc.driver_id = p.id
  WHERE (vc.issues_found = true OR vc.requires_maintenance = true)
    AND vc.organization_id = org_id
    AND v.organization_id_new = org_id

  ORDER BY created_at DESC;
$$;