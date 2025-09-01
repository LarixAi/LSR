-- =============================================================================
-- COMPREHENSIVE AUDIT LOGGING SYSTEM
-- This creates a robust audit logging system for security and compliance
-- =============================================================================

-- Step 1: Create comprehensive audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    organization_id UUID REFERENCES public.organizations(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    request_id TEXT,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    source TEXT DEFAULT 'application',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_organization_id ON public.security_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.security_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.security_audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_severity ON public.security_audit_log(severity);

-- Step 3: Create audit trigger function
CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER AS $$
DECLARE
    user_id_val UUID;
    org_id_val UUID;
    action_type TEXT;
    old_data JSONB;
    new_data JSONB;
BEGIN
    -- Get current user ID
    user_id_val := auth.uid();
    
    -- Determine action type
    action_type := TG_OP;
    
    -- Get organization ID from the record being changed
    IF TG_OP = 'DELETE' THEN
        org_id_val := OLD.organization_id;
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        org_id_val := NEW.organization_id;
        old_data := NULL;
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        org_id_val := COALESCE(NEW.organization_id, OLD.organization_id);
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    END IF;
    
    -- Insert audit log entry
    INSERT INTO public.security_audit_log (
        user_id,
        organization_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        severity,
        metadata
    ) VALUES (
        user_id_val,
        org_id_val,
        action_type,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        old_data,
        new_data,
        CASE 
            WHEN action_type = 'DELETE' THEN 'warning'
            WHEN action_type = 'UPDATE' AND (OLD.role != NEW.role OR OLD.organization_id != NEW.organization_id) THEN 'warning'
            ELSE 'info'
        END,
        jsonb_build_object(
            'operation', action_type,
            'table', TG_TABLE_NAME,
            'trigger_time', now()
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create function to log custom events
CREATE OR REPLACE FUNCTION log_security_event(
    p_action TEXT,
    p_table_name TEXT DEFAULT NULL,
    p_record_id UUID DEFAULT NULL,
    p_severity TEXT DEFAULT 'info',
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.security_audit_log (
        user_id,
        organization_id,
        action,
        table_name,
        record_id,
        severity,
        metadata
    ) VALUES (
        auth.uid(),
        (SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1),
        p_action,
        p_table_name,
        p_record_id,
        p_severity,
        p_metadata
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create function to log authentication events
CREATE OR REPLACE FUNCTION log_auth_event(
    p_user_id UUID,
    p_action TEXT,
    p_success BOOLEAN,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.security_audit_log (
        user_id,
        organization_id,
        action,
        severity,
        ip_address,
        user_agent,
        metadata
    ) VALUES (
        p_user_id,
        (SELECT organization_id FROM public.profiles WHERE id = p_user_id LIMIT 1),
        p_action,
        CASE WHEN p_success THEN 'info' ELSE 'warning' END,
        p_ip_address,
        p_user_agent,
        jsonb_build_object(
            'success', p_success,
            'event_type', 'authentication'
        )
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create function to log Edge Function access
CREATE OR REPLACE FUNCTION log_edge_function_access(
    p_function_name TEXT,
    p_user_id UUID,
    p_success BOOLEAN,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.security_audit_log (
        user_id,
        organization_id,
        action,
        severity,
        metadata
    ) VALUES (
        p_user_id,
        (SELECT organization_id FROM public.profiles WHERE id = p_user_id LIMIT 1),
        'edge_function_access',
        CASE WHEN p_success THEN 'info' ELSE 'error' END,
        jsonb_build_object(
            'function_name', p_function_name,
            'success', p_success,
            'error_message', p_error_message,
            'event_type', 'edge_function'
        )
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Enable RLS on audit log table
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for audit log
CREATE POLICY "audit_log_service_role_access" ON public.security_audit_log
FOR ALL USING (
  current_setting('role') = 'service_role' OR
  current_setting('role') = 'postgres' OR
  current_setting('role') = 'supabase_admin'
);

CREATE POLICY "audit_log_own_org_access" ON public.security_audit_log
FOR SELECT USING (
  organization_id = get_user_organization_id_safe() OR
  user_id = auth.uid()
);

-- Step 9: Create audit log cleanup function (for data retention)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.security_audit_log 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep
    AND severity IN ('debug', 'info');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create audit log summary view
CREATE OR REPLACE VIEW audit_log_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    action,
    severity,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT organization_id) as unique_organizations
FROM public.security_audit_log
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), action, severity
ORDER BY date DESC, event_count DESC;

-- Step 11: Show success message
DO $$ 
BEGIN
    RAISE NOTICE 'AUDIT LOGGING SYSTEM CREATED SUCCESSFULLY';
    RAISE NOTICE 'Security audit log table created with comprehensive tracking';
    RAISE NOTICE 'Audit trigger function created for automatic logging';
    RAISE NOTICE 'Custom logging functions available for manual events';
    RAISE NOTICE 'RLS policies applied for secure access';
    RAISE NOTICE 'Cleanup function created for data retention management';
END $$;






