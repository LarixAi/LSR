-- Create vehicle_check_questions table for vehicle check questions
CREATE TABLE IF NOT EXISTS public.vehicle_check_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.vehicle_check_templates(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'yes_no' CHECK (question_type IN ('yes_no', 'multiple_choice', 'text', 'number', 'photo', 'checkbox')),
  required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  options TEXT[], -- Array of options for multiple choice questions
  default_value TEXT,
  help_text TEXT,
  category TEXT, -- Group questions by category (e.g., 'engine', 'brakes', 'lights', 'tires')
  safety_critical BOOLEAN DEFAULT false,
  compliance_required BOOLEAN DEFAULT false,
  compliance_standard TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_check_questions_template_id ON public.vehicle_check_questions(template_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_check_questions_order_index ON public.vehicle_check_questions(order_index);
CREATE INDEX IF NOT EXISTS idx_vehicle_check_questions_question_type ON public.vehicle_check_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_vehicle_check_questions_required ON public.vehicle_check_questions(required);
CREATE INDEX IF NOT EXISTS idx_vehicle_check_questions_category ON public.vehicle_check_questions(category);
CREATE INDEX IF NOT EXISTS idx_vehicle_check_questions_safety_critical ON public.vehicle_check_questions(safety_critical);

-- Enable Row Level Security
ALTER TABLE public.vehicle_check_questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (questions inherit organization access from their template)
CREATE POLICY "Users can view vehicle check questions from their organization" ON public.vehicle_check_questions
  FOR SELECT USING (template_id IN (
    SELECT id FROM public.vehicle_check_templates WHERE organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert vehicle check questions for their organization" ON public.vehicle_check_questions
  FOR INSERT WITH CHECK (template_id IN (
    SELECT id FROM public.vehicle_check_templates WHERE organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can update vehicle check questions from their organization" ON public.vehicle_check_questions
  FOR UPDATE USING (template_id IN (
    SELECT id FROM public.vehicle_check_templates WHERE organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete vehicle check questions from their organization" ON public.vehicle_check_questions
  FOR DELETE USING (template_id IN (
    SELECT id FROM public.vehicle_check_templates WHERE organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

-- Create updated_at trigger
CREATE TRIGGER handle_vehicle_check_questions_updated_at
  BEFORE UPDATE ON public.vehicle_check_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
