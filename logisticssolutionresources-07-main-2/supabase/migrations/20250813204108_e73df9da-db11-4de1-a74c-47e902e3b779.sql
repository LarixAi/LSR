-- Fix the documents table structure to match frontend expectations

-- First, add missing columns to documents table
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT created_at;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS related_entity_type TEXT;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS related_entity_id UUID;

-- Rename file_type to type for consistency
ALTER TABLE public.documents RENAME COLUMN file_type TO type;

-- Update uploaded_at to match created_at for existing records
UPDATE public.documents SET uploaded_at = created_at WHERE uploaded_at IS NULL;

-- Create a view for documents with profile information
CREATE OR REPLACE VIEW public.documents_with_profiles AS
SELECT 
  d.*,
  p.first_name,
  p.last_name,
  d.created_at as upload_date
FROM public.documents d
LEFT JOIN public.profiles p ON d.uploaded_by = p.id;

-- Add RLS policy for the view
ALTER VIEW public.documents_with_profiles SET (security_invoker = on);

-- Grant access to the view
GRANT SELECT ON public.documents_with_profiles TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON public.documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON public.documents(expiry_date);