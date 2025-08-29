-- Update handle_new_user to ensure organization_id is set from metadata (idempotent)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_role text;
  v_org_id uuid := NULL;
  v_org_meta text;
BEGIN
  -- Determine role from metadata or default to 'driver'
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'driver');

  -- Try to read organization_id from metadata and cast to uuid if valid
  v_org_meta := NEW.raw_user_meta_data->>'organization_id';
  IF v_org_meta IS NOT NULL AND v_org_meta ~* '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
    v_org_id := v_org_meta::uuid;
  END IF;

  -- Insert or update profile with org assignment
  INSERT INTO public.profiles (id, user_id, email, first_name, last_name, role, organization_id)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    v_role,
    v_org_id
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      role = EXCLUDED.role,
      organization_id = COALESCE(EXCLUDED.organization_id, public.profiles.organization_id),
      updated_at = now();

  RETURN NEW;
END;
$function$;

-- Backfill existing profiles where organization_id is NULL using auth.users metadata when available and valid
DO $$
DECLARE
  v_count integer := 0;
BEGIN
  WITH to_update AS (
    SELECT p.id, (au.raw_user_meta_data->>'organization_id')::uuid AS org_id
    FROM public.profiles p
    JOIN auth.users au ON au.id = p.id
    WHERE p.organization_id IS NULL
      AND (au.raw_user_meta_data->>'organization_id') ~* '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  )
  UPDATE public.profiles p
  SET organization_id = tu.org_id,
      updated_at = now()
  FROM to_update tu
  WHERE p.id = tu.id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Backfilled % profile(s) with organization_id from auth.users metadata', v_count;
END $$;