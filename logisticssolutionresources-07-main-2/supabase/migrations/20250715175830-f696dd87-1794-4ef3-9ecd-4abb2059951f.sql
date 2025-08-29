-- Create customer loyalty system with points and QR codes
CREATE TABLE public.customer_loyalty_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loyalty_code TEXT NOT NULL UNIQUE,
  qr_code_data TEXT NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loyalty transactions table
CREATE TABLE public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loyalty_card_id UUID NOT NULL REFERENCES public.customer_loyalty_cards(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.customer_bookings(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL, -- 'earned', 'redeemed', 'bonus'
  points INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loyalty rewards table
CREATE TABLE public.loyalty_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  discount_percentage NUMERIC,
  discount_amount NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  tier_requirement TEXT DEFAULT 'bronze',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customer_loyalty_cards
CREATE POLICY "Users can view their own loyalty card"
ON public.customer_loyalty_cards
FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Users can update their own loyalty card"
ON public.customer_loyalty_cards
FOR UPDATE
USING (auth.uid() = customer_id);

-- Create RLS policies for loyalty_transactions
CREATE POLICY "Users can view their own loyalty transactions"
ON public.loyalty_transactions
FOR SELECT
USING (loyalty_card_id IN (
  SELECT id FROM public.customer_loyalty_cards WHERE customer_id = auth.uid()
));

-- Create RLS policies for loyalty_rewards (public read)
CREATE POLICY "Anyone can view active loyalty rewards"
ON public.loyalty_rewards
FOR SELECT
USING (is_active = true);

-- Create function to generate unique loyalty code
CREATE OR REPLACE FUNCTION public.generate_loyalty_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  code_prefix TEXT := 'QLR';
  random_part TEXT;
  full_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-digit random number
    random_part := LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    full_code := code_prefix || random_part;
    
    -- Check if code exists
    SELECT EXISTS(
      SELECT 1 FROM public.customer_loyalty_cards WHERE loyalty_code = full_code
    ) INTO code_exists;
    
    -- Exit loop if code is unique
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN full_code;
END;
$$;

-- Create function to calculate points for booking
CREATE OR REPLACE FUNCTION public.calculate_loyalty_points(booking_amount NUMERIC)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 1 point per £1 spent, minimum 1 point
  RETURN GREATEST(1, FLOOR(booking_amount)::INTEGER);
END;
$$;

-- Create trigger function to create loyalty card for new customers
CREATE OR REPLACE FUNCTION public.create_loyalty_card_for_customer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  loyalty_code TEXT;
  qr_data TEXT;
BEGIN
  -- Generate unique loyalty code
  loyalty_code := public.generate_loyalty_code();
  
  -- Create QR code data (JSON format)
  qr_data := jsonb_build_object(
    'type', 'loyalty_card',
    'customer_id', NEW.id,
    'loyalty_code', loyalty_code,
    'issued_at', now()
  )::TEXT;
  
  -- Insert loyalty card
  INSERT INTO public.customer_loyalty_cards (
    customer_id,
    loyalty_code,
    qr_code_data
  ) VALUES (
    NEW.id,
    loyalty_code,
    qr_data
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create loyalty card for new users
CREATE TRIGGER create_loyalty_card_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_loyalty_card_for_customer();

-- Create function to add points for completed bookings
CREATE OR REPLACE FUNCTION public.add_loyalty_points_for_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  points_earned INTEGER;
  loyalty_card_id UUID;
BEGIN
  -- Only add points when booking is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Calculate points based on final price
    points_earned := public.calculate_loyalty_points(COALESCE(NEW.final_price, NEW.estimated_price));
    
    -- Get loyalty card ID
    SELECT id INTO loyalty_card_id 
    FROM public.customer_loyalty_cards 
    WHERE customer_id = NEW.customer_id;
    
    IF loyalty_card_id IS NOT NULL THEN
      -- Add points to loyalty card
      UPDATE public.customer_loyalty_cards
      SET total_points = total_points + points_earned,
          updated_at = now()
      WHERE id = loyalty_card_id;
      
      -- Record transaction
      INSERT INTO public.loyalty_transactions (
        loyalty_card_id,
        booking_id,
        transaction_type,
        points,
        description
      ) VALUES (
        loyalty_card_id,
        NEW.id,
        'earned',
        points_earned,
        'Points earned from completed booking'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to add points for completed bookings
CREATE TRIGGER add_points_for_booking_trigger
  AFTER UPDATE ON public.customer_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.add_loyalty_points_for_booking();

-- Insert sample loyalty rewards
INSERT INTO public.loyalty_rewards (name, description, points_required, discount_percentage, tier_requirement) VALUES
('5% Discount', 'Get 5% off your next booking', 100, 5, 'bronze'),
('10% Discount', 'Get 10% off your next booking', 250, 10, 'silver'),
('15% Discount', 'Get 15% off your next booking', 500, 15, 'gold'),
('Free Short Trip', 'Free trip up to £20 value', 1000, NULL, 'gold'),
('Priority Support', 'Skip the queue with priority support', 150, NULL, 'silver'),
('Vehicle Upgrade', 'Free upgrade to premium vehicle', 300, NULL, 'silver');

-- Create function to update loyalty tier based on points
CREATE OR REPLACE FUNCTION public.update_loyalty_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_tier TEXT;
BEGIN
  -- Determine tier based on total points
  IF NEW.total_points >= 2000 THEN
    new_tier := 'platinum';
  ELSIF NEW.total_points >= 1000 THEN
    new_tier := 'gold';
  ELSIF NEW.total_points >= 500 THEN
    new_tier := 'silver';
  ELSE
    new_tier := 'bronze';
  END IF;
  
  -- Update tier if it has changed
  IF NEW.tier != new_tier THEN
    NEW.tier := new_tier;
    NEW.updated_at := now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update tier
CREATE TRIGGER update_loyalty_tier_trigger
  BEFORE UPDATE ON public.customer_loyalty_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loyalty_tier();