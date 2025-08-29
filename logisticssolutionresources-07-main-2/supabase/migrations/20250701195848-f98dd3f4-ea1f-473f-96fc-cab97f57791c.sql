
-- Add foreign key constraint to link documents.related_entity_id to profiles.id
-- This will allow Supabase's automatic join syntax to work properly
ALTER TABLE public.documents 
ADD CONSTRAINT documents_related_entity_id_fkey 
FOREIGN KEY (related_entity_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_related_entity_id 
ON public.documents(related_entity_id);
