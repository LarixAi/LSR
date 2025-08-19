-- Create Attendance and Emergency Contacts Tables
-- This script creates the necessary tables for real attendance and emergency contact functionality

-- 1. Create daily_attendance table for tracking daily transport status
CREATE TABLE IF NOT EXISTS public.daily_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id BIGINT NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'attending' CHECK (status IN ('attending', 'absent', 'late_pickup', 'early_pickup', 'sick', 'holiday')),
  pickup_status TEXT DEFAULT 'pending' CHECK (pickup_status IN ('pending', 'picked_up', 'missed', 'cancelled')),
  dropoff_status TEXT DEFAULT 'pending' CHECK (dropoff_status IN ('pending', 'dropped_off', 'no_show')),
  parent_notes TEXT,
  driver_notes TEXT,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id, attendance_date)
);

-- 2. Create emergency_contacts table for storing emergency contact information
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id BIGINT NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_attendance_child_id ON public.daily_attendance(child_id);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_date ON public.daily_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_status ON public.daily_attendance(status);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_child_id ON public.emergency_contacts(child_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_primary ON public.emergency_contacts(is_primary);

-- 4. Enable Row Level Security
ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for daily_attendance
CREATE POLICY "Parents can view their children's attendance" 
ON public.daily_attendance 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = daily_attendance.child_id 
    AND cp.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can update their children's attendance" 
ON public.daily_attendance 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = daily_attendance.child_id 
    AND cp.parent_id = auth.uid()
  )
);

CREATE POLICY "Drivers can view attendance for their routes" 
ON public.daily_attendance 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.route_assignments ra
    WHERE ra.route_id = daily_attendance.route_id 
    AND ra.driver_id = auth.uid()
    AND ra.assignment_date = daily_attendance.attendance_date
  )
);

CREATE POLICY "Drivers can update attendance for their routes" 
ON public.daily_attendance 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.route_assignments ra
    WHERE ra.route_id = daily_attendance.route_id 
    AND ra.driver_id = auth.uid()
    AND ra.assignment_date = daily_attendance.attendance_date
  )
);

-- 6. Create RLS policies for emergency_contacts
CREATE POLICY "Parents can manage their children's emergency contacts" 
ON public.emergency_contacts 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = emergency_contacts.child_id 
    AND cp.parent_id = auth.uid()
  )
);

CREATE POLICY "Drivers can view emergency contacts for their route children" 
ON public.emergency_contacts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    JOIN public.route_assignments ra ON cp.route_id = ra.route_id
    WHERE cp.id = emergency_contacts.child_id 
    AND ra.driver_id = auth.uid()
    AND ra.assignment_date = CURRENT_DATE
  )
);

-- 7. Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create triggers for updated_at
CREATE TRIGGER update_daily_attendance_updated_at
    BEFORE UPDATE ON public.daily_attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
    BEFORE UPDATE ON public.emergency_contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Insert sample data for testing
-- Sample emergency contacts for existing children
INSERT INTO public.emergency_contacts (
  child_id,
  contact_name,
  relationship,
  phone,
  email,
  is_primary,
  is_active
) VALUES 
-- Emergency contacts for Emma Johnson
(
  (SELECT id FROM child_profiles WHERE first_name = 'Emma' AND last_name = 'Johnson' LIMIT 1),
  'Sarah Johnson',
  'Mother',
  '555-0124',
  'sarah.johnson@example.com',
  true,
  true
),
(
  (SELECT id FROM child_profiles WHERE first_name = 'Emma' AND last_name = 'Johnson' LIMIT 1),
  'Michael Johnson',
  'Father',
  '555-0125',
  'michael.johnson@example.com',
  false,
  true
),
-- Emergency contacts for Liam Johnson
(
  (SELECT id FROM child_profiles WHERE first_name = 'Liam' AND last_name = 'Johnson' LIMIT 1),
  'Sarah Johnson',
  'Mother',
  '555-0124',
  'sarah.johnson@example.com',
  true,
  true
),
(
  (SELECT id FROM child_profiles WHERE first_name = 'Liam' AND last_name = 'Johnson' LIMIT 1),
  'Grandma Johnson',
  'Grandmother',
  '555-0126',
  'grandma.johnson@example.com',
  false,
  true
);

-- Sample attendance records for today
INSERT INTO public.daily_attendance (
  child_id,
  route_id,
  attendance_date,
  status,
  pickup_status,
  dropoff_status,
  parent_notes
) VALUES 
(
  (SELECT id FROM child_profiles WHERE first_name = 'Emma' AND last_name = 'Johnson' LIMIT 1),
  (SELECT id FROM routes WHERE name = 'Morning School Run' LIMIT 1),
  CURRENT_DATE,
  'attending',
  'picked_up',
  'pending',
  'Emma is feeling great today!'
),
(
  (SELECT id FROM child_profiles WHERE first_name = 'Liam' AND last_name = 'Johnson' LIMIT 1),
  (SELECT id FROM routes WHERE name = 'Afternoon Return Route' LIMIT 1),
  CURRENT_DATE,
  'attending',
  'pending',
  'pending',
  'Liam has his lunch box today'
);

-- 10. Display the created data
SELECT 'Attendance and Emergency Contacts Tables Created Successfully!' as status;

SELECT 'Emergency Contacts Created:' as info;
SELECT 
  ec.contact_name,
  ec.relationship,
  ec.phone,
  ec.is_primary,
  CONCAT(cp.first_name, ' ', cp.last_name) as child_name
FROM emergency_contacts ec
JOIN child_profiles cp ON ec.child_id = cp.id
ORDER BY cp.first_name, ec.is_primary DESC;

SELECT 'Today''s Attendance Records:' as info;
SELECT 
  CONCAT(cp.first_name, ' ', cp.last_name) as child_name,
  da.status,
  da.pickup_status,
  da.dropoff_status,
  da.parent_notes,
  r.name as route_name
FROM daily_attendance da
JOIN child_profiles cp ON da.child_id = cp.id
LEFT JOIN routes r ON da.route_id = r.id
WHERE da.attendance_date = CURRENT_DATE
ORDER BY cp.first_name;
