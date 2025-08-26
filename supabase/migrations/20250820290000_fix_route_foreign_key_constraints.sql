-- Fix foreign key constraints to allow cascading deletes
-- This will allow deleting routes and automatically delete related records

-- First, drop existing foreign key constraints for tables that exist
ALTER TABLE IF EXISTS public.route_assignments 
DROP CONSTRAINT IF EXISTS route_assignments_route_id_fkey;

ALTER TABLE IF EXISTS public.route_students 
DROP CONSTRAINT IF EXISTS route_students_route_id_fkey;

-- Re-add foreign key constraints with CASCADE DELETE for existing tables
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'route_assignments') THEN
        ALTER TABLE public.route_assignments 
        ADD CONSTRAINT route_assignments_route_id_fkey 
        FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'route_students') THEN
        ALTER TABLE public.route_students 
        ADD CONSTRAINT route_students_route_id_fkey 
        FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE;
    END IF;
END $$;
