-- Create support_tickets table for storing support tickets and feature suggestions
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('support', 'suggestion')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT,
    app_version TEXT,
    device_info TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_id ON support_tickets(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_email ON support_tickets(user_email);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_type ON support_tickets(type);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_support_tickets_updated_at 
    BEFORE UPDATE ON support_tickets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets
    FOR SELECT USING (auth.email() = user_email);

-- Users can insert their own tickets
CREATE POLICY "Users can insert own tickets" ON support_tickets
    FOR INSERT WITH CHECK (auth.email() = user_email);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets" ON support_tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'council')
        )
    );

-- Admins can update all tickets
CREATE POLICY "Admins can update all tickets" ON support_tickets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'council')
        )
    );

-- Admins can delete tickets
CREATE POLICY "Admins can delete tickets" ON support_tickets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'council')
        )
    );

-- Insert some sample data for testing
INSERT INTO support_tickets (
    ticket_id, 
    type, 
    priority, 
    subject, 
    description, 
    user_email, 
    user_name, 
    app_version, 
    device_info,
    status
) VALUES 
(
    'TKT-SAMPLE-001',
    'support',
    'medium',
    'App login issue',
    'I am unable to log into the mobile app. The login button is not responding.',
    'test@example.com',
    'Test User',
    'v1.0.0',
    'iPhone 14 - iOS 16.0',
    'open'
),
(
    'TKT-SAMPLE-002',
    'suggestion',
    'low',
    'Dark mode feature',
    'It would be great to have a dark mode option for the app, especially for night driving.',
    'driver@example.com',
    'John Driver',
    'v1.0.0',
    'Samsung Galaxy S21 - Android 12',
    'open'
)
ON CONFLICT (ticket_id) DO NOTHING;

