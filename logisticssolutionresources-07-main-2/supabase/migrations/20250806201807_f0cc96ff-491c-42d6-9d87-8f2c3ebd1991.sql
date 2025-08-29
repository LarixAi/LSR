-- Create storage bucket for vehicle documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicle-documents', 'vehicle-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for vehicle documents
CREATE POLICY "Vehicle documents are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'vehicle-documents');

CREATE POLICY "Authenticated users can upload vehicle documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'vehicle-documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their uploaded vehicle documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'vehicle-documents' 
  AND auth.uid()::text = owner
);

CREATE POLICY "Users can delete their uploaded vehicle documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'vehicle-documents' 
  AND auth.uid()::text = owner
);