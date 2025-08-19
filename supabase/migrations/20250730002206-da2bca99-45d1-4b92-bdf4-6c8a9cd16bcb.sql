-- Add support for digivu+ and Generation 2 Smart Tachographs
-- Update tachograph_records table to support new file types and device information

-- Add new columns to tachograph_records table
ALTER TABLE tachograph_records 
ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS bluetooth_download BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS remote_download BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS generation_type TEXT DEFAULT 'generation_1',
ADD COLUMN IF NOT EXISTS smart_features JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS satellite_data JSONB DEFAULT '{}';

-- Update the file_type constraint to include new formats
ALTER TABLE tachograph_records 
DROP CONSTRAINT IF EXISTS tachograph_records_file_type_check;

ALTER TABLE tachograph_records 
ADD CONSTRAINT tachograph_records_file_type_check 
CHECK (file_type IN ('ddd', 'tgd', 'c1b', 'v1b', 'v2b', 'esm'));

-- Add constraint for device_type
ALTER TABLE tachograph_records 
ADD CONSTRAINT tachograph_records_device_type_check 
CHECK (device_type IN ('standard', 'digivu_plus', 'generation_2', 'bluetooth_enabled'));

-- Add constraint for generation_type
ALTER TABLE tachograph_records 
ADD CONSTRAINT tachograph_records_generation_type_check 
CHECK (generation_type IN ('generation_1', 'generation_2', 'smart_2'));

-- Create table for tachograph device configurations
CREATE TABLE IF NOT EXISTS tachograph_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL CHECK (device_type IN ('digivu_plus', 'generation_2', 'bluetooth_reader', 'standard')),
    serial_number TEXT UNIQUE,
    firmware_version TEXT,
    bluetooth_enabled BOOLEAN DEFAULT false,
    remote_access_enabled BOOLEAN DEFAULT false,
    last_sync TIMESTAMP WITH TIME ZONE,
    configuration JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID
);

-- Enable RLS for tachograph_devices
ALTER TABLE tachograph_devices ENABLE ROW LEVEL SECURITY;

-- Create policies for tachograph_devices
CREATE POLICY "Organization members can view tachograph devices"
    ON tachograph_devices FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Admins can manage tachograph devices"
    ON tachograph_devices FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'council', 'compliance_officer')
    ));

-- Create table for tachograph synchronization logs
CREATE TABLE IF NOT EXISTS tachograph_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES tachograph_devices(id),
    organization_id UUID NOT NULL,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('manual', 'automatic', 'scheduled', 'bluetooth')),
    sync_status TEXT NOT NULL CHECK (sync_status IN ('initiated', 'in_progress', 'completed', 'failed')),
    files_downloaded INTEGER DEFAULT 0,
    data_volume_mb NUMERIC DEFAULT 0,
    error_message TEXT,
    sync_duration_seconds INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    initiated_by UUID,
    metadata JSONB DEFAULT '{}'
);

-- Enable RLS for tachograph_sync_logs
ALTER TABLE tachograph_sync_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for tachograph_sync_logs
CREATE POLICY "Organization members can view sync logs"
    ON tachograph_sync_logs FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create sync logs"
    ON tachograph_sync_logs FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tachograph_records_device_type ON tachograph_records(device_type);
CREATE INDEX IF NOT EXISTS idx_tachograph_records_generation_type ON tachograph_records(generation_type);
CREATE INDEX IF NOT EXISTS idx_tachograph_records_bluetooth ON tachograph_records(bluetooth_download);
CREATE INDEX IF NOT EXISTS idx_tachograph_devices_serial ON tachograph_devices(serial_number);
CREATE INDEX IF NOT EXISTS idx_tachograph_devices_org ON tachograph_devices(organization_id);
CREATE INDEX IF NOT EXISTS idx_tachograph_sync_logs_device ON tachograph_sync_logs(device_id);

-- Update trigger for tachograph_devices
CREATE OR REPLACE FUNCTION update_tachograph_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tachograph_devices_updated_at
    BEFORE UPDATE ON tachograph_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_tachograph_devices_updated_at();