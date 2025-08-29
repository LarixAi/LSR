-- Smart Inspections System Setup
-- This script creates the database tables for managing vehicle inspection question sets

-- 1. Drop existing tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS inspection_questions CASCADE;
DROP TABLE IF EXISTS inspection_question_sets CASCADE;

-- 2. Create inspection_question_sets table
CREATE TABLE inspection_question_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create inspection_questions table
CREATE TABLE inspection_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  is_required BOOLEAN DEFAULT TRUE,
  has_photo BOOLEAN DEFAULT FALSE,
  has_notes BOOLEAN DEFAULT TRUE,
  order_index INTEGER NOT NULL DEFAULT 0,
  question_set_id UUID REFERENCES inspection_question_sets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS on all tables
ALTER TABLE inspection_question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_questions ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for inspection_question_sets
CREATE POLICY "Users can view question sets for their organization" ON inspection_question_sets
  FOR SELECT USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert question sets for their organization" ON inspection_question_sets
  FOR INSERT WITH CHECK (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update question sets for their organization" ON inspection_question_sets
  FOR UPDATE USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete question sets for their organization" ON inspection_question_sets
  FOR DELETE USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 6. Create RLS policies for inspection_questions
CREATE POLICY "Users can view questions for their organization" ON inspection_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM inspection_question_sets qs
      WHERE qs.id = inspection_questions.question_set_id
      AND qs.organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert questions for their organization" ON inspection_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM inspection_question_sets qs
      WHERE qs.id = inspection_questions.question_set_id
      AND qs.organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update questions for their organization" ON inspection_questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM inspection_question_sets qs
      WHERE qs.id = inspection_questions.question_set_id
      AND qs.organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete questions for their organization" ON inspection_questions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM inspection_question_sets qs
      WHERE qs.id = inspection_questions.question_set_id
      AND qs.organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- 7. Create indexes for better performance
CREATE INDEX idx_inspection_question_sets_organization_id ON inspection_question_sets(organization_id);
CREATE INDEX idx_inspection_question_sets_active ON inspection_question_sets(is_active);
CREATE INDEX idx_inspection_question_sets_default ON inspection_question_sets(is_default);

CREATE INDEX idx_inspection_questions_set_id ON inspection_questions(question_set_id);
CREATE INDEX idx_inspection_questions_category ON inspection_questions(category);
CREATE INDEX idx_inspection_questions_order ON inspection_questions(order_index);
CREATE INDEX idx_inspection_questions_required ON inspection_questions(is_required);

-- 8. Grant permissions
GRANT ALL ON inspection_question_sets TO authenticated;
GRANT ALL ON inspection_questions TO authenticated;

-- 9. Insert default question sets
INSERT INTO inspection_question_sets (name, description, is_active, is_default, organization_id, created_by)
SELECT 
  'Daily Pre-Trip Inspection',
  'Standard daily pre-trip vehicle inspection checklist for safety and compliance',
  true,
  true,
  o.id,
  p.id
FROM organizations o
CROSS JOIN profiles p
WHERE p.role = 'admin'
AND p.organization_id = o.id
LIMIT 1;

INSERT INTO inspection_question_sets (name, description, is_active, is_default, organization_id, created_by)
SELECT 
  '4-Weekly Comprehensive Inspection',
  'Comprehensive vehicle inspection every 4 weeks for detailed maintenance assessment',
  true,
  false,
  o.id,
  p.id
FROM organizations o
CROSS JOIN profiles p
WHERE p.role = 'admin'
AND p.organization_id = o.id
LIMIT 1;

INSERT INTO inspection_question_sets (name, description, is_active, is_default, organization_id, created_by)
SELECT 
  '6-Weekly Safety Inspection',
  'Safety-focused inspection every 6 weeks for critical safety systems',
  true,
  false,
  o.id,
  p.id
FROM organizations o
CROSS JOIN profiles p
WHERE p.role = 'admin'
AND p.organization_id = o.id
LIMIT 1;

-- 10. Insert sample questions for the default set
INSERT INTO inspection_questions (question, category, is_required, has_photo, has_notes, order_index, question_set_id)
SELECT 
  'Are all lights working properly?',
  'lights',
  true,
  true,
  true,
  1,
  qs.id
FROM inspection_question_sets qs
WHERE qs.name = 'Daily Pre-Trip Inspection'
AND qs.is_default = true;

INSERT INTO inspection_questions (question, category, is_required, has_photo, has_notes, order_index, question_set_id)
SELECT 
  'Are tires in good condition with proper pressure?',
  'tires',
  true,
  true,
  true,
  2,
  qs.id
FROM inspection_question_sets qs
WHERE qs.name = 'Daily Pre-Trip Inspection'
AND qs.is_default = true;

INSERT INTO inspection_questions (question, category, is_required, has_photo, has_notes, order_index, question_set_id)
SELECT 
  'Are brakes functioning properly?',
  'brakes',
  true,
  false,
  true,
  3,
  qs.id
FROM inspection_question_sets qs
WHERE qs.name = 'Daily Pre-Trip Inspection'
AND qs.is_default = true;

INSERT INTO inspection_questions (question, category, is_required, has_photo, has_notes, order_index, question_set_id)
SELECT 
  'Is engine running smoothly?',
  'engine',
  true,
  false,
  true,
  4,
  qs.id
FROM inspection_question_sets qs
WHERE qs.name = 'Daily Pre-Trip Inspection'
AND qs.is_default = true;

INSERT INTO inspection_questions (question, category, is_required, has_photo, has_notes, order_index, question_set_id)
SELECT 
  'Is fuel level adequate for the journey?',
  'fuel',
  true,
  false,
  true,
  5,
  qs.id
FROM inspection_question_sets qs
WHERE qs.name = 'Daily Pre-Trip Inspection'
AND qs.is_default = true;

INSERT INTO inspection_questions (question, category, is_required, has_photo, has_notes, order_index, question_set_id)
SELECT 
  'Are all mirrors properly adjusted?',
  'general',
  true,
  false,
  true,
  6,
  qs.id
FROM inspection_question_sets qs
WHERE qs.name = 'Daily Pre-Trip Inspection'
AND qs.is_default = true;

INSERT INTO inspection_questions (question, category, is_required, has_photo, has_notes, order_index, question_set_id)
SELECT 
  'Is the navigation system working correctly?',
  'navigation',
  false,
  false,
  true,
  7,
  qs.id
FROM inspection_question_sets qs
WHERE qs.name = 'Daily Pre-Trip Inspection'
AND qs.is_default = true;

-- 11. Insert sample questions for 4-Weekly Comprehensive Inspection
INSERT INTO inspection_questions (question, category, is_required, has_photo, has_notes, order_index, question_set_id)
SELECT 
  'Check engine oil level and condition',
  'engine',
  true,
  true,
  true,
  1,
  qs.id
FROM inspection_question_sets qs
WHERE qs.name = '4-Weekly Comprehensive Inspection'
AND qs.is_default = false;

INSERT INTO inspection_questions (question, category, is_required, has_photo, has_notes, order_index, question_set_id)
SELECT 
  'Inspect brake pads and rotors for wear',
  'brakes',
  true,
  true,
  true,
  2,
  qs.id
FROM inspection_question_sets qs
WHERE qs.name = '4-Weekly Comprehensive Inspection'
AND qs.is_default = false;

INSERT INTO inspection_questions (question, category, is_required, has_photo, has_notes, order_index, question_set_id)
SELECT 
  'Check tire tread depth and condition',
  'tires',
  true,
  true,
  true,
  3,
  qs.id
FROM inspection_question_sets qs
WHERE qs.name = '4-Weekly Comprehensive Inspection'
AND qs.is_default = false;

-- 12. Insert sample questions for 6-Weekly Safety Inspection
INSERT INTO inspection_questions (question, category, is_required, has_photo, has_notes, order_index, question_set_id)
SELECT 
  'Test emergency brake system',
  'brakes',
  true,
  false,
  true,
  1,
  qs.id
FROM inspection_question_sets qs
WHERE qs.name = '6-Weekly Safety Inspection'
AND qs.is_default = false;

INSERT INTO inspection_questions (question, category, is_required, has_photo, has_notes, order_index, question_set_id)
SELECT 
  'Check seat belts for proper function',
  'general',
  true,
  false,
  true,
  2,
  qs.id
FROM inspection_question_sets qs
WHERE qs.name = '6-Weekly Safety Inspection'
AND qs.is_default = false;

INSERT INTO inspection_questions (question, category, is_required, has_photo, has_notes, order_index, question_set_id)
SELECT 
  'Test horn and emergency lights',
  'lights',
  true,
  false,
  true,
  3,
  qs.id
FROM inspection_question_sets qs
WHERE qs.name = '6-Weekly Safety Inspection'
AND qs.is_default = false;