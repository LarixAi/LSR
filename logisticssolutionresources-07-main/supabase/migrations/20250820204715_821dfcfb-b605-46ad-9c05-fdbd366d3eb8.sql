-- Add missing columns to existing support_tickets table
ALTER TABLE support_tickets 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('support', 'suggestion')),
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS user_phone TEXT,
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS app_version TEXT,
ADD COLUMN IF NOT EXISTS device_info TEXT;

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_requester_email ON support_tickets(requester_email);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);

-- Update RLS policies to work with existing structure
-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can insert own tickets" ON support_tickets;

-- Create new policies for the existing table structure
CREATE POLICY "Users can view own tickets" ON support_tickets
    FOR SELECT USING (auth.email() = requester_email);

CREATE POLICY "Users can insert own tickets" ON support_tickets
    FOR INSERT WITH CHECK (auth.email() = requester_email);

-- Insert sample data using the existing structure
-- First check if sample data doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM support_tickets WHERE ticket_number = 'TKT-SAMPLE-001') THEN
        INSERT INTO support_tickets (
            ticket_number, 
            type, 
            priority, 
            title, 
            description, 
            requester_email, 
            requester_name, 
            app_version, 
            device_info,
            status,
            organization_id
        ) VALUES 
        (
            'TKT-SAMPLE-001',
            'support',
            'normal'::support_ticket_priority,
            'App login issue',
            'I am unable to log into the mobile app. The login button is not responding.',
            'test@example.com',
            'Test User',
            'v1.0.0',
            'iPhone 14 - iOS 16.0',
            'open'::support_ticket_status,
            (SELECT id FROM organizations LIMIT 1)
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM support_tickets WHERE ticket_number = 'TKT-SAMPLE-002') THEN
        INSERT INTO support_tickets (
            ticket_number, 
            type, 
            priority, 
            title, 
            description, 
            requester_email, 
            requester_name, 
            app_version, 
            device_info,
            status,
            organization_id
        ) VALUES 
        (
            'TKT-SAMPLE-002',
            'suggestion',
            'low'::support_ticket_priority,
            'Dark mode feature',
            'It would be great to have a dark mode option for the app, especially for night driving.',
            'driver@example.com',
            'John Driver',
            'v1.0.0',
            'Samsung Galaxy S21 - Android 12',
            'open'::support_ticket_status,
            (SELECT id FROM organizations LIMIT 1)
        );
    END IF;
END $$;