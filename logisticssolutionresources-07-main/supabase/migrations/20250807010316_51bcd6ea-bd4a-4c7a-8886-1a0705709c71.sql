-- Create storage bucket for fuel receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fuel-receipts', 'fuel-receipts', false);

-- Create storage policies for fuel receipts
CREATE POLICY "Drivers can upload their own fuel receipts" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'fuel-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Drivers can view their own fuel receipts" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'fuel-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all fuel receipts" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'fuel-receipts' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council')
  )
);