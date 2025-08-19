-- Create tachograph-files storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('tachograph-files', 'tachograph-files', false);

-- Create RLS policies for tachograph-files bucket
CREATE POLICY "Users can upload tachograph files for their organization" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'tachograph-files' AND 
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE organization_id = (storage.foldername(name))[1]::uuid
    AND role IN ('admin', 'driver', 'compliance_officer')
  )
);

CREATE POLICY "Users can view tachograph files for their organization" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'tachograph-files' AND 
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE organization_id = (storage.foldername(name))[1]::uuid
    AND role IN ('admin', 'driver', 'compliance_officer')
  )
);

CREATE POLICY "Users can delete tachograph files for their organization" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'tachograph-files' AND 
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE organization_id = (storage.foldername(name))[1]::uuid
    AND role IN ('admin', 'compliance_officer')
  )
);