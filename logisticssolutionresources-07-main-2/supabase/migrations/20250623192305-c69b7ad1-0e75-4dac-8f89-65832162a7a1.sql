
-- Create child_profiles table for detailed child information
CREATE TABLE public.child_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES auth.users NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  grade TEXT,
  school TEXT,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_conditions TEXT,
  allergies TEXT,
  special_instructions TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk_assessments table for special needs documentation
CREATE TABLE public.risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE NOT NULL,
  assessment_type TEXT NOT NULL, -- 'mobility', 'behavioral', 'medical', 'safety'
  risk_level TEXT NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high'
  description TEXT NOT NULL,
  required_equipment TEXT, -- 'car_seat', 'harness', 'wheelchair_access', etc.
  special_instructions TEXT,
  document_url TEXT,
  created_by UUID REFERENCES auth.users NOT NULL,
  approved_by UUID REFERENCES auth.users,
  approval_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_attendance table for tracking daily transport status
CREATE TABLE public.daily_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE NOT NULL,
  route_id UUID REFERENCES public.routes(id) NOT NULL,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'attending', -- 'attending', 'absent', 'late_pickup', 'early_pickup'
  pickup_status TEXT DEFAULT 'pending', -- 'pending', 'picked_up', 'missed', 'cancelled'
  dropoff_status TEXT DEFAULT 'pending', -- 'pending', 'dropped_off', 'no_show'
  parent_notes TEXT,
  driver_notes TEXT,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id, attendance_date)
);

-- Enable RLS on all tables
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;

-- RLS policies for child_profiles
CREATE POLICY "Parents can manage their children profiles"
  ON public.child_profiles
  FOR ALL
  USING (auth.uid() = parent_id);

CREATE POLICY "Drivers can view children on their routes"
  ON public.child_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.driver_assignments da ON s.route_id = da.route_id
      WHERE s.parent_id = parent_id AND da.driver_id = auth.uid() AND da.is_active = true
    )
  );

-- RLS policies for risk_assessments
CREATE POLICY "Parents can manage their children risk assessments"
  ON public.risk_assessments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.child_profiles cp
      WHERE cp.id = child_id AND cp.parent_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can view risk assessments for their route children"
  ON public.risk_assessments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.child_profiles cp
      JOIN public.students s ON cp.parent_id = s.parent_id
      JOIN public.driver_assignments da ON s.route_id = da.route_id
      WHERE cp.id = child_id AND da.driver_id = auth.uid() AND da.is_active = true
    )
  );

-- RLS policies for daily_attendance
CREATE POLICY "Parents can manage their children attendance"
  ON public.daily_attendance
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.child_profiles cp
      WHERE cp.id = child_id AND cp.parent_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can view and update attendance for their route children"
  ON public.daily_attendance
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.driver_assignments da
      WHERE da.route_id = daily_attendance.route_id AND da.driver_id = auth.uid() AND da.is_active = true
    )
  );

-- Create storage bucket for child profile images and risk assessment documents
INSERT INTO storage.buckets (id, name, public) VALUES ('child-profiles', 'child-profiles', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('risk-assessments', 'risk-assessments', false);

-- Storage policies for child profile images
CREATE POLICY "Parents can upload their children profile images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'child-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view child profile images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'child-profiles');

-- Storage policies for risk assessment documents
CREATE POLICY "Parents can upload risk assessment documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'risk-assessments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authorized users can view risk assessment documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'risk-assessments' AND 
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'driver')
      )
    )
  );
