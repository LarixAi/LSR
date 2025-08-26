-- Create documents table with vehicle_id support
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  file_name TEXT,
  file_path TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'archived')),
  expiry_date DATE,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  document_type TEXT,
  is_public BOOLEAN DEFAULT true,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  tags TEXT[] DEFAULT '{}',
  version TEXT DEFAULT '1.0',
  department TEXT,
  is_favorite BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON public.documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_vehicle_id ON public.documents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "documents_org_isolation" ON public.documents
FOR ALL USING (
  organization_id = (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Add specific policy for vehicle documents
CREATE POLICY "vehicle_documents_access" ON public.documents
FOR ALL USING (
  (vehicle_id IS NULL) OR 
  (vehicle_id IN (
    SELECT v.id FROM public.vehicles v 
    WHERE v.organization_id = (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  ))
);


