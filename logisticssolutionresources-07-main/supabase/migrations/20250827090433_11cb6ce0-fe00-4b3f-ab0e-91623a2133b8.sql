-- Create the table
CREATE TABLE IF NOT EXISTS demo_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    fleet_size VARCHAR(50),
    role VARCHAR(100),
    preferred_date DATE,
    preferred_time VARCHAR(50),
    message TEXT,
    marketing_consent BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_demo_requests_email ON demo_requests(email);
CREATE INDEX IF NOT EXISTS idx_demo_requests_submitted_at ON demo_requests(submitted_at);
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests(status);
CREATE INDEX IF NOT EXISTS idx_demo_requests_company ON demo_requests(company);

-- Add RLS (Row Level Security) policies
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all demo requests
CREATE POLICY "Admins can view all demo requests" ON demo_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'council', 'super_admin')
        )
    );

-- Policy for admins to insert demo requests
CREATE POLICY "Admins can insert demo requests" ON demo_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'council', 'super_admin')
        )
    );

-- Policy for admins to update demo requests
CREATE POLICY "Admins can update demo requests" ON demo_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'council', 'super_admin')
        )
    );

-- Policy for admins to delete demo requests
CREATE POLICY "Admins can delete demo requests" ON demo_requests
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'council', 'super_admin')
        )
    );

-- Policy for public to insert demo requests (for the booking form)
CREATE POLICY "Public can insert demo requests" ON demo_requests
    FOR INSERT WITH CHECK (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_demo_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_demo_requests_updated_at
    BEFORE UPDATE ON demo_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_demo_requests_updated_at();

-- Add comments to the table and columns
COMMENT ON TABLE demo_requests IS 'Stores demo booking requests from the website';
COMMENT ON COLUMN demo_requests.id IS 'Unique identifier for the demo request';
COMMENT ON COLUMN demo_requests.first_name IS 'First name of the person requesting the demo';
COMMENT ON COLUMN demo_requests.last_name IS 'Last name of the person requesting the demo';
COMMENT ON COLUMN demo_requests.email IS 'Email address of the person requesting the demo';
COMMENT ON COLUMN demo_requests.phone IS 'Phone number of the person requesting the demo';
COMMENT ON COLUMN demo_requests.company IS 'Company name of the person requesting the demo';
COMMENT ON COLUMN demo_requests.fleet_size IS 'Size of the fleet (e.g., 1-10, 11-50, etc.)';
COMMENT ON COLUMN demo_requests.role IS 'Role of the person requesting the demo (e.g., Fleet Manager, CEO)';
COMMENT ON COLUMN demo_requests.preferred_date IS 'Preferred date for the demo';
COMMENT ON COLUMN demo_requests.preferred_time IS 'Preferred time for the demo (morning, afternoon, evening)';
COMMENT ON COLUMN demo_requests.message IS 'Additional message or requirements from the person';
COMMENT ON COLUMN demo_requests.marketing_consent IS 'Whether the person consented to marketing communications';
COMMENT ON COLUMN demo_requests.submitted_at IS 'When the demo request was submitted';
COMMENT ON COLUMN demo_requests.status IS 'Status of the demo request (pending, contacted, scheduled, completed, cancelled)';
COMMENT ON COLUMN demo_requests.notes IS 'Internal notes about the demo request';
COMMENT ON COLUMN demo_requests.created_at IS 'When the record was created';
COMMENT ON COLUMN demo_requests.updated_at IS 'When the record was last updated';

-- Insert a sample record for testing
INSERT INTO demo_requests (
    first_name, 
    last_name, 
    email, 
    phone, 
    company, 
    fleet_size, 
    role, 
    preferred_date, 
    preferred_time, 
    message, 
    marketing_consent,
    status
) VALUES (
    'John',
    'Doe',
    'john.doe@example.com',
    '+44123456789',
    'Example Transport Ltd',
    '11-50',
    'fleet-manager',
    '2025-01-15',
    'morning',
    'Interested in learning more about fleet management features',
    true,
    'pending'
);