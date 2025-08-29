
-- Add foreign key relationship from vehicle_checks to profiles
-- Since both driver_id and profiles.id reference auth.users.id, we can create this relationship
ALTER TABLE public.vehicle_checks 
ADD CONSTRAINT vehicle_checks_driver_id_profiles_fkey 
FOREIGN KEY (driver_id) REFERENCES public.profiles(id);
