-- Create fuel transactions table
CREATE TABLE public.fuel_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    location_name TEXT,
    location_lat NUMERIC,
    location_lng NUMERIC,
    fuel_type TEXT NOT NULL DEFAULT 'diesel',
    litres_filled NUMERIC(10,2) NOT NULL,
    cost_per_litre NUMERIC(10,4) NOT NULL,
    total_cost NUMERIC(10,2) NOT NULL,
    odometer_reading INTEGER,
    fuel_card_number TEXT,
    receipt_url TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    anomaly_flags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fuel efficiency tracking table
CREATE TABLE public.fuel_efficiency_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_litres NUMERIC(10,2) NOT NULL,
    total_cost NUMERIC(10,2) NOT NULL,
    total_distance_km NUMERIC(10,2) NOT NULL,
    efficiency_l_per_100km NUMERIC(8,2) NOT NULL,
    cost_per_km NUMERIC(8,4) NOT NULL,
    co2_emissions_kg NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fuel alerts table
CREATE TABLE public.fuel_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL,
    vehicle_id UUID,
    driver_id UUID,
    fuel_transaction_id UUID,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID
);

-- Enable RLS
ALTER TABLE public.fuel_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_efficiency_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for fuel_transactions
CREATE POLICY "Drivers can create their own fuel transactions" 
ON public.fuel_transactions 
FOR INSERT 
WITH CHECK (
    driver_id = auth.uid() 
    AND organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Drivers can view their own fuel transactions" 
ON public.fuel_transactions 
FOR SELECT 
USING (
    driver_id = auth.uid() 
    OR organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'council', 'mechanic')
    )
);

CREATE POLICY "Admins can manage all fuel transactions" 
ON public.fuel_transactions 
FOR ALL 
USING (
    organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'council')
    )
);

-- Create policies for fuel_efficiency_records
CREATE POLICY "Organization members can view fuel efficiency" 
ON public.fuel_efficiency_records 
FOR SELECT 
USING (
    organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Admins can manage fuel efficiency records" 
ON public.fuel_efficiency_records 
FOR ALL 
USING (
    organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'council')
    )
);

-- Create policies for fuel_alerts
CREATE POLICY "Organization members can view fuel alerts" 
ON public.fuel_alerts 
FOR SELECT 
USING (
    organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Admins can manage fuel alerts" 
ON public.fuel_alerts 
FOR ALL 
USING (
    organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'council')
    )
);

-- Create function to calculate fuel efficiency
CREATE OR REPLACE FUNCTION public.calculate_fuel_efficiency(
    p_vehicle_id UUID,
    p_period_start DATE,
    p_period_end DATE
) RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    total_fuel NUMERIC := 0;
    total_distance NUMERIC := 0;
    efficiency NUMERIC := 0;
BEGIN
    -- Get total fuel consumed in period
    SELECT COALESCE(SUM(litres_filled), 0) INTO total_fuel
    FROM public.fuel_transactions
    WHERE vehicle_id = p_vehicle_id
    AND DATE(transaction_date) BETWEEN p_period_start AND p_period_end
    AND status = 'verified';
    
    -- Calculate distance from odometer readings
    WITH odometer_readings AS (
        SELECT odometer_reading, transaction_date
        FROM public.fuel_transactions
        WHERE vehicle_id = p_vehicle_id
        AND DATE(transaction_date) BETWEEN p_period_start AND p_period_end
        AND odometer_reading IS NOT NULL
        ORDER BY transaction_date
    )
    SELECT COALESCE(MAX(odometer_reading) - MIN(odometer_reading), 0) INTO total_distance
    FROM odometer_readings;
    
    -- Calculate efficiency (litres per 100km)
    IF total_distance > 0 THEN
        efficiency := (total_fuel / total_distance) * 100;
    END IF;
    
    RETURN efficiency;
END;
$$;

-- Create function to detect fuel anomalies
CREATE OR REPLACE FUNCTION public.detect_fuel_anomalies()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    anomalies JSONB := '[]'::jsonb;
    avg_cost NUMERIC;
    vehicle_tank_capacity NUMERIC := 300; -- Default tank capacity in litres
BEGIN
    -- Check for unusually high fuel volume (> 90% of tank capacity)
    IF NEW.litres_filled > (vehicle_tank_capacity * 0.9) THEN
        anomalies := anomalies || jsonb_build_object(
            'type', 'high_volume',
            'message', 'Fuel volume exceeds 90% of tank capacity'
        );
    END IF;
    
    -- Check for unusually high cost per litre (> 50% above recent average)
    SELECT AVG(cost_per_litre) INTO avg_cost
    FROM public.fuel_transactions
    WHERE vehicle_id = NEW.vehicle_id
    AND transaction_date >= (NEW.transaction_date - INTERVAL '30 days')
    AND id != NEW.id;
    
    IF avg_cost IS NOT NULL AND NEW.cost_per_litre > (avg_cost * 1.5) THEN
        anomalies := anomalies || jsonb_build_object(
            'type', 'high_cost',
            'message', 'Cost per litre is significantly above recent average'
        );
    END IF;
    
    -- Update anomaly flags
    NEW.anomaly_flags := anomalies;
    
    -- Create alert if anomalies detected
    IF jsonb_array_length(anomalies) > 0 THEN
        INSERT INTO public.fuel_alerts (
            organization_id, vehicle_id, driver_id, fuel_transaction_id,
            alert_type, severity, title, description
        ) VALUES (
            NEW.organization_id, NEW.vehicle_id, NEW.driver_id, NEW.id,
            'anomaly', 'medium',
            'Fuel Transaction Anomaly Detected',
            'Unusual patterns detected in fuel transaction: ' || anomalies::text
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for anomaly detection
CREATE TRIGGER fuel_anomaly_detection
    BEFORE INSERT OR UPDATE ON public.fuel_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.detect_fuel_anomalies();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_fuel_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_fuel_transactions_updated_at
    BEFORE UPDATE ON public.fuel_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_fuel_updated_at();

CREATE TRIGGER update_fuel_efficiency_updated_at
    BEFORE UPDATE ON public.fuel_efficiency_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_fuel_updated_at();