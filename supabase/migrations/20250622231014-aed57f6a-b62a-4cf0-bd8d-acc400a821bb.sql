
-- Add onboarding status and employment fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_status TEXT CHECK (onboarding_status IN ('pending', 'in_progress', 'completed', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS employment_status TEXT CHECK (employment_status IN ('applicant', 'employee', 'terminated', 'inactive')) DEFAULT 'applicant',
ADD COLUMN IF NOT EXISTS hire_date DATE,
ADD COLUMN IF NOT EXISTS employee_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'Driver',
ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS onboarding_notes TEXT;

-- Create onboarding_tasks table for tracking required documents and steps
CREATE TABLE IF NOT EXISTS public.onboarding_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('document', 'training', 'medical', 'background_check', 'equipment', 'other')),
  is_required BOOLEAN DEFAULT true,
  position_specific TEXT, -- specific to certain positions
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_onboarding_tasks table to track individual progress
CREATE TABLE IF NOT EXISTS public.user_onboarding_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.onboarding_tasks(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'not_applicable')) DEFAULT 'pending',
  completed_date DATE,
  notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- Enable RLS on new tables
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for onboarding_tasks
CREATE POLICY "Admins and council can manage onboarding tasks" ON public.onboarding_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'council')
    )
  );

CREATE POLICY "Everyone can view onboarding tasks" ON public.onboarding_tasks
  FOR SELECT USING (true);

-- RLS policies for user_onboarding_tasks
CREATE POLICY "Admins and council can manage user onboarding tasks" ON public.user_onboarding_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'council')
    )
  );

CREATE POLICY "Users can view their own onboarding tasks" ON public.user_onboarding_tasks
  FOR SELECT USING (user_id = auth.uid());

-- Insert default onboarding tasks
INSERT INTO public.onboarding_tasks (name, description, category, is_required, sort_order) VALUES
('Driver License', 'Valid driver license with appropriate class', 'document', true, 1),
('Medical Certificate', 'Valid medical certificate for commercial driving', 'medical', true, 2),
('Background Check', 'Criminal background check clearance', 'background_check', true, 3),
('Drug Test', 'Pre-employment drug screening', 'medical', true, 4),
('Insurance Documents', 'Proof of insurance coverage', 'document', true, 5),
('Emergency Contact Form', 'Emergency contact information', 'document', true, 6),
('Tax Forms (W-4)', 'Federal and state tax withholding forms', 'document', true, 7),
('Direct Deposit Form', 'Banking information for payroll', 'document', true, 8),
('Employee Handbook', 'Review and acknowledge employee handbook', 'training', true, 9),
('Safety Training', 'Complete vehicle safety training course', 'training', true, 10),
('Route Familiarization', 'Complete assigned route training', 'training', true, 11),
('Vehicle Inspection Training', 'Learn daily vehicle inspection procedures', 'training', true, 12),
('Communication Device Setup', 'Setup and test communication equipment', 'equipment', true, 13),
('Uniform/Equipment Issued', 'Receive required uniforms and equipment', 'equipment', true, 14),
('Photo ID Badge', 'Employee identification badge', 'document', true, 15);

-- Update documents table to link with onboarding tasks
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS onboarding_task_id UUID REFERENCES public.onboarding_tasks(id),
ADD COLUMN IF NOT EXISTS is_onboarding_document BOOLEAN DEFAULT false;
