-- Backfill driver data with correct column names and safe defaults

-- 1) Ensure active drivers have an active assignment if an active vehicle exists in their org
INSERT INTO driver_assignments (driver_id, vehicle_id, organization_id, status, assigned_date)
SELECT 
  d.id AS driver_id,
  (
    SELECT v.id 
    FROM vehicles v 
    WHERE v.organization_id = d.organization_id 
      AND v.status = 'active' 
    LIMIT 1
  ) AS vehicle_id,
  d.organization_id,
  'active'::text,
  CURRENT_DATE
FROM profiles d
WHERE d.role = 'driver'
  AND d.employment_status = 'active'
  AND NOT EXISTS (
    SELECT 1 
    FROM driver_assignments da 
    WHERE da.driver_id = d.id AND da.status = 'active'
  )
  AND EXISTS (
    SELECT 1 FROM vehicles v 
    WHERE v.organization_id = d.organization_id AND v.status = 'active'
  );

-- 2) Seed fuel purchases using the actual schema (quantity, unit_price, total_cost)
INSERT INTO fuel_purchases (
  driver_id, vehicle_id, purchase_date, fuel_type, quantity, unit_price, total_cost, location, organization_id
)
SELECT 
  da.driver_id,
  da.vehicle_id,
  (CURRENT_DATE - ((RANDOM() * 6)::int))::date AS purchase_date,
  'diesel'::text,
  (50 + (RANDOM() * 50))::numeric(10,2) AS quantity,
  (1.45 + (RANDOM() * 0.20))::numeric(10,3) AS unit_price,
  0::numeric(12,2) AS total_cost,
  'Test Station'::text AS location,
  da.organization_id
FROM driver_assignments da
WHERE da.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM fuel_purchases fp 
    WHERE fp.driver_id = da.driver_id
  );

-- 2b) Compute total_cost where still zero
UPDATE fuel_purchases 
SET total_cost = (quantity * unit_price)
WHERE total_cost = 0;

-- 3) Seed driver risk scores if missing
INSERT INTO driver_risk_scores (
  driver_id, organization_id, score, risk_level, factors, calculated_at, created_by
)
SELECT 
  d.id,
  d.organization_id,
  (65 + (RANDOM() * 30))::numeric(5,2) AS score,
  CASE 
    WHEN RANDOM() < 0.7 THEN 'low'
    WHEN RANDOM() < 0.9 THEN 'medium'
    ELSE 'high'
  END AS risk_level,
  jsonb_build_object(
    'experience_years', (2 + RANDOM() * 10)::int,
    'violations_count', (RANDOM() * 3)::int,
    'training_completed', (RANDOM() > 0.3)
  ) AS factors,
  NOW(),
  (
    SELECT p.id FROM profiles p 
    WHERE p.role = 'admin' AND p.organization_id = d.organization_id 
    ORDER BY p.created_at ASC
    LIMIT 1
  ) AS created_by
FROM profiles d
WHERE d.role = 'driver' 
  AND d.employment_status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM driver_risk_scores drs 
    WHERE drs.driver_id = d.id
  );

-- 4) Add recent time entries for active drivers across last 5 days (avoid duplicates)
INSERT INTO time_entries (
  driver_id, organization_id, entry_date, clock_in_time, clock_out_time, total_hours, driving_hours
)
SELECT 
  d.id,
  d.organization_id,
  (CURRENT_DATE - gs.n)::date AS entry_date,
  '08:00:00'::time,
  '16:00:00'::time,
  8.0::numeric,
  7.5::numeric
FROM profiles d
CROSS JOIN LATERAL generate_series(1, 5) AS gs(n)
WHERE d.role = 'driver'
  AND d.employment_status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM time_entries te 
    WHERE te.driver_id = d.id 
      AND te.entry_date = (CURRENT_DATE - gs.n)::date
  );