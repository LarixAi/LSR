-- Create storage buckets for document management
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('documents', 'documents', false),
  ('standard-forms', 'standard-forms', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for documents bucket
CREATE POLICY "Authenticated users can view documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can delete documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'council')
  )
);

-- RLS policies for standard-forms bucket (public read-only)
CREATE POLICY "Anyone can view standard forms" ON storage.objects
FOR SELECT USING (bucket_id = 'standard-forms');

CREATE POLICY "Only admins can upload standard forms" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'standard-forms' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Add file_url column to documents table to store actual storage URLs
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS file_url text,
ADD COLUMN IF NOT EXISTS storage_path text;

-- Update documents table to have better file handling
COMMENT ON COLUMN public.documents.file_path IS 'Legacy file path - use file_url instead';
COMMENT ON COLUMN public.documents.file_url IS 'Direct Supabase Storage URL for file access';
COMMENT ON COLUMN public.documents.storage_path IS 'Storage path within bucket for file management';