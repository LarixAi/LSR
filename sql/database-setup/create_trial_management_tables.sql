-- Create trial management tables and functions
-- This script sets up the trial management system for driver-focused pricing

-- Create organization_trials table
CREATE TABLE IF NOT EXISTS organization_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  trial_status TEXT DEFAULT 'active' CHECK (trial_status IN ('active', 'expired', 'converted')),
  max_drivers INTEGER DEFAULT 10,
  features TEXT DEFAULT 'professional',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_trials_org_id ON organization_trials(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_trials_status ON organization_trials(trial_status);
CREATE INDEX IF NOT EXISTS idx_organization_trials_end_date ON organization_trials(trial_end_date);

-- Create subscriptions table for paid plans
CREATE TABLE IF NOT EXISTS organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('starter', 'professional', 'enterprise', 'unlimited')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  auto_renew BOOLEAN DEFAULT true,
  payment_method_id TEXT,
  trial_organization_id UUID REFERENCES organization_trials(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_org_id ON organization_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_status ON organization_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_plan_id ON organization_subscriptions(plan_id);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS organization_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  drivers_count INTEGER DEFAULT 0,
  vehicles_count INTEGER DEFAULT 0,
  storage_used_gb DECIMAL(10,2) DEFAULT 0,
  api_calls_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, date)
);

-- Create indexes for usage tracking
CREATE INDEX IF NOT EXISTS idx_org_usage_org_id ON organization_usage(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_usage_date ON organization_usage(date);

-- Enable Row Level Security
ALTER TABLE organization_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_trials
DROP POLICY IF EXISTS "Users can view their organization's trial" ON organization_trials;
CREATE POLICY "Users can view their organization's trial" ON organization_trials
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage their organization's trial" ON organization_trials;
CREATE POLICY "Admins can manage their organization's trial" ON organization_trials
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for organization_subscriptions
DROP POLICY IF EXISTS "Users can view their organization's subscription" ON organization_subscriptions;
CREATE POLICY "Users can view their organization's subscription" ON organization_subscriptions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage their organization's subscription" ON organization_subscriptions;
CREATE POLICY "Admins can manage their organization's subscription" ON organization_subscriptions
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for organization_usage
DROP POLICY IF EXISTS "Users can view their organization's usage" ON organization_usage;
CREATE POLICY "Users can view their organization's usage" ON organization_usage
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can update organization usage" ON organization_usage;
CREATE POLICY "System can update organization usage" ON organization_usage
  FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_organization_trials_updated_at ON organization_trials;
CREATE TRIGGER update_organization_trials_updated_at
    BEFORE UPDATE ON organization_trials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organization_subscriptions_updated_at ON organization_subscriptions;
CREATE TRIGGER update_organization_subscriptions_updated_at
    BEFORE UPDATE ON organization_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to check driver limits
CREATE OR REPLACE FUNCTION check_driver_limit()
RETURNS TRIGGER AS $$
DECLARE
    current_drivers INTEGER;
    max_drivers INTEGER;
    trial_status TEXT;
    subscription_status TEXT;
BEGIN
    -- Get current driver count for the organization
    SELECT COUNT(*) INTO current_drivers
    FROM profiles
    WHERE organization_id = NEW.organization_id AND role = 'driver';
    
    -- Check trial status
    SELECT trial_status, max_drivers INTO trial_status, max_drivers
    FROM organization_trials
    WHERE organization_id = NEW.organization_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Check subscription status
    SELECT status INTO subscription_status
    FROM organization_subscriptions
    WHERE organization_id = NEW.organization_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If no trial or subscription found, allow (for initial setup)
    IF trial_status IS NULL AND subscription_status IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- If trial is active, check trial limits
    IF trial_status = 'active' THEN
        IF current_drivers >= max_drivers THEN
            RAISE EXCEPTION 'Driver limit reached for trial. Maximum % drivers allowed.', max_drivers;
        END IF;
    END IF;
    
    -- If subscription is active, check subscription limits
    IF subscription_status = 'active' THEN
        -- Get plan limits based on subscription plan_id
        -- This would need to be implemented based on your plan structure
        -- For now, we'll allow it
        RETURN NEW;
    END IF;
    
    -- If trial expired and no active subscription, block
    IF trial_status = 'expired' AND (subscription_status IS NULL OR subscription_status != 'active') THEN
        RAISE EXCEPTION 'Trial has expired. Please upgrade to continue adding drivers.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check driver limits when adding new drivers
DROP TRIGGER IF EXISTS check_driver_limit_trigger ON profiles;
CREATE TRIGGER check_driver_limit_trigger
    BEFORE INSERT ON profiles
    FOR EACH ROW
    WHEN (NEW.role = 'driver')
    EXECUTE FUNCTION check_driver_limit();

-- Create function to automatically expire trials
CREATE OR REPLACE FUNCTION expire_trials()
RETURNS void AS $$
BEGIN
    UPDATE organization_trials
    SET trial_status = 'expired'
    WHERE trial_status = 'active'
    AND trial_end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to update daily usage
CREATE OR REPLACE FUNCTION update_daily_usage()
RETURNS void AS $$
DECLARE
    org_record RECORD;
    driver_count INTEGER;
    vehicle_count INTEGER;
BEGIN
    FOR org_record IN SELECT id FROM organizations LOOP
        -- Count drivers
        SELECT COUNT(*) INTO driver_count
        FROM profiles
        WHERE organization_id = org_record.id AND role = 'driver';
        
        -- Count vehicles
        SELECT COUNT(*) INTO vehicle_count
        FROM vehicles
        WHERE organization_id = org_record.id;
        
        -- Insert or update usage record
        INSERT INTO organization_usage (organization_id, drivers_count, vehicles_count)
        VALUES (org_record.id, driver_count, vehicle_count)
        ON CONFLICT (organization_id, date)
        DO UPDATE SET
            drivers_count = EXCLUDED.drivers_count,
            vehicles_count = EXCLUDED.vehicles_count,
            updated_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing (optional)
-- INSERT INTO organization_trials (organization_id, trial_start_date, trial_end_date, trial_status, max_drivers, features)
-- VALUES 
--   ('your-org-id-1', NOW(), NOW() + INTERVAL '14 days', 'active', 10, 'professional'),
--   ('your-org-id-2', NOW() - INTERVAL '15 days', NOW() - INTERVAL '1 day', 'expired', 10, 'professional');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_trials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_usage TO authenticated;

-- Create views for easier querying
-- Explicitly use SECURITY INVOKER to respect user permissions and RLS policies
CREATE OR REPLACE VIEW trial_summary 
WITH (security_invoker = true) AS
SELECT 
    ot.organization_id,
    o.name as organization_name,
    ot.trial_status,
    ot.trial_start_date,
    ot.trial_end_date,
    ot.max_drivers,
    ot.features,
    CASE 
        WHEN ot.trial_status = 'active' THEN 
            GREATEST(0, EXTRACT(DAY FROM (ot.trial_end_date - NOW())))
        ELSE 0
    END as days_left,
    COUNT(p.id) as current_drivers
FROM organization_trials ot
JOIN organizations o ON ot.organization_id = o.id
LEFT JOIN profiles p ON ot.organization_id = p.organization_id AND p.role = 'driver'
GROUP BY ot.id, o.name;

-- Grant access to views
GRANT SELECT ON trial_summary TO authenticated;
