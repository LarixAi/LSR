-- Create documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for documents bucket
-- Policy for uploading documents (only authenticated users can upload to their organization's folder)
CREATE POLICY "documents_upload_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = 'uploads' AND
  (storage.foldername(name))[2] = auth.jwt() ->> 'organization_id' AND
  (storage.foldername(name))[3] = auth.uid()::text
);

-- Policy for viewing documents (users can only view documents from their organization)
CREATE POLICY "documents_view_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[2] = auth.jwt() ->> 'organization_id'
);

-- Policy for updating documents (users can only update their own uploaded documents)
CREATE POLICY "documents_update_policy" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[2] = auth.jwt() ->> 'organization_id' AND
  (storage.foldername(name))[3] = auth.uid()::text
);

-- Policy for deleting documents (users can only delete their own uploaded documents)
CREATE POLICY "documents_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[2] = auth.jwt() ->> 'organization_id' AND
  (storage.foldername(name))[3] = auth.uid()::text
);
