-- Enhanced Child Registration System Database Schema
-- This script creates a comprehensive child registration system for school transport

-- 1. Enhanced child_profiles table with comprehensive fields
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS school_name TEXT;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- School Information
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS school_address TEXT;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS school_start_date DATE;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS school_end_date DATE;

-- Enhanced Transport Information
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS alternative_pickup_locations TEXT[];
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS transport_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS transport_type TEXT CHECK (transport_type IN ('morning_only', 'afternoon_only', 'both'));
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS special_schedule_notes TEXT;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS holiday_transport_needed BOOLEAN DEFAULT false;

-- Enhanced Medical Information
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS allergies TEXT[];
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS medical_conditions TEXT[];
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS medications TEXT[];
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS emergency_procedures TEXT;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS medical_alert_info TEXT;

-- Special Needs
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS mobility_requirements TEXT;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS communication_needs TEXT;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS behavioral_considerations TEXT;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS required_equipment TEXT[];

-- Legal & Compliance
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS transport_consent BOOLEAN DEFAULT false;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS medical_consent BOOLEAN DEFAULT false;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS photo_consent BOOLEAN DEFAULT false;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS data_protection_consent BOOLEAN DEFAULT false;

-- Financial
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS discount_eligible BOOLEAN DEFAULT false;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS payment_schedule TEXT;

-- Communication
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'english';

-- Administrative
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS registration_date TIMESTAMP DEFAULT NOW();
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended'));
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS service_start_date DATE;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS service_end_date DATE;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS end_reason TEXT;

-- Risk Assessment
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS risk_assessment_level TEXT DEFAULT 'low' CHECK (risk_assessment_level IN ('low', 'medium', 'high'));
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS risk_assessment_notes TEXT;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS emergency_procedures_agreed BOOLEAN DEFAULT false;

-- 2. Enhanced emergency_contacts table
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS contact_type TEXT DEFAULT 'general' CHECK (contact_type IN ('general', 'medical', 'legal', 'school'));
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS priority_order INTEGER DEFAULT 0;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS available_times TEXT;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT CHECK (preferred_contact_method IN ('phone', 'email', 'sms'));
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS medical_qualifications TEXT;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS can_authorize_treatment BOOLEAN DEFAULT false;

-- 3. Create child_documents table for document management
CREATE TABLE IF NOT EXISTS public.child_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id BIGINT REFERENCES child_profiles(id) ON DELETE CASCADE,
  
  document_type TEXT NOT NULL CHECK (document_type IN (
    'birth_certificate', 'medical_certificate', 'custody_document', 
    'special_needs_assessment', 'consent_form', 'photo_consent',
    'medical_consent', 'transport_consent', 'other'
  )),
  
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP,
  
  -- Expiry
  expiry_date DATE,
  renewal_reminder_sent BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create child_registration_steps table for tracking registration progress
CREATE TABLE IF NOT EXISTS public.child_registration_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id BIGINT REFERENCES child_profiles(id) ON DELETE CASCADE,
  
  step_name TEXT NOT NULL CHECK (step_name IN (
    'basic_info', 'transport_details', 'medical_info', 
    'emergency_contacts', 'legal_consent', 'review_submit'
  )),
  
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  data_snapshot JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create schools table for school management
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  school_type TEXT CHECK (school_type IN ('primary', 'secondary', 'special', 'college', 'university')),
  local_authority TEXT,
  ofsted_rating TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_child_profiles_parent_id ON public.child_profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_child_profiles_approval_status ON public.child_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_child_profiles_school_name ON public.child_profiles(school_name);
CREATE INDEX IF NOT EXISTS idx_child_documents_child_id ON public.child_documents(child_id);
CREATE INDEX IF NOT EXISTS idx_child_documents_type ON public.child_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_child_registration_steps_child_id ON public.child_registration_steps(child_id);
CREATE INDEX IF NOT EXISTS idx_schools_name ON public.schools(name);

-- 7. Enable Row Level Security
ALTER TABLE public.child_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_registration_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for child_documents
CREATE POLICY "Parents can manage their children's documents" 
ON public.child_documents 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_documents.child_id 
    AND cp.parent_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all documents" 
ON public.child_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- 9. Create RLS policies for child_registration_steps
CREATE POLICY "Parents can manage their children's registration steps" 
ON public.child_registration_steps 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_registration_steps.child_id 
    AND cp.parent_id = auth.uid()
  )
);

-- 10. Create RLS policies for schools
CREATE POLICY "Everyone can view schools" 
ON public.schools 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage schools" 
ON public.schools 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- 11. Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Create triggers for updated_at
CREATE TRIGGER update_child_documents_updated_at
    BEFORE UPDATE ON public.child_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_child_registration_steps_updated_at
    BEFORE UPDATE ON public.child_registration_steps
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON public.schools
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Insert sample schools
INSERT INTO public.schools (name, address, phone, email, school_type, local_authority) VALUES 
('Elmwood Primary School', '123 Elmwood Street, Anytown, AT1 2AB', '01234 567890', 'info@elmwood.primary.sch.uk', 'primary', 'Anytown Council'),
('Oakridge Secondary School', '456 Oakridge Road, Anytown, AT3 4CD', '01234 567891', 'info@oakridge.secondary.sch.uk', 'secondary', 'Anytown Council'),
('Maplewood Special School', '789 Maplewood Lane, Anytown, AT5 6EF', '01234 567892', 'info@maplewood.special.sch.uk', 'special', 'Anytown Council');

-- 14. Update existing children with enhanced data
UPDATE public.child_profiles 
SET 
  school_name = 'Elmwood Primary School',
  gender = 'female',
  nationality = 'British',
  student_id = 'EPS-2024-001',
  school_address = '123 Elmwood Street, Anytown, AT1 2AB',
  class_name = 'Class 3A',
  school_start_date = '2024-09-01',
  transport_days = ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  transport_type = 'both',
  allergies = ARRAY['peanuts'],
  medical_conditions = ARRAY['asthma'],
  medications = ARRAY['inhaler'],
  emergency_procedures = 'Use blue inhaler if breathing difficulties',
  transport_consent = true,
  medical_consent = true,
  photo_consent = true,
  data_protection_consent = true,
  approval_status = 'approved',
  risk_assessment_level = 'low'
WHERE first_name = 'Emma' AND last_name = 'Johnson';

UPDATE public.child_profiles 
SET 
  school_name = 'Elmwood Primary School',
  gender = 'male',
  nationality = 'British',
  student_id = 'EPS-2024-002',
  school_address = '123 Elmwood Street, Anytown, AT1 2AB',
  class_name = 'Class 1B',
  school_start_date = '2024-09-01',
  transport_days = ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  transport_type = 'both',
  allergies = ARRAY[]::TEXT[],
  medical_conditions = ARRAY[]::TEXT[],
  medications = ARRAY[]::TEXT[],
  emergency_procedures = 'None',
  transport_consent = true,
  medical_consent = true,
  photo_consent = true,
  data_protection_consent = true,
  approval_status = 'approved',
  risk_assessment_level = 'low'
WHERE first_name = 'Liam' AND last_name = 'Johnson';

-- 15. Display the enhanced schema
SELECT 'Enhanced Child Registration Schema Created Successfully!' as status;

SELECT 'Enhanced Child Profiles:' as info;
SELECT 
  first_name,
  last_name,
  gender,
  nationality,
  student_id,
  school_name,
  grade_level,
  approval_status,
  risk_assessment_level
FROM child_profiles
ORDER BY first_name;

SELECT 'Sample Schools:' as info;
SELECT 
  name,
  school_type,
  local_authority
FROM schools
ORDER BY name;
