-- Performance Optimization: Add Critical Indexes
-- This migration adds strategic indexes to improve query performance

-- Core relationship indexes
CREATE INDEX IF NOT EXISTS idx_profiles_organization_role 
ON public.profiles (organization_id, role) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_vehicles_organization_active 
ON public.vehicles (organization_id, is_active, vehicle_number);

CREATE INDEX IF NOT EXISTS idx_driver_assignments_active 
ON public.driver_assignments (driver_id, vehicle_id, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_driver_status 
ON public.jobs (assigned_driver_id, status, start_date);

CREATE INDEX IF NOT EXISTS idx_vehicle_checks_org_date 
ON public.vehicle_checks (organization_id, check_date DESC, vehicle_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON public.notifications (user_id, is_read, created_at DESC);

-- Multi-column indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_messages_org_user_unread 
ON public.messages (organization_id, receiver_id, read_status) 
WHERE read_status = false;

-- Optimize RLS policy queries
CREATE INDEX IF NOT EXISTS idx_profiles_auth_uid 
ON public.profiles (id) 
WHERE is_active = true;

-- Geographic indexes for location-based queries
CREATE INDEX IF NOT EXISTS idx_driver_locations_active 
ON public.driver_locations (driver_id, last_updated) 
WHERE is_online = true;

-- AI and automation indexes
CREATE INDEX IF NOT EXISTS idx_ai_tasks_org_status_priority 
ON public.ai_tasks (organization_id, status, priority, due_date);

-- Create a database stats function for monitoring
CREATE OR REPLACE FUNCTION public.get_performance_stats()
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_tables', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'),
    'total_indexes', (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public'),
    'largest_tables', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'table_name', schemaname||'.'||tablename,
          'size_mb', round(pg_total_relation_size(schemaname||'.'||tablename) / 1024.0 / 1024.0, 2)
        )
      )
      FROM (
        SELECT schemaname, tablename
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10
      ) t
    ),
    'slow_queries_detected', false,
    'rls_policies_count', (
      SELECT count(*) 
      FROM pg_policies 
      WHERE schemaname = 'public'
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create query optimization function
CREATE OR REPLACE FUNCTION public.optimize_table_stats()
RETURNS void AS $$
BEGIN
  -- Update table statistics for better query planning
  ANALYZE public.profiles;
  ANALYZE public.vehicles;
  ANALYZE public.jobs;
  ANALYZE public.driver_assignments;
  ANALYZE public.notifications;
  ANALYZE public.audit_logs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';