
-- First, let's create the subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'premium', 'enterprise')),
  max_drivers INTEGER NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  annual_price DECIMAL(10,2) NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create company subscriptions table
CREATE TABLE public.company_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing', 'unpaid')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  grace_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id)
);

-- Create subscription usage tracking
CREATE TABLE public.subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL,
  current_count INTEGER DEFAULT 0,
  max_allowed INTEGER NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription plans (public read, admin write)
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for company subscriptions
CREATE POLICY "Users can view their organization subscription" ON public.company_subscriptions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all subscriptions" ON public.company_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for subscription usage
CREATE POLICY "Organization members can view usage" ON public.subscription_usage
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can manage usage" ON public.subscription_usage
  FOR ALL USING (true);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, tier, max_drivers, monthly_price, annual_price, description, features) VALUES
('Basic Plan', 'basic', 5, 49.99, 499.99, 'Perfect for small transport companies', 
 '["Up to 5 drivers", "Basic route management", "Vehicle tracking", "Email support"]'::jsonb),
('Premium Plan', 'premium', 25, 149.99, 1499.99, 'Ideal for growing transport businesses', 
 '["Up to 25 drivers", "Advanced route optimization", "Real-time tracking", "Priority support", "Custom reporting"]'::jsonb),
('Enterprise Plan', 'enterprise', 100, 399.99, 3999.99, 'For large-scale transport operations', 
 '["Up to 100 drivers", "Unlimited routes", "Advanced analytics", "24/7 phone support", "Custom integrations", "Dedicated account manager"]'::jsonb);

-- Create function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limit(org_id UUID, limit_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
  subscription_status TEXT;
BEGIN
  -- Check if organization has active subscription
  SELECT status INTO subscription_status
  FROM public.company_subscriptions cs
  WHERE cs.organization_id = org_id;
  
  -- If no subscription or expired, use basic limits
  IF subscription_status IS NULL OR subscription_status NOT IN ('active', 'trialing') THEN
    max_allowed := 5; -- Basic plan driver limit
  ELSE
    -- Get max allowed from subscription plan
    SELECT sp.max_drivers INTO max_allowed
    FROM public.company_subscriptions cs
    JOIN public.subscription_plans sp ON cs.plan_id = sp.id
    WHERE cs.organization_id = org_id;
  END IF;
  
  -- Count current usage based on limit type
  IF limit_type = 'drivers' THEN
    SELECT COUNT(*) INTO current_count
    FROM public.profiles p
    WHERE p.organization_id = org_id 
    AND p.role = 'driver' 
    AND p.is_active = true;
  END IF;
  
  -- Update usage tracking
  INSERT INTO public.subscription_usage (organization_id, usage_type, current_count, max_allowed)
  VALUES (org_id, limit_type, current_count, max_allowed)
  ON CONFLICT (organization_id, usage_type) 
  DO UPDATE SET current_count = EXCLUDED.current_count, max_allowed = EXCLUDED.max_allowed, recorded_at = now();
  
  RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to enforce driver limits
CREATE OR REPLACE FUNCTION enforce_driver_limit()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Get organization ID
  SELECT organization_id INTO org_id FROM public.profiles WHERE id = NEW.id;
  
  -- Check if adding this driver would exceed the limit
  IF NEW.role = 'driver' AND NEW.is_active = true THEN
    IF NOT check_subscription_limit(org_id, 'drivers') THEN
      RAISE EXCEPTION 'Driver limit exceeded for your subscription plan. Please upgrade to add more drivers.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce driver limits
DROP TRIGGER IF EXISTS enforce_driver_limit_trigger ON public.profiles;
CREATE TRIGGER enforce_driver_limit_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION enforce_driver_limit();

-- Create indexes for performance
CREATE INDEX idx_company_subscriptions_org_id ON public.company_subscriptions(organization_id);
CREATE INDEX idx_company_subscriptions_status ON public.company_subscriptions(status);
CREATE INDEX idx_subscription_usage_org_id ON public.subscription_usage(organization_id);
