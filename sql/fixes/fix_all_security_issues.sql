-- Fix all security issues with trial management system
-- Run this in Supabase SQL Editor to fix security concerns

-- 1. Fix trial_summary view security
DROP VIEW IF EXISTS trial_summary;

CREATE OR REPLACE VIEW trial_summary 
WITH (security_invoker = true) AS
SELECT 
    ot.organization_id,
    o.name as organization_name,
    ot.trial_status,
    ot.trial_start_date,
    ot.trial_end_date,
    ot.max_drivers,
    ot.features,
    CASE 
        WHEN ot.trial_status = 'active' THEN 
            GREATEST(0, EXTRACT(DAY FROM (ot.trial_end_date - NOW())))
        ELSE 0
    END as days_left,
    COUNT(p.id) as current_drivers
FROM organization_trials ot
JOIN organizations o ON ot.organization_id = o.id
LEFT JOIN profiles p ON ot.organization_id = p.organization_id AND p.role = 'driver'
GROUP BY ot.id, o.name;

-- 2. Ensure RLS is enabled on all trial tables
ALTER TABLE organization_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_usage ENABLE ROW LEVEL SECURITY;

-- 3. Drop and recreate RLS policies to ensure they're correct
-- organization_trials policies
DROP POLICY IF EXISTS "Users can view their organization trials" ON organization_trials;
DROP POLICY IF EXISTS "Users can insert their organization trials" ON organization_trials;
DROP POLICY IF EXISTS "Users can update their organization trials" ON organization_trials;
DROP POLICY IF EXISTS "Users can delete their organization trials" ON organization_trials;

CREATE POLICY "Users can view their organization trials" ON organization_trials
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert their organization trials" ON organization_trials
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update their organization trials" ON organization_trials
    FOR UPDATE USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can delete their organization trials" ON organization_trials
    FOR DELETE USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- organization_subscriptions policies
DROP POLICY IF EXISTS "Users can view their organization subscriptions" ON organization_subscriptions;
DROP POLICY IF EXISTS "Users can insert their organization subscriptions" ON organization_subscriptions;
DROP POLICY IF EXISTS "Users can update their organization subscriptions" ON organization_subscriptions;
DROP POLICY IF EXISTS "Users can delete their organization subscriptions" ON organization_subscriptions;

CREATE POLICY "Users can view their organization subscriptions" ON organization_subscriptions
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert their organization subscriptions" ON organization_subscriptions
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update their organization subscriptions" ON organization_subscriptions
    FOR UPDATE USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can delete their organization subscriptions" ON organization_subscriptions
    FOR DELETE USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- organization_usage policies
DROP POLICY IF EXISTS "Users can view their organization usage" ON organization_usage;
DROP POLICY IF EXISTS "Users can insert their organization usage" ON organization_usage;
DROP POLICY IF EXISTS "Users can update their organization usage" ON organization_usage;
DROP POLICY IF EXISTS "Users can delete their organization usage" ON organization_usage;

CREATE POLICY "Users can view their organization usage" ON organization_usage
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert their organization usage" ON organization_usage
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update their organization usage" ON organization_usage
    FOR UPDATE USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can delete their organization usage" ON organization_usage
    FOR DELETE USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- 4. Grant permissions
GRANT SELECT ON trial_summary TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_trials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_usage TO authenticated;

-- 5. Verify security settings
SELECT 
    'trial_summary view' as object_name,
    schemaname,
    viewname,
    'SECURITY INVOKER' as security_type
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'trial_summary'

UNION ALL

SELECT 
    'organization_trials table' as object_name,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN 'RLS ENABLED'
        ELSE 'RLS DISABLED'
    END as security_type
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'organization_trials'

UNION ALL

SELECT 
    'organization_subscriptions table' as object_name,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN 'RLS ENABLED'
        ELSE 'RLS DISABLED'
    END as security_type
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'organization_subscriptions'

UNION ALL

SELECT 
    'organization_usage table' as object_name,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN 'RLS ENABLED'
        ELSE 'RLS DISABLED'
    END as security_type
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'organization_usage';

-- 6. Test the view
SELECT 'Testing trial_summary view...' as test_message;
SELECT COUNT(*) as record_count FROM trial_summary;
