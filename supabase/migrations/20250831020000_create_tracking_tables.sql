-- Create tracking tables for mobile GPS tracking

-- Driver locations table for real-time GPS coordinates
CREATE TABLE IF NOT EXISTS driver_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy_meters DECIMAL(5, 2),
  altitude_meters DECIMAL(8, 2),
  heading_degrees DECIMAL(5, 2),
  speed_kmh DECIMAL(6, 2),
  recorded_at TIMESTAMPTZ NOT NULL,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver tracking status table
CREATE TABLE IF NOT EXISTS driver_tracking_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'offline' CHECK (status IN ('active', 'break', 'offline', 'maintenance')),
  is_tracking BOOLEAN DEFAULT FALSE,
  last_update TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Route progress tracking table
CREATE TABLE IF NOT EXISTS route_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  estimated_end_time TIMESTAMPTZ,
  current_progress INTEGER DEFAULT 0 CHECK (current_progress >= 0 AND current_progress <= 100),
  completed_stops TEXT[] DEFAULT '{}',
  remaining_stops TEXT[] DEFAULT '{}',
  current_stop TEXT,
  next_stop TEXT,
  delays INTEGER DEFAULT 0, -- in minutes
  fuel_consumption DECIMAL(8, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(route_id, driver_id)
);

-- Vehicle tracking data table
CREATE TABLE IF NOT EXISTS vehicle_tracking_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed DECIMAL(6, 2),
  fuel_level DECIMAL(5, 2),
  engine_status TEXT DEFAULT 'stopped' CHECK (engine_status IN ('running', 'stopped', 'maintenance')),
  odometer DECIMAL(10, 2),
  harsh_braking INTEGER DEFAULT 0,
  harsh_acceleration INTEGER DEFAULT 0,
  harsh_cornering INTEGER DEFAULT 0,
  idling_time INTEGER DEFAULT 0, -- in seconds
  speeding_events INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_id ON driver_locations(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_recorded_at ON driver_locations(recorded_at);
CREATE INDEX IF NOT EXISTS idx_driver_locations_route_id ON driver_locations(route_id);
CREATE INDEX IF NOT EXISTS idx_driver_tracking_status_driver_id ON driver_tracking_status(driver_id);
CREATE INDEX IF NOT EXISTS idx_route_progress_route_id ON route_progress(route_id);
CREATE INDEX IF NOT EXISTS idx_route_progress_driver_id ON route_progress(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_tracking_data_vehicle_id ON vehicle_tracking_data(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_tracking_data_recorded_at ON vehicle_tracking_data(recorded_at);

-- Create spatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_driver_locations_spatial ON driver_locations USING GIST (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);

-- Enable Row Level Security
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_tracking_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_tracking_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for driver_locations
CREATE POLICY "Drivers can view their own location data" ON driver_locations
  FOR SELECT USING (auth.uid()::text = driver_id::text);

CREATE POLICY "Drivers can insert their own location data" ON driver_locations
  FOR INSERT WITH CHECK (auth.uid()::text = driver_id::text);

CREATE POLICY "Managers can view all driver locations" ON driver_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'council')
    )
  );

-- RLS Policies for driver_tracking_status
CREATE POLICY "Drivers can view their own tracking status" ON driver_tracking_status
  FOR SELECT USING (auth.uid()::text = driver_id::text);

CREATE POLICY "Drivers can update their own tracking status" ON driver_tracking_status
  FOR UPDATE USING (auth.uid()::text = driver_id::text);

CREATE POLICY "Managers can view all tracking statuses" ON driver_tracking_status
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'council')
    )
  );

-- RLS Policies for route_progress
CREATE POLICY "Drivers can view their own route progress" ON route_progress
  FOR SELECT USING (auth.uid()::text = driver_id::text);

CREATE POLICY "Managers can view all route progress" ON route_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'council')
    )
  );

-- RLS Policies for vehicle_tracking_data
CREATE POLICY "Drivers can view their assigned vehicle data" ON vehicle_tracking_data
  FOR SELECT USING (auth.uid()::text = driver_id::text);

CREATE POLICY "Managers can view all vehicle tracking data" ON vehicle_tracking_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'council')
    )
  );

-- Create functions for tracking operations
CREATE OR REPLACE FUNCTION update_driver_location(
  p_driver_id UUID,
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_accuracy DECIMAL DEFAULT NULL,
  p_altitude DECIMAL DEFAULT NULL,
  p_heading DECIMAL DEFAULT NULL,
  p_speed DECIMAL DEFAULT NULL,
  p_vehicle_id UUID DEFAULT NULL,
  p_route_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO driver_locations (
    driver_id, latitude, longitude, accuracy_meters, altitude_meters, heading_degrees, speed_kmh,
    vehicle_id, route_id, recorded_at, updated_at
  ) VALUES (
    p_driver_id, p_latitude, p_longitude, p_accuracy, p_altitude, p_heading, p_speed,
    p_vehicle_id, p_route_id, NOW(), NOW()
  );
  
  -- Update tracking status
  INSERT INTO driver_tracking_status (driver_id, vehicle_id, route_id, last_update, updated_at)
  VALUES (p_driver_id, p_vehicle_id, p_route_id, NOW(), NOW())
  ON CONFLICT (driver_id) DO UPDATE SET
    vehicle_id = EXCLUDED.vehicle_id,
    route_id = EXCLUDED.route_id,
    last_update = EXCLUDED.last_update,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get nearby drivers
CREATE OR REPLACE FUNCTION get_nearby_drivers(
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_radius_km DECIMAL DEFAULT 10
) RETURNS TABLE (
  driver_id UUID,
  driver_name TEXT,
  distance_km DECIMAL,
  latitude DECIMAL,
  longitude DECIMAL,
  last_update TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dl.driver_id,
    CONCAT(p.first_name, ' ', p.last_name) as driver_name,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
      ST_SetSRID(ST_MakePoint(dl.longitude, dl.latitude), 4326)::geography
    ) / 1000 as distance_km,
    dl.latitude,
    dl.longitude,
    dl.recorded_at as last_update
  FROM driver_locations dl
  JOIN profiles p ON dl.driver_id = p.id
  WHERE ST_DWithin(
    ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
    ST_SetSRID(ST_MakePoint(dl.longitude, dl.latitude), 4326)::geography,
    p_radius_km * 1000
  )
  AND dl.recorded_at > NOW() - INTERVAL '1 hour'
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_driver_locations_updated_at
  BEFORE UPDATE ON driver_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_tracking_status_updated_at
  BEFORE UPDATE ON driver_tracking_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_progress_updated_at
  BEFORE UPDATE ON route_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_tracking_data_updated_at
  BEFORE UPDATE ON vehicle_tracking_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
