-- =============================================================================
-- PERFORMANCE OPTIMIZATION SCRIPT
-- This adds critical indexes and optimizes database performance
-- =============================================================================

-- Step 1: Add critical indexes for organization-based queries
-- These are the most important indexes for multi-tenant performance

-- Profiles table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_org_role ON public.profiles(organization_id, role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- Vehicles table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicles_organization_id ON public.vehicles(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicles_created_at ON public.vehicles(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicles_org_status ON public.vehicles(organization_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicles_license_plate ON public.vehicles(license_plate);

-- Jobs table indexes (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_organization_id ON public.jobs(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_status ON public.jobs(status)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_assigned_to ON public.jobs(assigned_to)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_org_status ON public.jobs(organization_id, status)';
    END IF;
END $$;

-- Routes table indexes (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'routes') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_routes_organization_id ON public.routes(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_routes_status ON public.routes(status)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_routes_created_at ON public.routes(created_at)';
    END IF;
END $$;

-- Time entries table indexes (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'time_entries') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_organization_id ON public.time_entries(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_driver_id ON public.time_entries(driver_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_date ON public.time_entries(date)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_org_driver ON public.time_entries(organization_id, driver_id)';
    END IF;
END $$;

-- Incidents table indexes (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_incidents_organization_id ON public.incidents(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_incidents_status ON public.incidents(status)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_incidents_org_status ON public.incidents(organization_id, status)';
    END IF;
END $$;

-- Vehicle checks table indexes (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vehicle_checks') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicle_checks_organization_id ON public.vehicle_checks(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicle_checks_vehicle_id ON public.vehicle_checks(vehicle_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicle_checks_created_at ON public.vehicle_checks(created_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicle_checks_org_vehicle ON public.vehicle_checks(organization_id, vehicle_id)';
    END IF;
END $$;

-- Step 2: Create materialized views for expensive analytics queries

-- Organization statistics view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_organization_stats AS
SELECT 
    organization_id,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE role = 'driver') as total_drivers,
    COUNT(*) FILTER (WHERE role = 'admin') as total_admins,
    COUNT(*) FILTER (WHERE role = 'parent') as total_parents,
    COUNT(*) FILTER (WHERE role = 'mechanic') as total_mechanics,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE is_active = false) as inactive_users,
    MAX(created_at) as last_user_created,
    MIN(created_at) as first_user_created
FROM public.profiles
WHERE organization_id IS NOT NULL
GROUP BY organization_id;

-- Vehicle statistics view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_vehicle_stats AS
SELECT 
    organization_id,
    COUNT(*) as total_vehicles,
    COUNT(*) FILTER (WHERE status = 'active') as active_vehicles,
    COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance_vehicles,
    COUNT(*) FILTER (WHERE status = 'inactive') as inactive_vehicles,
    COUNT(DISTINCT vehicle_type) as vehicle_types,
    MAX(created_at) as last_vehicle_added,
    MIN(created_at) as first_vehicle_added
FROM public.vehicles
WHERE organization_id IS NOT NULL
GROUP BY organization_id;

-- Job statistics view (if jobs table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs') THEN
        EXECUTE 'CREATE MATERIALIZED VIEW IF NOT EXISTS mv_job_stats AS
        SELECT 
            organization_id,
            COUNT(*) as total_jobs,
            COUNT(*) FILTER (WHERE status = ''active'') as active_jobs,
            COUNT(*) FILTER (WHERE status = ''completed'') as completed_jobs,
            COUNT(*) FILTER (WHERE status = ''cancelled'') as cancelled_jobs,
            COUNT(DISTINCT assigned_to) as unique_assignees,
            MAX(created_at) as last_job_created,
            MIN(created_at) as first_job_created
        FROM public.jobs
        WHERE organization_id IS NOT NULL
        GROUP BY organization_id';
    END IF;
END $$;

-- Step 3: Create refresh functions for materialized views
CREATE OR REPLACE FUNCTION refresh_organization_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_organization_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION refresh_vehicle_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_vehicle_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION refresh_job_stats()
RETURNS void AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs') THEN
        EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_job_stats';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION refresh_all_stats()
RETURNS void AS $$
BEGIN
    PERFORM refresh_organization_stats();
    PERFORM refresh_vehicle_stats();
    PERFORM refresh_job_stats();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create performance monitoring functions
CREATE OR REPLACE FUNCTION get_slow_queries(hours_back INTEGER DEFAULT 24)
RETURNS TABLE (
    query_text TEXT,
    execution_time_ms NUMERIC,
    calls BIGINT,
    total_time_ms NUMERIC,
    mean_time_ms NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        query::TEXT as query_text,
        ROUND(mean_exec_time, 2) as execution_time_ms,
        calls,
        ROUND(total_exec_time, 2) as total_time_ms,
        ROUND(mean_exec_time, 2) as mean_time_ms
    FROM pg_stat_statements
    WHERE mean_exec_time > 100  -- Queries taking more than 100ms
    AND query_start > NOW() - INTERVAL '1 hour' * hours_back
    ORDER BY mean_exec_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create index usage monitoring
CREATE OR REPLACE FUNCTION get_index_usage_stats()
RETURNS TABLE (
    table_name TEXT,
    index_name TEXT,
    index_size TEXT,
    index_scans BIGINT,
    index_tuples_read BIGINT,
    index_tuples_fetched BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname::TEXT as table_name,
        indexname::TEXT as index_name,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
        idx_scan as index_scans,
        idx_tup_read as index_tuples_read,
        idx_tup_fetch as index_tuples_fetched
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create table size monitoring
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
    table_name TEXT,
    table_size TEXT,
    index_size TEXT,
    total_size TEXT,
    row_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
        n_tup_ins + n_tup_upd + n_tup_del as row_count
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create automatic maintenance function
CREATE OR REPLACE FUNCTION perform_maintenance()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
    start_time TIMESTAMP;
    end_time TIMESTAMP;
BEGIN
    start_time := clock_timestamp();
    
    -- Refresh materialized views
    PERFORM refresh_all_stats();
    result := result || 'Materialized views refreshed. ';
    
    -- Analyze tables for better query planning
    ANALYZE public.profiles;
    ANALYZE public.vehicles;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs') THEN
        ANALYZE public.jobs;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'routes') THEN
        ANALYZE public.routes;
    END IF;
    
    result := result || 'Tables analyzed. ';
    
    -- Clean up old audit logs (keep last 90 days)
    PERFORM cleanup_old_audit_logs(90);
    result := result || 'Old audit logs cleaned. ';
    
    end_time := clock_timestamp();
    result := result || 'Maintenance completed in ' || EXTRACT(EPOCH FROM (end_time - start_time)) || ' seconds.';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create performance dashboard view
CREATE OR REPLACE VIEW performance_dashboard AS
SELECT 
    'Database Performance' as category,
    'Total Tables' as metric,
    COUNT(*)::TEXT as value
FROM information_schema.tables 
WHERE table_schema = 'public'

UNION ALL

SELECT 
    'Database Performance' as category,
    'Total Indexes' as metric,
    COUNT(*)::TEXT as value
FROM pg_indexes 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Database Performance' as category,
    'Database Size' as metric,
    pg_size_pretty(pg_database_size(current_database())) as value

UNION ALL

SELECT 
    'User Activity' as category,
    'Total Users' as metric,
    COUNT(*)::TEXT as value
FROM public.profiles

UNION ALL

SELECT 
    'User Activity' as category,
    'Active Users' as metric,
    COUNT(*)::TEXT as value
FROM public.profiles
WHERE is_active = true

UNION ALL

SELECT 
    'Vehicle Management' as category,
    'Total Vehicles' as metric,
    COUNT(*)::TEXT as value
FROM public.vehicles

UNION ALL

SELECT 
    'Vehicle Management' as category,
    'Active Vehicles' as metric,
    COUNT(*)::TEXT as value
FROM public.vehicles
WHERE status = 'active';

-- Step 9: Show success message
DO $$ 
BEGIN
    RAISE NOTICE 'PERFORMANCE OPTIMIZATION COMPLETED SUCCESSFULLY';
    RAISE NOTICE 'Critical indexes added for organization-based queries';
    RAISE NOTICE 'Materialized views created for expensive analytics';
    RAISE NOTICE 'Performance monitoring functions created';
    RAISE NOTICE 'Maintenance functions created for ongoing optimization';
    RAISE NOTICE 'Performance dashboard view created';
END $$;







