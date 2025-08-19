-- Fix null organization_id values and then apply constraints

-- 1. First, let's see what profiles have null organization_id
-- We'll need to handle these carefully

-- For now, let's create a default organization for orphaned records
INSERT INTO organizations (id, name, slug, contact_email, is_active)
VALUES (
  gen_random_uuid(),
  'Default Organization',
  'default-org',
  'admin@default.com',
  true
) ON CONFLICT DO NOTHING;

-- Update null organization_id values in profiles to the default organization
UPDATE profiles 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'default-org' LIMIT 1)
WHERE organization_id IS NULL;

-- Update null organization_id_new values in vehicles
UPDATE vehicles 
SET organization_id_new = (SELECT id FROM organizations WHERE slug = 'default-org' LIMIT 1)
WHERE organization_id_new IS NULL;

-- Update other tables with null organization_ids
UPDATE driver_assignments 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'default-org' LIMIT 1)
WHERE organization_id IS NULL;

UPDATE time_entries 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'default-org' LIMIT 1)
WHERE organization_id IS NULL;

UPDATE vehicle_checks 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'default-org' LIMIT 1)
WHERE organization_id IS NULL;

UPDATE jobs 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'default-org' LIMIT 1)
WHERE organization_id IS NULL;

UPDATE incidents 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'default-org' LIMIT 1)
WHERE organization_id IS NULL;

UPDATE routes 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'default-org' LIMIT 1)
WHERE organization_id IS NULL;

UPDATE notifications 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'default-org' LIMIT 1)
WHERE organization_id IS NULL;