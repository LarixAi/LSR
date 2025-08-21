-- Create subscription-related tables

-- Subscription Plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    features JSONB DEFAULT '[]',
    limits JSONB DEFAULT '{}',
    popular BOOLEAN DEFAULT false,
    savings INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending', 'trial')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    next_billing_date TIMESTAMP WITH TIME ZONE,
    amount DECIMAL(10,2) NOT NULL,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    payment_method_id TEXT,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing History table
CREATE TABLE IF NOT EXISTS public.billing_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
    description TEXT NOT NULL,
    invoice_url TEXT,
    payment_method TEXT,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    stripe_invoice_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Data table
CREATE TABLE IF NOT EXISTS public.usage_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    drivers INTEGER DEFAULT 0,
    vehicles INTEGER DEFAULT 0,
    storage DECIMAL(10,2) DEFAULT 0, -- GB
    api_calls INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_organization ON public.subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_billing_history_organization ON public.billing_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_date ON public.billing_history(date);
CREATE INDEX IF NOT EXISTS idx_usage_data_organization ON public.usage_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_data_date ON public.usage_data(date);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (read-only for all authenticated users)
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

-- RLS Policies for subscriptions
CREATE POLICY "Organization admins can view their subscriptions" ON public.subscriptions
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can insert subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can update their subscriptions" ON public.subscriptions
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

-- RLS Policies for billing_history
CREATE POLICY "Organization admins can view their billing history" ON public.billing_history
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can insert billing history" ON public.billing_history
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

-- RLS Policies for usage_data
CREATE POLICY "Organization admins can view their usage data" ON public.usage_data
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can insert usage data" ON public.usage_data
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

-- Create updated_at triggers
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON public.subscription_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT ON public.billing_history TO authenticated;
GRANT SELECT, INSERT ON public.usage_data TO authenticated;

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, price, billing_cycle, features, limits, popular, savings) VALUES
(
    'Starter',
    29.00,
    'monthly',
    '["Up to 5 drivers", "Up to 10 vehicles", "Basic reporting", "Email support", "Mobile app access"]',
    '{"drivers": 5, "vehicles": 10, "storage": 10, "api_calls": 1000}',
    false,
    null
),
(
    'Professional',
    79.00,
    'monthly',
    '["Up to 25 drivers", "Up to 50 vehicles", "Advanced reporting", "Priority support", "API access", "Custom integrations", "Real-time tracking"]',
    '{"drivers": 25, "vehicles": 50, "storage": 100, "api_calls": 10000}',
    true,
    null
),
(
    'Enterprise',
    199.00,
    'monthly',
    '["Unlimited drivers", "Unlimited vehicles", "Custom reporting", "Dedicated support", "Full API access", "White-label options", "Advanced analytics", "Custom integrations"]',
    '{"drivers": -1, "vehicles": -1, "storage": 1000, "api_calls": 100000}',
    false,
    null
);

-- Insert yearly plans
INSERT INTO public.subscription_plans (name, price, billing_cycle, features, limits, popular, savings) VALUES
(
    'Starter',
    290.00,
    'yearly',
    '["Up to 5 drivers", "Up to 10 vehicles", "Basic reporting", "Email support", "Mobile app access"]',
    '{"drivers": 5, "vehicles": 10, "storage": 10, "api_calls": 1000}',
    false,
    17
),
(
    'Professional',
    790.00,
    'yearly',
    '["Up to 25 drivers", "Up to 50 vehicles", "Advanced reporting", "Priority support", "API access", "Custom integrations", "Real-time tracking"]',
    '{"drivers": 25, "vehicles": 50, "storage": 100, "api_calls": 10000}',
    true,
    17
),
(
    'Enterprise',
    1990.00,
    'yearly',
    '["Unlimited drivers", "Unlimited vehicles", "Custom reporting", "Dedicated support", "Full API access", "White-label options", "Advanced analytics", "Custom integrations"]',
    '{"drivers": -1, "vehicles": -1, "storage": 1000, "api_calls": 100000}',
    false,
    17
);
