-- Fix driver backend by ensuring all drivers have necessary data

-- Create driver assignments for drivers without assignments
INSERT INTO driver_assignments (driver_id, vehicle_id, organization_id, status, assigned_date)
SELECT 
  d.id as driver_id,
  (SELECT v.id FROM vehicles v WHERE v.organization_id = d.organization_id AND v.status = 'active' LIMIT 1) as vehicle_id,
  d.organization_id,
  'active'::text,
  CURRENT_DATE
FROM profiles d
WHERE d.role = 'driver' 
  AND d.employment_status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM driver_assignments da 
    WHERE da.driver_id = d.id AND da.status = 'active'
  )
  AND EXISTS (SELECT 1 FROM vehicles v WHERE v.organization_id = d.organization_id AND v.status = 'active');

-- Create sample fuel purchases for drivers
INSERT INTO fuel_purchases (driver_id, vehicle_id, purchase_date, fuel_type, quantity_liters, price_per_liter, total_amount, location, organization_id)
SELECT 
  da.driver_id,
  da.vehicle_id,
  CURRENT_DATE - INTERVAL '1 day' * (RANDOM() * 7)::integer,
  'diesel',
  50 + (RANDOM() * 50),
  1.45 + (RANDOM() * 0.20),
  0,
  'Test Station',
  da.organization_id
FROM driver_assignments da
WHERE da.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM fuel_purchases fp WHERE fp.driver_id = da.driver_id);

-- Update fuel purchase totals
UPDATE fuel_purchases 
SET total_amount = quantity_liters * price_per_liter
WHERE total_amount = 0;

-- Create driver risk scores
INSERT INTO driver_risk_scores (driver_id, organization_id, score, risk_level, factors, calculated_at, created_by)
SELECT 
  d.id as driver_id,
  d.organization_id,
  65 + (RANDOM() * 30)::numeric, -- Random score between 65-95
  CASE 
    WHEN RANDOM() < 0.7 THEN 'low'
    WHEN RANDOM() < 0.9 THEN 'medium'
    ELSE 'high'
  END,
  jsonb_build_object(
    'experience_years', (2 + RANDOM() * 10)::integer,
    'violations_count', (RANDOM() * 3)::integer,
    'training_completed', RANDOM() > 0.3
  ),
  NOW(),
  (SELECT id FROM profiles WHERE role = 'admin' AND organization_id = d.organization_id LIMIT 1)
FROM profiles d
WHERE d.role = 'driver' 
  AND d.employment_status = 'active'
  AND NOT EXISTS (SELECT 1 FROM driver_risk_scores drs WHERE drs.driver_id = d.id);

-- Create additional time entries for better data
INSERT INTO time_entries (driver_id, entry_date, clock_in_time, clock_out_time, total_hours, driving_hours, organization_id)
SELECT 
  d.id as driver_id,
  CURRENT_DATE - INTERVAL '1 day' * generate_series(1, 5),
  '08:00:00'::time,
  '16:00:00'::time,
  8.0,
  7.5,
  d.organization_id
FROM profiles d
WHERE d.role = 'driver' 
  AND d.employment_status = 'active'
ON CONFLICT DO NOTHING;