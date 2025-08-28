-- SECURITY FIXES PHASE 2: Fix remaining functions with missing search_path

-- Fix all remaining functions that need search_path settings
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
 RETURNS character varying
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    work_order_num VARCHAR(50);
    current_year VARCHAR(4);
    sequence_num INTEGER;
BEGIN
    current_year := TO_CHAR(NOW(), 'YYYY');
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(work_order_number FROM 12) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.defect_reports
    WHERE work_order_number LIKE 'WO-' || current_year || '-%';
    
    work_order_num := 'WO-' || current_year || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN work_order_num;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
 RETURNS character varying
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    invoice_num VARCHAR(50);
    current_year VARCHAR(4);
    sequence_num INTEGER;
BEGIN
    current_year := TO_CHAR(NOW(), 'YYYY');
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 12) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.repair_invoices
    WHERE invoice_number LIKE 'INV-' || current_year || '-%';
    
    invoice_num := 'INV-' || current_year || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN invoice_num;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_work_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    -- Only set work order number if not already set and status is being changed to 'repairing'
    IF NEW.work_order_number IS NULL AND NEW.status = 'repairing' THEN
        NEW.work_order_number := public.generate_work_order_number();
        NEW.start_date := NOW();
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_invoice_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    -- Only set invoice number if not already set
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := public.generate_invoice_number();
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_mechanic_organization_preferences(org_uuid uuid, new_preferences jsonb DEFAULT NULL::jsonb, new_notification_settings jsonb DEFAULT NULL::jsonb, new_ui_settings jsonb DEFAULT NULL::jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    INSERT INTO public.mechanic_organization_preferences (
        mechanic_id, 
        organization_id, 
        preferences, 
        notification_settings, 
        ui_settings
    ) VALUES (
        auth.uid(),
        org_uuid,
        COALESCE(new_preferences, '{}'::jsonb),
        COALESCE(new_notification_settings, '{}'::jsonb),
        COALESCE(new_ui_settings, '{}'::jsonb)
    )
    ON CONFLICT (mechanic_id, organization_id) 
    DO UPDATE SET
        preferences = COALESCE(new_preferences, mechanic_organization_preferences.preferences),
        notification_settings = COALESCE(new_notification_settings, mechanic_organization_preferences.notification_settings),
        ui_settings = COALESCE(new_ui_settings, mechanic_organization_preferences.ui_settings),
        updated_at = NOW();
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.expire_trials()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
    UPDATE organization_trials
    SET trial_status = 'expired'
    WHERE trial_status = 'active'
    AND trial_end_date < NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_driver_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
    current_drivers INTEGER;
    max_drivers INTEGER;
    trial_status TEXT;
    subscription_status TEXT;
BEGIN
    -- Get current driver count for the organization
    SELECT COUNT(*) INTO current_drivers
    FROM profiles
    WHERE organization_id = NEW.organization_id AND role = 'driver';
    
    -- Check trial status
    SELECT trial_status, max_drivers INTO trial_status, max_drivers
    FROM organization_trials
    WHERE organization_id = NEW.organization_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Check subscription status
    SELECT status INTO subscription_status
    FROM organization_subscriptions
    WHERE organization_id = NEW.organization_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If no trial or subscription found, allow (for initial setup)
    IF trial_status IS NULL AND subscription_status IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- If trial is active, check trial limits
    IF trial_status = 'active' THEN
        IF current_drivers >= max_drivers THEN
            RAISE EXCEPTION 'Driver limit reached for trial. Maximum % drivers allowed.', max_drivers;
        END IF;
    END IF;
    
    -- If subscription is active, check subscription limits
    IF subscription_status = 'active' THEN
        -- Get plan limits based on subscription plan_id
        -- This would need to be implemented based on your plan structure
        -- For now, we'll allow it
        RETURN NEW;
    END IF;
    
    -- If trial expired and no active subscription, block
    IF trial_status = 'expired' AND (subscription_status IS NULL OR subscription_status != 'active') THEN
        RAISE EXCEPTION 'Trial has expired. Please upgrade to continue adding drivers.';
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.complete_work_order(p_defect_id uuid, p_mechanic_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    invoice_id UUID;
BEGIN
    -- Update defect report status to 'resolved'
    UPDATE public.defect_reports 
    SET 
        status = 'resolved',
        completion_date = NOW(),
        updated_at = NOW()
    WHERE id = p_defect_id;
    
    -- Complete all remaining stages
    UPDATE public.work_order_stages 
    SET 
        status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
    WHERE defect_id = p_defect_id 
    AND status IN ('pending', 'in_progress');
    
    -- Create invoice if not exists
    INSERT INTO public.repair_invoices (
        defect_id,
        labor_hours,
        labor_rate,
        labor_total,
        parts_total,
        total_amount,
        status,
        created_by
    )
    SELECT 
        p_defect_id,
        dr.actual_hours,
        75.00, -- Default labor rate
        dr.actual_hours * 75.00,
        COALESCE(SUM(pr.total_cost), 0),
        (dr.actual_hours * 75.00) + COALESCE(SUM(pr.total_cost), 0),
        'draft',
        p_mechanic_id
    FROM public.defect_reports dr
    LEFT JOIN public.parts_requests pr ON dr.id = pr.defect_id AND pr.status = 'installed'
    WHERE dr.id = p_defect_id
    GROUP BY dr.id, dr.actual_hours
    ON CONFLICT (defect_id) DO NOTHING;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_part_quantity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    -- Update the part quantity based on movement type
    IF NEW.movement_type = 'stock_in' THEN
        UPDATE public.parts_inventory 
        SET quantity = quantity + NEW.quantity,
            status = CASE 
                WHEN quantity + NEW.quantity > min_quantity THEN 'in_stock'
                WHEN quantity + NEW.quantity > 0 THEN 'low_stock'
                ELSE 'out_of_stock'
            END,
            updated_at = NOW()
        WHERE id = NEW.part_id;
    ELSIF NEW.movement_type = 'stock_out' THEN
        UPDATE public.parts_inventory 
        SET quantity = quantity - NEW.quantity,
            status = CASE 
                WHEN quantity - NEW.quantity > min_quantity THEN 'in_stock'
                WHEN quantity - NEW.quantity > 0 THEN 'low_stock'
                ELSE 'out_of_stock'
            END,
            updated_at = NOW()
        WHERE id = NEW.part_id;
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_movement_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    NEW.movement_number := 'MOV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('movement_sequence') AS TEXT), 4, '0');
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('order_sequence') AS TEXT), 4, '0');
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_approval_needed(p_organization_id uuid, p_part_id uuid, p_quantity integer, p_request_type character varying)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    part_record RECORD;
    approval_threshold INTEGER;
BEGIN
    -- Get part details
    SELECT * INTO part_record FROM public.parts_inventory WHERE id = p_part_id;
    
    -- Get organization's approval threshold (default to 100 if not set)
    SELECT COALESCE(approval_threshold, 100) INTO approval_threshold 
    FROM public.organizations WHERE id = p_organization_id;
    
    -- Check if approval is needed based on request type and quantity
    IF p_request_type = 'quantity_increase' AND p_quantity > approval_threshold THEN
        RETURN TRUE;
    ELSIF p_request_type = 'new_part' AND p_quantity > approval_threshold THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_inventory_alert(p_organization_id uuid, p_part_id uuid, p_alert_type character varying, p_title character varying, p_message text, p_severity character varying DEFAULT 'medium'::character varying)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO public.inventory_alerts (
        organization_id, part_id, alert_type, title, message, severity
    ) VALUES (
        p_organization_id, p_part_id, p_alert_type, p_title, p_message, p_severity
    ) RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$function$;