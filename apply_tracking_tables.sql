-- Apply tracking tables to remote Supabase database
-- Run this in your Supabase SQL editor

-- Create tracking tables for mobile GPS tracking

-- Driver locations table for real-time GPS coordinates
CREATE TABLE IF NOT EXISTS driver_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  vehicle_id UUID,
  route_id UUID,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(5, 2),
  altitude DECIMAL(8, 2),
  heading DECIMAL(5, 2),
  speed DECIMAL(6, 2),
  timestamp TIMESTAMPTZ NOT NULL,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver tracking status table
CREATE TABLE IF NOT EXISTS driver_tracking_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL UNIQUE,
  vehicle_id UUID,
  route_id UUID,
  status TEXT DEFAULT 'offline' CHECK (status IN ('active', 'break', 'offline', 'maintenance')),
  is_tracking BOOLEAN DEFAULT FALSE,
  last_update TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Route progress tracking table
CREATE TABLE IF NOT EXISTS route_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL,
  driver_id UUID NOT NULL,
  vehicle_id UUID NOT NULL,
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
  vehicle_id UUID NOT NULL,
  driver_id UUID NOT NULL,
  route_id UUID,
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
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_id ON driver_locations(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_timestamp ON driver_locations(timestamp);
CREATE INDEX IF NOT EXISTS idx_driver_locations_route_id ON driver_locations(route_id);
CREATE INDEX IF NOT EXISTS idx_driver_tracking_status_driver_id ON driver_tracking_status(driver_id);
CREATE INDEX IF NOT EXISTS idx_route_progress_route_id ON route_progress(route_id);
CREATE INDEX IF NOT EXISTS idx_route_progress_driver_id ON route_progress(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_tracking_data_vehicle_id ON vehicle_tracking_data(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_tracking_data_timestamp ON vehicle_tracking_data(timestamp);

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

-- Insert some sample data for testing
INSERT INTO driver_tracking_status (driver_id, status, is_tracking) 
VALUES 
  ('demo-driver-001', 'offline', false),
  ('demo-driver-002', 'offline', false)
ON CONFLICT (driver_id) DO NOTHING;

-- Enable Row Level Security (optional - can be configured later)
-- ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE driver_tracking_status ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE route_progress ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vehicle_tracking_data ENABLE ROW LEVEL SECURITY;
