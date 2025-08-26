-- Add vehicle_id field to documents table
-- This allows documents to be specifically linked to vehicles

-- Add vehicle_id column to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE;

-- Create index for better performance when querying by vehicle_id
CREATE INDEX IF NOT EXISTS idx_documents_vehicle_id ON public.documents(vehicle_id);

-- Update RLS policies to include vehicle_id access
-- Users can view documents for vehicles in their organization
DROP POLICY IF EXISTS "documents_org_isolation" ON public.documents;

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


