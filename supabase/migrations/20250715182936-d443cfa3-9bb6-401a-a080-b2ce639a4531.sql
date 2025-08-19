-- Create tachograph_records table for storing file uploads and analysis
CREATE TABLE public.tachograph_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL,
  driver_id UUID,
  file_type TEXT NOT NULL CHECK (file_type IN ('ddd', 'tgd', 'c1b')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  download_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  uploaded_by UUID NOT NULL,
  organization_id UUID NOT NULL,
  file_size INTEGER,
  analysis_results JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tachograph_records ENABLE ROW LEVEL SECURITY;

-- Create policies for tachograph records
CREATE POLICY "Users can view their organization's tachograph records" 
ON public.tachograph_records 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins and drivers can upload tachograph records" 
ON public.tachograph_records 
FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'driver', 'compliance_officer')
  )
);

CREATE POLICY "Admins can update tachograph records" 
ON public.tachograph_records 
FOR UPDATE 
USING (
  organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'compliance_officer')
  )
);

-- Create loyalty_rewards table for available rewards
CREATE TABLE public.loyalty_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  discount_percentage NUMERIC,
  discount_amount NUMERIC,
  reward_type TEXT NOT NULL DEFAULT 'discount' CHECK (reward_type IN ('discount', 'free_ride', 'upgrade', 'special_offer')),
  terms_conditions TEXT,
  valid_from DATE,
  valid_until DATE,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  tier_requirement TEXT CHECK (tier_requirement IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for loyalty rewards
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for loyalty rewards (public read, admin write)
CREATE POLICY "Anyone can view active rewards" 
ON public.loyalty_rewards 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage rewards" 
ON public.loyalty_rewards 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Add foreign key constraints
ALTER TABLE public.tachograph_records 
ADD CONSTRAINT tachograph_records_vehicle_id_fkey 
FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);

ALTER TABLE public.tachograph_records 
ADD CONSTRAINT tachograph_records_driver_id_fkey 
FOREIGN KEY (driver_id) REFERENCES public.profiles(id);

ALTER TABLE public.tachograph_records 
ADD CONSTRAINT tachograph_records_uploaded_by_fkey 
FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id);

ALTER TABLE public.loyalty_transactions 
ADD CONSTRAINT loyalty_transactions_reward_id_fkey 
FOREIGN KEY (reward_id) REFERENCES public.loyalty_rewards(id);

-- Create storage bucket for tachograph files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tachograph-files', 'tachograph-files', false);

-- Create storage policies for tachograph files
CREATE POLICY "Users can upload tachograph files to their organization folder" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'tachograph-files' 
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can view their organization's tachograph files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'tachograph-files' 
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM profiles WHERE id = auth.uid()
  )
);

-- Add indexes for performance
CREATE INDEX idx_tachograph_records_vehicle_id ON public.tachograph_records(vehicle_id);
CREATE INDEX idx_tachograph_records_organization_id ON public.tachograph_records(organization_id);
CREATE INDEX idx_tachograph_records_period ON public.tachograph_records(period_start, period_end);
CREATE INDEX idx_loyalty_rewards_active ON public.loyalty_rewards(is_active, points_required);

-- Insert sample rewards
INSERT INTO public.loyalty_rewards (name, description, points_required, discount_percentage, reward_type, tier_requirement) VALUES
('5% Ride Discount', 'Get 5% off your next ride', 100, 5, 'discount', 'bronze'),
('10% Ride Discount', 'Get 10% off your next ride', 250, 10, 'discount', 'silver'),
('Free Short Ride', 'Get a free ride up to £10', 500, NULL, 'free_ride', 'silver'),
('15% Ride Discount', 'Get 15% off your next ride', 750, 15, 'discount', 'gold'),
('Free Standard Ride', 'Get a free ride up to £25', 1000, NULL, 'free_ride', 'gold'),
('20% Ride Discount', 'Get 20% off your next ride', 1500, 20, 'discount', 'platinum'),
('Free Premium Ride', 'Get a free ride up to £50', 2000, NULL, 'free_ride', 'platinum');

-- Create update trigger for timestamps
CREATE OR REPLACE FUNCTION public.update_tachograph_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tachograph_records_updated_at
    BEFORE UPDATE ON public.tachograph_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tachograph_records_updated_at();