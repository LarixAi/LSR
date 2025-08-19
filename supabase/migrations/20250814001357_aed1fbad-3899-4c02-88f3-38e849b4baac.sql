-- Add computed requires_maintenance column as a view for backwards compatibility

-- Create a view that adds the computed requires_maintenance field
CREATE OR REPLACE VIEW vehicle_checks_with_maintenance AS
SELECT 
  *,
  CASE 
    WHEN status = 'failed' OR 
         status = 'maintenance_required' OR
         (notes IS NOT NULL AND (
           LOWER(notes) LIKE '%maintenance%' OR 
           LOWER(notes) LIKE '%repair%'
         ))
    THEN true
    ELSE false
  END as requires_maintenance
FROM vehicle_checks;

-- Grant necessary permissions
GRANT SELECT ON vehicle_checks_with_maintenance TO anon, authenticated;

-- Create RLS policy for the view
ALTER VIEW vehicle_checks_with_maintenance SET (security_barrier = true);
CREATE POLICY "vehicle_checks_with_maintenance_org_access" ON vehicle_checks_with_maintenance
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

-- Create indexes to optimize the maintenance queries
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_maintenance_status 
ON vehicle_checks (organization_id, status) 
WHERE status IN ('failed', 'maintenance_required');

CREATE INDEX IF NOT EXISTS idx_vehicle_checks_maintenance_notes 
ON vehicle_checks (organization_id, notes) 
WHERE notes IS NOT NULL;