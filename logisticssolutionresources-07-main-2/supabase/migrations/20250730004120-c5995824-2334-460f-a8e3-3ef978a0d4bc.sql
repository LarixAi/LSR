-- Create tachograph_folders table for organizing uploaded files
CREATE TABLE public.tachograph_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES public.tachograph_folders(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for tachograph_folders
ALTER TABLE public.tachograph_folders ENABLE ROW LEVEL SECURITY;

-- Users can view folders in their organization
CREATE POLICY "Users can view organization folders" 
ON public.tachograph_folders 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

-- Users can manage folders in their organization
CREATE POLICY "Users can manage organization folders" 
ON public.tachograph_folders 
FOR ALL 
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

-- Add folder_id to tachograph_records table
ALTER TABLE public.tachograph_records 
ADD COLUMN folder_id UUID REFERENCES public.tachograph_folders(id) ON DELETE SET NULL;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_tachograph_folders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tachograph_folders_updated_at
BEFORE UPDATE ON public.tachograph_folders
FOR EACH ROW
EXECUTE FUNCTION public.update_tachograph_folders_updated_at();

-- Create index for performance
CREATE INDEX idx_tachograph_folders_organization_id ON public.tachograph_folders(organization_id);
CREATE INDEX idx_tachograph_folders_parent_folder_id ON public.tachograph_folders(parent_folder_id);
CREATE INDEX idx_tachograph_records_folder_id ON public.tachograph_records(folder_id);