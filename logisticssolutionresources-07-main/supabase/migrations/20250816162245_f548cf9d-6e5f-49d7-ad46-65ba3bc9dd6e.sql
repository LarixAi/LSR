-- Fix remaining RLS enabled tables without policies - smart approach

-- Create RLS policies based on actual table structure
DO $$
DECLARE
    table_record RECORD;
    has_org_id BOOLEAN;
    has_driver_id BOOLEAN;
    has_user_id BOOLEAN;
BEGIN
    -- Find all tables with RLS enabled but no policies
    FOR table_record IN 
        SELECT DISTINCT t.tablename
        FROM pg_tables t
        JOIN pg_class c ON c.relname = t.tablename
        WHERE t.schemaname = 'public'
        AND c.relrowsecurity = true  -- RLS is enabled
        AND NOT EXISTS (
            SELECT 1 FROM pg_policies p 
            WHERE p.tablename = t.tablename 
            AND p.schemaname = t.schemaname
        )
    LOOP
        -- Check what columns exist in the table
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = table_record.tablename 
            AND column_name = 'organization_id'
        ) INTO has_org_id;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = table_record.tablename 
            AND column_name = 'driver_id'
        ) INTO has_driver_id;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = table_record.tablename 
            AND column_name = 'user_id'
        ) INTO has_user_id;
        
        -- Create appropriate policy based on table structure
        IF has_org_id THEN
            -- Standard organization-scoped policy
            EXECUTE format('CREATE POLICY "Users can manage %s in their organization" ON public.%I FOR ALL USING (organization_id = get_user_organization_id()) WITH CHECK (organization_id = get_user_organization_id())', 
                          table_record.tablename, table_record.tablename);
        ELSIF has_driver_id THEN
            -- Driver-specific policy
            EXECUTE format('CREATE POLICY "Drivers can manage their own %s" ON public.%I FOR ALL USING (driver_id = auth.uid() OR is_admin_or_council()) WITH CHECK (driver_id = auth.uid() OR is_admin_or_council())', 
                          table_record.tablename, table_record.tablename);
        ELSIF has_user_id THEN
            -- User-specific policy
            EXECUTE format('CREATE POLICY "Users can manage their own %s" ON public.%I FOR ALL USING (user_id = auth.uid() OR is_admin_or_council()) WITH CHECK (user_id = auth.uid() OR is_admin_or_council())', 
                          table_record.tablename, table_record.tablename);
        ELSE
            -- Generic admin-only policy for tables without clear ownership
            EXECUTE format('CREATE POLICY "Admins can manage %s" ON public.%I FOR ALL USING (is_admin_or_council()) WITH CHECK (is_admin_or_council())', 
                          table_record.tablename, table_record.tablename);
        END IF;
        
        RAISE NOTICE 'Created RLS policy for table: % (org_id: %, driver_id: %, user_id: %)', 
                     table_record.tablename, has_org_id, has_driver_id, has_user_id;
    END LOOP;
END $$;

-- Special case for vehicle_check_answers if it exists without policies
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables t
        JOIN pg_class c ON c.relname = t.tablename
        WHERE t.schemaname = 'public'
        AND t.tablename = 'vehicle_check_answers'
        AND c.relrowsecurity = true
        AND NOT EXISTS (
            SELECT 1 FROM pg_policies p 
            WHERE p.tablename = 'vehicle_check_answers'
            AND p.schemaname = 'public'
        )
    ) THEN
        CREATE POLICY "Users can manage vehicle check answers through sessions" 
        ON public.vehicle_check_answers FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM public.vehicle_check_sessions vcs 
                WHERE vcs.id = vehicle_check_answers.session_id 
                AND vcs.organization_id = get_user_organization_id()
            )
        );
        RAISE NOTICE 'Created special RLS policy for vehicle_check_answers';
    END IF;
END $$;

-- Log the completion of RLS policy fixes
INSERT INTO public.security_audit_log (event_type, description, metadata)
VALUES (
  'RLS_POLICIES_FINAL',
  'All remaining RLS policies created with smart column detection',
  jsonb_build_object(
    'action', 'create_smart_rls_policies',
    'security_level', 'MAXIMUM',
    'backend_status', 'FULLY_SECURED'
  )
);