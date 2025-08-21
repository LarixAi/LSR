-- Fix child_profiles table structure and ensure proper foreign key relationships

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS child_transport_status CASCADE;
DROP TABLE IF EXISTS parent_notifications CASCADE;
DROP TABLE IF EXISTS transport_schedules CASCADE;
DROP TABLE IF EXISTS student_attendance CASCADE;
DROP TABLE IF EXISTS parent_communications CASCADE;
DROP TABLE IF EXISTS risk_assessments CASCADE;
DROP TABLE IF EXISTS child_profiles CASCADE;

-- Recreate child_profiles table with proper structure
CREATE TABLE child_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    grade TEXT,
    school TEXT,
    pickup_location TEXT,
    dropoff_location TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_conditions TEXT,
    allergies TEXT,
    special_instructions TEXT,
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate risk_assessments table
CREATE TABLE risk_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('medical', 'behavioral', 'physical', 'environmental')),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    required_equipment TEXT,
    document_url TEXT,
    assessed_by UUID REFERENCES auth.users(id),
    assessment_date DATE DEFAULT CURRENT_DATE,
    review_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate parent_communications table
CREATE TABLE parent_communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES auth.users(id),
    child_id UUID REFERENCES child_profiles(id),
    message_type TEXT NOT NULL CHECK (message_type IN ('general', 'delay', 'incident', 'absence', 'pickup', 'emergency')),
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate student_attendance table
CREATE TABLE student_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused', 'unexcused')),
    pickup_time TIME,
    dropoff_time TIME,
    driver_id UUID REFERENCES auth.users(id),
    vehicle_id UUID REFERENCES vehicles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(child_id, date)
);

-- Recreate transport_schedules table
CREATE TABLE transport_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
    route_id UUID REFERENCES routes(id),
    pickup_time TIME NOT NULL,
    dropoff_time TIME NOT NULL,
    pickup_location TEXT NOT NULL,
    dropoff_location TEXT NOT NULL,
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5}', -- Monday=1, Sunday=7
    is_active BOOLEAN DEFAULT true,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate parent_notifications table
CREATE TABLE parent_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES child_profiles(id),
    type TEXT NOT NULL CHECK (type IN ('pickup', 'dropoff', 'delay', 'incident', 'absence', 'reminder', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate child_transport_status table
CREATE TABLE child_transport_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('at_school', 'on_transport', 'at_home', 'pickup_pending', 'dropoff_pending')),
    current_location TEXT,
    driver_id UUID REFERENCES auth.users(id),
    vehicle_id UUID REFERENCES vehicles(id),
    route_id UUID REFERENCES routes(id),
    estimated_arrival TIME,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_child_profiles_parent_id ON child_profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_child_profiles_school ON child_profiles(school);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_child_id ON risk_assessments(child_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_type ON risk_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_parent_communications_parent_id ON parent_communications(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_communications_child_id ON parent_communications(child_id);
CREATE INDEX IF NOT EXISTS idx_parent_communications_sent_at ON parent_communications(sent_at);
CREATE INDEX IF NOT EXISTS idx_student_attendance_child_id ON student_attendance(child_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_date ON student_attendance(date);
CREATE INDEX IF NOT EXISTS idx_transport_schedules_child_id ON transport_schedules(child_id);
CREATE INDEX IF NOT EXISTS idx_transport_schedules_route_id ON transport_schedules(route_id);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_parent_id ON parent_notifications(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_is_read ON parent_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_child_transport_status_child_id ON child_transport_status(child_id);
CREATE INDEX IF NOT EXISTS idx_child_transport_status_status ON child_transport_status(status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_child_profiles_updated_at 
    BEFORE UPDATE ON child_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_assessments_updated_at 
    BEFORE UPDATE ON risk_assessments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_attendance_updated_at 
    BEFORE UPDATE ON student_attendance 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transport_schedules_updated_at 
    BEFORE UPDATE ON transport_schedules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_transport_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for child_profiles
CREATE POLICY "Parents can view own children" ON child_profiles
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert own children" ON child_profiles
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update own children" ON child_profiles
    FOR UPDATE USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete own children" ON child_profiles
    FOR DELETE USING (auth.uid() = parent_id);

-- Admins can view all children
CREATE POLICY "Admins can view all children" ON child_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'council')
        )
    );

-- Create RLS policies for risk_assessments
CREATE POLICY "Parents can view own children's risk assessments" ON risk_assessments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM child_profiles 
            WHERE child_profiles.id = risk_assessments.child_id 
            AND child_profiles.parent_id = auth.uid()
        )
    );

CREATE POLICY "Parents can insert risk assessments for own children" ON risk_assessments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM child_profiles 
            WHERE child_profiles.id = risk_assessments.child_id 
            AND child_profiles.parent_id = auth.uid()
        )
    );

-- Create RLS policies for parent_communications
CREATE POLICY "Users can view own communications" ON parent_communications
    FOR SELECT USING (
        auth.uid() = parent_id OR auth.uid() = driver_id
    );

CREATE POLICY "Users can insert communications" ON parent_communications
    FOR INSERT WITH CHECK (
        auth.uid() = parent_id OR auth.uid() = driver_id
    );

-- Create RLS policies for student_attendance
CREATE POLICY "Parents can view own children's attendance" ON student_attendance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM child_profiles 
            WHERE child_profiles.id = student_attendance.child_id 
            AND child_profiles.parent_id = auth.uid()
        )
    );

-- Create RLS policies for transport_schedules
CREATE POLICY "Parents can view own children's schedules" ON transport_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM child_profiles 
            WHERE child_profiles.id = transport_schedules.child_id 
            AND child_profiles.parent_id = auth.uid()
        )
    );

-- Create RLS policies for parent_notifications
CREATE POLICY "Parents can view own notifications" ON parent_notifications
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can update own notifications" ON parent_notifications
    FOR UPDATE USING (auth.uid() = parent_id);

-- Create RLS policies for child_transport_status
CREATE POLICY "Parents can view own children's transport status" ON child_transport_status
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM child_profiles 
            WHERE child_profiles.id = child_transport_status.child_id 
            AND child_profiles.parent_id = auth.uid()
        )
    );

-- Insert sample data for testing
INSERT INTO child_profiles (
    parent_id,
    first_name,
    last_name,
    date_of_birth,
    grade,
    school,
    pickup_location,
    dropoff_location,
    emergency_contact_name,
    emergency_contact_phone,
    medical_conditions,
    allergies,
    special_instructions
) VALUES 
(
    (SELECT id FROM auth.users WHERE email = 'laronelaing4@outlook.com' LIMIT 1),
    'Emma',
    'Johnson',
    '2015-03-15',
    '3rd Grade',
    'Lincoln Elementary',
    '123 Main Street',
    'Lincoln Elementary School',
    'Jane Johnson',
    '555-0123',
    'None',
    'Peanuts',
    'Please ensure seatbelt is properly fastened'
),
(
    (SELECT id FROM auth.users WHERE email = 'laronelaing4@outlook.com' LIMIT 1),
    'Noah',
    'Johnson',
    '2017-08-22',
    '1st Grade',
    'Lincoln Elementary',
    '123 Main Street',
    'Lincoln Elementary School',
    'Jane Johnson',
    '555-0123',
    'Asthma',
    'None',
    'Carries inhaler in backpack'
)
ON CONFLICT DO NOTHING;

-- Insert sample risk assessments
INSERT INTO risk_assessments (
    child_id,
    assessment_type,
    risk_level,
    description,
    required_equipment
) VALUES 
(
    (SELECT id FROM child_profiles WHERE first_name = 'Noah' LIMIT 1),
    'medical',
    'medium',
    'Child has asthma and may need inhaler during transport',
    'Emergency inhaler accessible'
),
(
    (SELECT id FROM child_profiles WHERE first_name = 'Noah' LIMIT 1),
    'behavioral',
    'low',
    'Child may get car sick on longer trips',
    'Motion sickness bags available'
)
ON CONFLICT DO NOTHING;

-- Insert sample communications
INSERT INTO parent_communications (
    parent_id,
    driver_id,
    child_id,
    message_type,
    subject,
    message
) VALUES 
(
    (SELECT id FROM auth.users WHERE email = 'laronelaing4@outlook.com' LIMIT 1),
    (SELECT id FROM auth.users WHERE role = 'driver' LIMIT 1),
    (SELECT id FROM child_profiles WHERE first_name = 'Emma' LIMIT 1),
    'delay',
    'Running Late',
    'Running 15 minutes late due to heavy traffic on Main Street'
),
(
    (SELECT id FROM auth.users WHERE email = 'laronelaing4@outlook.com' LIMIT 1),
    (SELECT id FROM auth.users WHERE role = 'driver' LIMIT 1),
    (SELECT id FROM child_profiles WHERE first_name = 'Emma' LIMIT 1),
    'absence',
    'Student Absence',
    'Emma will not be taking the bus tomorrow - doctor appointment at 9 AM'
)
ON CONFLICT DO NOTHING;

