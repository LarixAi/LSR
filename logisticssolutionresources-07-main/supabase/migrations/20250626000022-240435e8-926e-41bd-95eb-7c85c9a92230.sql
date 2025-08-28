
-- Create subscription tiers and company subscriptions tables

-- Create enum for subscription tiers
CREATE TYPE subscription_tier AS ENUM ('basic', 'premium', 'enterprise');

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier subscription_tier NOT NULL,
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
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id)
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;

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
    EXISTS (
      SELECT 1 FROM public.user_organizations 
      WHERE user_id = auth.uid() AND organization_id = company_subscriptions.organization_id AND is_active = true
    )
  );

CREATE POLICY "Admins can manage all subscriptions" ON public.company_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, tier, max_drivers, monthly_price, annual_price, description, features) VALUES
('Basic Plan', 'basic', 5, 49.99, 499.99, 'Perfect for small transport companies', 
 '["Up to 5 drivers", "Basic route management", "Vehicle tracking", "Email support"]'::jsonb),
('Premium Plan', 'premium', 25, 149.99, 1499.99, 'Ideal for growing transport businesses', 
 '["Up to 25 drivers", "Advanced route optimization", "Real-time tracking", "Priority support", "Custom reporting"]'::jsonb),
('Enterprise Plan', 'enterprise', 100, 399.99, 3999.99, 'For large-scale transport operations', 
 '["Up to 100 drivers", "Unlimited routes", "Advanced analytics", "24/7 phone support", "Custom integrations", "Dedicated account manager"]'::jsonb);

-- Create function to check driver limit
CREATE OR REPLACE FUNCTION check_driver_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_driver_count INTEGER;
  max_drivers_allowed INTEGER;
BEGIN
  -- Get current driver count for the organization
  SELECT COUNT(*) INTO current_driver_count
  FROM public.profiles p
  JOIN public.user_organizations uo ON p.id = uo.user_id
  WHERE uo.organization_id = (
    SELECT organization_id FROM public.user_organizations 
    WHERE user_id = NEW.id AND is_active = true
    LIMIT 1
  ) AND p.role = 'driver' AND p.is_active = true;

  -- Get max drivers allowed for the organization's subscription
  SELECT sp.max_drivers INTO max_drivers_allowed
  FROM public.subscription_plans sp
  JOIN public.company_subscriptions cs ON sp.id = cs.plan_id
  JOIN public.user_organizations uo ON cs.organization_id = uo.organization_id
  WHERE uo.user_id = NEW.id AND uo.is_active = true
  LIMIT 1;

  -- If no subscription found, default to basic plan limit
  IF max_drivers_allowed IS NULL THEN
    max_drivers_allowed := 5;
  END IF;

  -- Check if adding this driver would exceed the limit
  IF NEW.role = 'driver' AND current_driver_count >= max_drivers_allowed THEN
    RAISE EXCEPTION 'Driver limit exceeded. Your current plan allows up to % drivers.', max_drivers_allowed;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce driver limits
CREATE TRIGGER enforce_driver_limit
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role = 'driver' AND NEW.is_active = true)
  EXECUTE FUNCTION check_driver_limit();

-- Create indexes for performance
CREATE INDEX idx_company_subscriptions_org_id ON public.company_subscriptions(organization_id);
CREATE INDEX idx_subscription_plans_tier ON public.subscription_plans(tier);
CREATE INDEX idx_company_subscriptions_status ON public.company_subscriptions(status);
