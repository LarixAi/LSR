-- =============================================================================
-- TEST EDGE FUNCTION ACCESS - TEMPORARY FIX
-- This temporarily disables RLS to test Edge Function access
-- =============================================================================

-- Step 1: Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Step 2: Check current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Step 3: TEMPORARILY DISABLE RLS FOR TESTING
-- This allows Edge Functions to work while we debug
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 4: Create a simple test policy that allows all access
-- This is for testing only - will be replaced with proper RLS later
CREATE POLICY "test_allow_all" ON public.profiles
FOR ALL USING (true);

-- Step 5: Verify the change
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Step 6: Test query access
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Step 7: Create security audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    organization_id UUID,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 8: Log the test and show notices
DO $$ 
BEGIN
    INSERT INTO public.security_audit_log (
        user_id,
        organization_id,
        action,
        table_name
    ) VALUES (
        auth.uid(),
        (SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1),
        'EDGE_FUNCTION_TEST_ACCESS_ENABLED',
        'profiles'
    );
    
    RAISE NOTICE 'Edge Function test access enabled - RLS temporarily disabled';
    RAISE NOTICE 'This is for testing only - will be re-enabled with proper policies';
END $$;
