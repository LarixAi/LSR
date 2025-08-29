-- Fix the documents table structure to match frontend expectations

-- First, add missing columns to documents table  
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS related_entity_type TEXT;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS related_entity_id UUID;

-- Rename file_type to type for consistency if it exists
DO $$ 
BEGIN
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='file_type') THEN
        ALTER TABLE public.documents RENAME COLUMN file_type TO type;
    END IF;
END $$;

-- Update uploaded_at to match created_at for existing records
UPDATE public.documents SET uploaded_at = created_at WHERE uploaded_at IS NULL;

-- Now set default for uploaded_at column
ALTER TABLE public.documents ALTER COLUMN uploaded_at SET DEFAULT now();

-- Create a view for documents with profile information
CREATE OR REPLACE VIEW public.documents_with_profiles AS
SELECT 
  d.id,
  d.name,
  d.type,
  d.category,
  d.status,
  d.uploaded_at,
  d.created_at as upload_date,
  d.expiry_date,
  d.related_entity_type,
  d.related_entity_id,
  d.organization_id,
  d.file_size,
  d.file_path,
  jsonb_build_object(
    'first_name', p.first_name,
    'last_name', p.last_name
  ) as profiles
FROM public.documents d
LEFT JOIN public.profiles p ON d.uploaded_by = p.id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON public.documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON public.documents(expiry_date);