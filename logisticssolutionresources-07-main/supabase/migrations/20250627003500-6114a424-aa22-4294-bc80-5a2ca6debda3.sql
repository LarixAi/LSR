
-- CRITICAL SECURITY FIX: Fix RLS policy infinite recursion and implement missing policies
-- Fixed version with proper type casting

-- Step 1: Fix profiles table RLS infinite recursion
-- Drop all conflicting policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Step 2: Create secure, non-recursive helper functions
CREATE OR REPLACE FUNCTION public.get_user_role_secure(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    IF user_uuid IS NULL THEN
        RETURN 'parent';
    END IF;
    
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_uuid 
    LIMIT 1;
    
    RETURN COALESCE(user_role, 'parent');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN public.get_user_role_secure(user_uuid) IN ('admin', 'council');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 3: Create clean, non-recursive profiles policies
CREATE POLICY "profiles_own_access" ON public.profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "profiles_admin_access" ON public.profiles
    FOR ALL USING (public.is_admin_user(auth.uid()));

-- Step 4: Fix missing RLS policies on critical tables

-- Enable RLS on all tables that need it
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding_tasks ENABLE ROW LEVEL SECURITY;

-- Admin Actions: Only admins can access
CREATE POLICY "admin_actions_admin_only" ON public.admin_actions
    FOR ALL USING (public.is_admin_user(auth.uid()));

-- Analytics: Admin-only access
CREATE POLICY "analytics_admin_only" ON public.analytics
    FOR ALL USING (public.is_admin_user(auth.uid()));

-- Documents: Users can access their own documents, admins can access all
-- Fixed the type casting issue
CREATE POLICY "documents_owner_access" ON public.documents
    FOR ALL USING (
        -- Users can access documents they uploaded
        auth.uid()::text = public.documents.related_entity_id::text
    );

CREATE POLICY "documents_admin_access" ON public.documents
    FOR ALL USING (public.is_admin_user(auth.uid()));

-- System Logs: Admin-only access for security
CREATE POLICY "system_logs_admin_only" ON public.system_logs
    FOR ALL USING (public.is_admin_user(auth.uid()));

-- User Onboarding Tasks: Users can access their own tasks, admins can access all
CREATE POLICY "user_onboarding_tasks_own_access" ON public.user_onboarding_tasks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "user_onboarding_tasks_admin_access" ON public.user_onboarding_tasks
    FOR ALL USING (public.is_admin_user(auth.uid()));

-- Step 5: Create security audit logging function (referenced in code but missing)
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_event_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.system_logs (user_id, event_type, event_data)
    VALUES (p_user_id, p_event_type, p_event_details);
EXCEPTION
    WHEN OTHERS THEN
        -- Don't let logging failures break the application
        NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create security_audit_logs table for enhanced security logging
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    event_details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_audit_logs_admin_only" ON public.security_audit_logs
    FOR ALL USING (public.is_admin_user(auth.uid()));

-- Step 7: Update the user creation trigger to be more secure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    is_admin_email BOOLEAN := FALSE;
    user_role TEXT := 'parent';
BEGIN
    -- Check if this is a pre-approved admin email
    IF NEW.email IN (
        'transport@transentrix.com',
        'transport@logisticssolutionresources.com',
        'admin@logisticssolutionresources.com'
    ) THEN
        is_admin_email := TRUE;
        user_role := 'admin';
    ELSE
        user_role := COALESCE((NEW.raw_user_meta_data->>'role'), 'parent');
    END IF;
    
    -- Insert profile with secure defaults
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        employment_status,
        onboarding_status
    ) VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN is_admin_email THEN 'Transport'
            ELSE COALESCE(NEW.raw_user_meta_data->>'first_name', '')
        END,
        CASE 
            WHEN is_admin_email THEN 'Admin'
            ELSE COALESCE(NEW.raw_user_meta_data->>'last_name', '')
        END,
        user_role,
        CASE 
            WHEN is_admin_email THEN 'active'
            ELSE 'applicant'
        END,
        CASE 
            WHEN is_admin_email THEN 'completed'
            ELSE 'pending'
        END
    );
    
    -- Log the user creation securely
    PERFORM public.log_security_event(
        NEW.id,
        'user_created',
        jsonb_build_object(
            'email', NEW.email,
            'role', user_role,
            'is_admin', is_admin_email
        )
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't prevent user creation
        PERFORM public.log_security_event(
            NEW.id,
            'user_creation_error',
            jsonb_build_object('error', SQLERRM)
        );
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
