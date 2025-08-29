-- Add avatar_url column to profiles table for storing profile images

-- Add avatar_url column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create storage bucket for driver avatars if it doesn't exist
-- Note: This needs to be run in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('driver-avatars', 'driver-avatars', true);

-- Create storage policy for driver avatars
-- Allow authenticated users to upload their own avatar
CREATE POLICY IF NOT EXISTS "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'driver-avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to view avatars
CREATE POLICY IF NOT EXISTS "Users can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'driver-avatars');

-- Allow users to update their own avatar
CREATE POLICY IF NOT EXISTS "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'driver-avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to delete their own avatar
CREATE POLICY IF NOT EXISTS "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'driver-avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Add comment to the column
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to the driver''s profile image stored in Supabase storage';
