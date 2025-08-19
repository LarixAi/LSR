-- Create default infringement types for tachograph violations if they don't exist
INSERT INTO public.infringement_types (organization_id, name, description, severity, penalty_points, fine_amount, is_active)
SELECT 
  o.id as organization_id,
  'Excessive Driving Time' as name,
  'Driver exceeded the maximum daily driving time limit' as description,
  'high' as severity,
  6 as penalty_points,
  200.00 as fine_amount,
  true as is_active
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.infringement_types it 
  WHERE it.organization_id = o.id 
  AND LOWER(it.name) LIKE '%driving time%'
);

INSERT INTO public.infringement_types (organization_id, name, description, severity, penalty_points, fine_amount, is_active)
SELECT 
  o.id as organization_id,
  'Insufficient Rest Period' as name,
  'Driver failed to take required rest periods' as description,
  'medium' as severity,
  4 as penalty_points,
  150.00 as fine_amount,
  true as is_active
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.infringement_types it 
  WHERE it.organization_id = o.id 
  AND LOWER(it.name) LIKE '%rest%'
);

INSERT INTO public.infringement_types (organization_id, name, description, severity, penalty_points, fine_amount, is_active)
SELECT 
  o.id as organization_id,
  'Speed Violation' as name,
  'Driver exceeded legal speed limits' as description,
  'high' as severity,
  3 as penalty_points,
  100.00 as fine_amount,
  true as is_active
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.infringement_types it 
  WHERE it.organization_id = o.id 
  AND LOWER(it.name) LIKE '%speed%'
);

INSERT INTO public.infringement_types (organization_id, name, description, severity, penalty_points, fine_amount, is_active)
SELECT 
  o.id as organization_id,
  'Driver Card Violation' as name,
  'Driver card not properly inserted or missing' as description,
  'medium' as severity,
  2 as penalty_points,
  75.00 as fine_amount,
  true as is_active
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.infringement_types it 
  WHERE it.organization_id = o.id 
  AND (LOWER(it.name) LIKE '%card%' OR LOWER(it.name) LIKE '%insertion%')
);

INSERT INTO public.infringement_types (organization_id, name, description, severity, penalty_points, fine_amount, is_active)
SELECT 
  o.id as organization_id,
  'Tachograph Manipulation' as name,
  'Tampering or manipulation of tachograph data detected' as description,
  'critical' as severity,
  12 as penalty_points,
  500.00 as fine_amount,
  true as is_active
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.infringement_types it 
  WHERE it.organization_id = o.id 
  AND LOWER(it.name) LIKE '%manipulation%'
);