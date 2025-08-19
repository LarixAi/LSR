-- Enhanced parent-side database schema (corrected version)

-- Update child_profiles with better tracking capabilities
ALTER TABLE public.child_profiles 
ADD COLUMN IF NOT EXISTS pickup_location TEXT,
ADD COLUMN IF NOT EXISTS dropoff_location TEXT,
ADD COLUMN IF NOT EXISTS emergency_contacts JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
ADD COLUMN IF NOT EXISTS special_requirements TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS route_id UUID,
ADD COLUMN IF NOT EXISTS school_id UUID,
ADD COLUMN IF NOT EXISTS grade_level TEXT,
ADD COLUMN IF NOT EXISTS parent_phone TEXT,
ADD COLUMN IF NOT EXISTS pickup_time TIME,
ADD COLUMN IF NOT EXISTS dropoff_time TIME;

-- Create parent notifications table (using bigint for child_id to match child_profiles)
CREATE TABLE IF NOT EXISTS public.parent_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES profiles(id),
    child_id BIGINT REFERENCES child_profiles(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- info, alert, pickup, dropoff, delay
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create child location tracking table (using bigint for child_id)
CREATE TABLE IF NOT EXISTS public.child_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id BIGINT NOT NULL REFERENCES child_profiles(id),
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES profiles(id),
    event_type TEXT NOT NULL, -- pickup, dropoff, boarding, alighting, absent
    location_lat DECIMAL,
    location_lng DECIMAL,
    location_address TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    verified_by UUID REFERENCES profiles(id),
    notes TEXT,
    photo_evidence TEXT
);

-- Create parent preferences table
CREATE TABLE IF NOT EXISTS public.parent_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES profiles(id),
    notification_settings JSONB DEFAULT '{
        "pickup_alerts": true,
        "dropoff_alerts": true,
        "delay_alerts": true,
        "emergency_alerts": true,
        "weekly_summary": true,
        "sms_enabled": true,
        "email_enabled": true,
        "push_enabled": true
    }'::jsonb,
    tracking_preferences JSONB DEFAULT '{
        "realtime_tracking": true,
        "location_sharing": true,
        "photo_updates": true
    }'::jsonb,
    emergency_contacts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.parent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parent_notifications
CREATE POLICY "Parents can view their own notifications" ON public.parent_notifications
    FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can update their own notifications" ON public.parent_notifications
    FOR UPDATE USING (parent_id = auth.uid());

CREATE POLICY "System can create parent notifications" ON public.parent_notifications
    FOR INSERT WITH CHECK (true);

-- RLS Policies for child_tracking
CREATE POLICY "Parents can view their children's tracking" ON public.child_tracking
    FOR SELECT USING (
        child_id IN (
            SELECT id FROM child_profiles WHERE parent_id = auth.uid()
        )
    );

CREATE POLICY "Drivers can create tracking entries" ON public.child_tracking
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'driver'
        )
    );

CREATE POLICY "Drivers can update tracking entries" ON public.child_tracking
    FOR UPDATE USING (
        driver_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'driver')
        )
    );

-- RLS Policies for parent_preferences
CREATE POLICY "Parents can manage their own preferences" ON public.parent_preferences
    FOR ALL USING (parent_id = auth.uid());

-- Create functions for parent notifications
CREATE OR REPLACE FUNCTION public.create_parent_notification(
    p_parent_id UUID,
    p_child_id BIGINT,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info',
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.parent_notifications (
        parent_id, child_id, title, message, type, metadata
    ) VALUES (
        p_parent_id, p_child_id, p_title, p_message, p_type, p_metadata
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Create function to log child events
CREATE OR REPLACE FUNCTION public.log_child_event(
    p_child_id BIGINT,
    p_event_type TEXT,
    p_vehicle_id UUID DEFAULT NULL,
    p_driver_id UUID DEFAULT NULL,
    p_location_lat DECIMAL DEFAULT NULL,
    p_location_lng DECIMAL DEFAULT NULL,
    p_location_address TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    tracking_id UUID;
    parent_id UUID;
    child_name TEXT;
    notification_title TEXT;
    notification_message TEXT;
BEGIN
    -- Insert tracking record
    INSERT INTO public.child_tracking (
        child_id, event_type, vehicle_id, driver_id, 
        location_lat, location_lng, location_address, 
        verified_by, notes
    ) VALUES (
        p_child_id, p_event_type, p_vehicle_id, p_driver_id,
        p_location_lat, p_location_lng, p_location_address,
        auth.uid(), p_notes
    ) RETURNING id INTO tracking_id;
    
    -- Get parent info for notification
    SELECT cp.parent_id, cp.first_name || ' ' || cp.last_name
    INTO parent_id, child_name
    FROM child_profiles cp
    WHERE cp.id = p_child_id;
    
    -- Create notification
    IF parent_id IS NOT NULL THEN
        CASE p_event_type
            WHEN 'pickup' THEN
                notification_title := 'Child Picked Up';
                notification_message := child_name || ' has been picked up successfully.';
            WHEN 'dropoff' THEN
                notification_title := 'Child Dropped Off';
                notification_message := child_name || ' has been dropped off safely.';
            WHEN 'boarding' THEN
                notification_title := 'Child Boarding';
                notification_message := child_name || ' is boarding the vehicle.';
            WHEN 'absent' THEN
                notification_title := 'Child Absent';
                notification_message := child_name || ' was not present for pickup.';
            ELSE
                notification_title := 'Child Update';
                notification_message := 'Update for ' || child_name || ': ' || p_event_type;
        END CASE;
        
        PERFORM public.create_parent_notification(
            parent_id,
            p_child_id,
            notification_title,
            notification_message,
            p_event_type,
            jsonb_build_object(
                'location_address', p_location_address,
                'timestamp', now(),
                'tracking_id', tracking_id
            )
        );
    END IF;
    
    RETURN tracking_id;
END;
$$;