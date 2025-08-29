-- Create tachograph_folders table
CREATE TABLE IF NOT EXISTS public.tachograph_folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_folder_id UUID REFERENCES public.tachograph_folders(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    file_count INTEGER DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tachograph_folders_organization_id ON public.tachograph_folders(organization_id);
CREATE INDEX IF NOT EXISTS idx_tachograph_folders_parent_folder_id ON public.tachograph_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_tachograph_folders_created_by ON public.tachograph_folders(created_by);

-- Enable RLS (Row Level Security)
ALTER TABLE public.tachograph_folders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view folders in their organization" ON public.tachograph_folders
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create folders in their organization" ON public.tachograph_folders
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update folders in their organization" ON public.tachograph_folders
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete folders in their organization" ON public.tachograph_folders
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

CREATE TRIGGER update_tachograph_folders_updated_at 
    BEFORE UPDATE ON public.tachograph_folders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
