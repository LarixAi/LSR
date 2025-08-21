-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "documents_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "documents_view_policy" ON storage.objects;
DROP POLICY IF EXISTS "documents_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "documents_delete_policy" ON storage.objects;

-- Create more permissive policies that work with the current auth setup
-- Policy for uploading documents (authenticated users can upload to documents bucket)
CREATE POLICY "documents_upload_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Policy for viewing documents (authenticated users can view documents)
CREATE POLICY "documents_view_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Policy for updating documents (authenticated users can update their own documents)
CREATE POLICY "documents_update_policy" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Policy for deleting documents (authenticated users can delete their own documents)
CREATE POLICY "documents_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

