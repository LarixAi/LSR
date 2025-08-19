-- Create a default organization and link the admin profile
DO $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Ensure an organization exists
  INSERT INTO public.organizations (id, name, slug)
  VALUES (gen_random_uuid(), 'Transport Bus Group', 'transport-bus-group')
  ON CONFLICT (slug) DO NOTHING;

  -- Get the organization id
  SELECT id INTO v_org_id FROM public.organizations WHERE slug = 'transport-bus-group' LIMIT 1;

  -- Assign the organization to the admin profile
  UPDATE public.profiles
  SET organization_id = v_org_id
  WHERE id = 'd81ac385-bc1d-43dd-bb1e-25b0608ff037';
END $$;