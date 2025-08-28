-- Mobile Authentication Enhancement for TransEntrix

-- Create mobile session tracking table
CREATE TABLE IF NOT EXISTS public.mobile_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_type TEXT NOT NULL CHECK (device_type IN ('ios', 'android')),
    app_type TEXT NOT NULL CHECK (app_type IN ('driver', 'parent')),
    device_token TEXT, -- For push notifications
    last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, device_id)
);

-- Enable RLS on mobile sessions
ALTER TABLE public.mobile_sessions ENABLE ROW LEVEL SECURITY;

-- Create mobile authentication logs table
CREATE TABLE IF NOT EXISTS public.mobile_auth_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    action TEXT NOT NULL, -- login, logout, token_refresh, etc.
    app_type TEXT NOT NULL,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on mobile auth logs
ALTER TABLE public.mobile_auth_logs ENABLE ROW LEVEL SECURITY;

-- Create device verification tokens table for enhanced security
CREATE TABLE IF NOT EXISTS public.device_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    verification_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, device_id)
);

-- Enable RLS on device verification tokens
ALTER TABLE public.device_verification_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mobile_sessions
CREATE POLICY "Users can manage their own mobile sessions"
ON public.mobile_sessions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all mobile sessions in their organization"
ON public.mobile_sessions
FOR SELECT
TO authenticated
USING (
    is_current_user_admin_safe() AND
    EXISTS (
        SELECT 1 FROM public.profiles p1, public.profiles p2
        WHERE p1.id = auth.uid() 
        AND p2.id = mobile_sessions.user_id
        AND p1.organization_id = p2.organization_id
    )
);

-- RLS Policies for mobile_auth_logs
CREATE POLICY "Users can view their own mobile auth logs"
ON public.mobile_auth_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can insert mobile auth logs"
ON public.mobile_auth_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view all mobile auth logs in their organization"
ON public.mobile_auth_logs
FOR SELECT
TO authenticated
USING (
    is_current_user_admin_safe() AND
    EXISTS (
        SELECT 1 FROM public.profiles p1, public.profiles p2
        WHERE p1.id = auth.uid() 
        AND p2.id = mobile_auth_logs.user_id
        AND p1.organization_id = p2.organization_id
    )
);

-- RLS Policies for device_verification_tokens
CREATE POLICY "Users can manage their own device verification tokens"
ON public.device_verification_tokens
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Function to handle mobile session creation/update
CREATE OR REPLACE FUNCTION public.handle_mobile_session(
    p_device_id TEXT,
    p_device_type TEXT,
    p_app_type TEXT,
    p_device_token TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    session_id UUID;
BEGIN
    -- Insert or update mobile session
    INSERT INTO public.mobile_sessions (
        user_id,
        device_id,
        device_type,
        app_type,
        device_token
    ) VALUES (
        auth.uid(),
        p_device_id,
        p_device_type,
        p_app_type,
        p_device_token
    )
    ON CONFLICT (user_id, device_id)
    DO UPDATE SET
        device_type = EXCLUDED.device_type,
        app_type = EXCLUDED.app_type,
        device_token = EXCLUDED.device_token,
        last_active = now(),
        updated_at = now()
    RETURNING id INTO session_id;
    
    -- Log the session event
    INSERT INTO public.mobile_auth_logs (
        user_id,
        device_id,
        action,
        app_type,
        device_info,
        success
    ) VALUES (
        auth.uid(),
        p_device_id,
        'session_created',
        p_app_type,
        jsonb_build_object(
            'device_type', p_device_type,
            'has_token', p_device_token IS NOT NULL
        ),
        true
    );
    
    RETURN session_id;
END;
$$;

-- Function to log mobile authentication events
CREATE OR REPLACE FUNCTION public.log_mobile_auth_event(
    p_device_id TEXT,
    p_action TEXT,
    p_app_type TEXT,
    p_device_info JSONB DEFAULT '{}',
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.mobile_auth_logs (
        user_id,
        device_id,
        action,
        app_type,
        device_info,
        success,
        error_message
    ) VALUES (
        auth.uid(),
        p_device_id,
        p_action,
        p_app_type,
        p_device_info,
        p_success,
        p_error_message
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Function to verify device and user combination
CREATE OR REPLACE FUNCTION public.verify_mobile_device(
    p_device_id TEXT,
    p_app_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if device exists for this user
    RETURN EXISTS (
        SELECT 1 FROM public.mobile_sessions
        WHERE user_id = auth.uid()
        AND device_id = p_device_id
        AND app_type = p_app_type
        AND last_active > now() - INTERVAL '30 days'
    );
END;
$$;

-- Enhanced profiles trigger for mobile app types
CREATE OR REPLACE FUNCTION public.handle_new_user_mobile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_main_admin BOOLEAN;
    target_org_id UUID;
    default_org_id UUID;
    user_role_value TEXT;
    app_type_value TEXT;
BEGIN
    -- Check if this is a main admin email
    is_main_admin := NEW.email IN (
        'transport@transentrix.com',
        'transport@logisticssolutionresources.com', 
        'admin@logisticssolutionresources.com'
    );
    
    -- Get app type from metadata
    app_type_value := COALESCE(NEW.raw_user_meta_data->>'app_type', 'web');
    
    IF is_main_admin THEN
        -- Create organization for admin users
        INSERT INTO organizations (name, slug, contact_email)
        VALUES (
            COALESCE(NEW.raw_user_meta_data->>'company_name', 'Transport Company'),
            LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'company_name', 'transport-company'), ' ', '-')),
            NEW.email
        )
        RETURNING id INTO target_org_id;
    ELSE
        -- Try to get organization_id from metadata
        target_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
        
        -- If no organization_id provided, get or create a default organization
        IF target_org_id IS NULL THEN
            -- Try to find an existing default organization
            SELECT id INTO default_org_id 
            FROM organizations 
            WHERE slug = 'default-transport-company' 
            LIMIT 1;
            
            -- If no default organization exists, create one
            IF default_org_id IS NULL THEN
                INSERT INTO organizations (name, slug, contact_email)
                VALUES (
                    'Default Transport Company',
                    'default-transport-company',
                    'admin@defaulttransport.com'
                )
                RETURNING id INTO default_org_id;
            END IF;
            
            target_org_id := default_org_id;
        END IF;
    END IF;
    
    -- Get the role from metadata, with proper validation for mobile apps
    user_role_value := COALESCE(NEW.raw_user_meta_data->>'role', 
        CASE 
            WHEN app_type_value = 'driver' THEN 'driver'
            WHEN app_type_value = 'parent' THEN 'parent'
            ELSE 'parent'
        END
    );
    
    -- Validate the role exists in the enum
    IF user_role_value NOT IN ('admin', 'driver', 'mechanic', 'parent', 'council', 'compliance_officer') THEN
        user_role_value := CASE 
            WHEN app_type_value = 'driver' THEN 'driver'
            ELSE 'parent'
        END;
    END IF;
    
    -- Insert profile with organization assignment
    INSERT INTO profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        employment_status,
        onboarding_status,
        is_active,
        organization_id
    ) VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN is_main_admin THEN 'Transport'
            ELSE COALESCE(NEW.raw_user_meta_data->>'first_name', '')
        END,
        CASE 
            WHEN is_main_admin THEN 'Admin'
            ELSE COALESCE(NEW.raw_user_meta_data->>'last_name', '')
        END,
        user_role_value::user_role,
        CASE 
            WHEN is_main_admin THEN 'active'
            WHEN app_type_value IN ('driver', 'parent') THEN 'active'
            ELSE 'applicant'
        END,
        CASE 
            WHEN is_main_admin THEN 'completed'
            WHEN app_type_value IN ('driver', 'parent') THEN 'completed'
            ELSE 'pending'
        END,
        true,
        target_org_id
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and re-raise it
        RAISE LOG 'Error in handle_new_user_mobile: %', SQLERRM;
        RAISE;
END;
$$;

-- Drop old trigger and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_mobile();

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION public.update_mobile_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mobile_sessions_updated_at
    BEFORE UPDATE ON public.mobile_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_mobile_sessions_updated_at();