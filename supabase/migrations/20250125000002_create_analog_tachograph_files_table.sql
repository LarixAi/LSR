-- Create analog_tachograph_files table
CREATE TABLE IF NOT EXISTS public.analog_tachograph_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    chart_date DATE NOT NULL,
    chart_type VARCHAR(20) NOT NULL DEFAULT 'analog' CHECK (chart_type IN ('analog', 'digital')),
    status VARCHAR(20) NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processed', 'analyzed', 'archived')),
    storage_path TEXT NOT NULL,
    analysis_data JSONB,
    notes TEXT,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analog_tachograph_files_organization_id ON public.analog_tachograph_files(organization_id);
CREATE INDEX IF NOT EXISTS idx_analog_tachograph_files_driver_id ON public.analog_tachograph_files(driver_id);
CREATE INDEX IF NOT EXISTS idx_analog_tachograph_files_vehicle_id ON public.analog_tachograph_files(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_analog_tachograph_files_upload_date ON public.analog_tachograph_files(upload_date);
CREATE INDEX IF NOT EXISTS idx_analog_tachograph_files_status ON public.analog_tachograph_files(status);
CREATE INDEX IF NOT EXISTS idx_analog_tachograph_files_chart_date ON public.analog_tachograph_files(chart_date);

-- Enable RLS (Row Level Security)
ALTER TABLE public.analog_tachograph_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view files in their organization" ON public.analog_tachograph_files
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create files in their organization" ON public.analog_tachograph_files
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update files in their organization" ON public.analog_tachograph_files
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete files in their organization" ON public.analog_tachograph_files
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analog_tachograph_files_updated_at 
    BEFORE UPDATE ON public.analog_tachograph_files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for tachograph files if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'tachograph-files',
    'tachograph-files',
    false,
    52428800, -- 50MB limit
    ARRAY['image/*', 'application/pdf', 'text/plain', 'text/csv']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload tachograph files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'tachograph-files' AND
        (storage.foldername(name))[1] IN (
            SELECT organization_id::text FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can view tachograph files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'tachograph-files' AND
        (storage.foldername(name))[1] IN (
            SELECT organization_id::text FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update tachograph files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'tachograph-files' AND
        (storage.foldername(name))[1] IN (
            SELECT organization_id::text FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tachograph files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'tachograph-files' AND
        (storage.foldername(name))[1] IN (
            SELECT organization_id::text FROM public.profiles 
            WHERE id = auth.uid()
        )
    );
