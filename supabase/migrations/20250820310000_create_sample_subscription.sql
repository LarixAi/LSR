-- Create a sample subscription for testing
-- First, get the first organization ID
DO $$
DECLARE
    org_id UUID;
    plan_id UUID;
BEGIN
    -- Get the first organization
    SELECT id INTO org_id FROM public.organizations LIMIT 1;
    
    -- Get the professional plan
    SELECT id INTO plan_id FROM public.subscription_plans WHERE name = 'Professional' AND billing_cycle = 'monthly' LIMIT 1;
    
    -- Create a sample subscription if organization exists
    IF org_id IS NOT NULL AND plan_id IS NOT NULL THEN
        INSERT INTO public.subscriptions (
            organization_id,
            plan_id,
            status,
            start_date,
            end_date,
            next_billing_date,
            amount,
            auto_renew,
            created_at,
            updated_at
        ) VALUES (
            org_id,
            plan_id,
            'active',
            NOW(),
            NOW() + INTERVAL '1 month',
            NOW() + INTERVAL '1 month',
            79.00,
            true,
            NOW(),
            NOW()
        );
        
        -- Create sample billing history
        INSERT INTO public.billing_history (
            organization_id,
            subscription_id,
            date,
            amount,
            status,
            description,
            payment_method,
            tax_amount,
            discount_amount,
            created_at
        ) VALUES (
            org_id,
            (SELECT id FROM public.subscriptions WHERE organization_id = org_id LIMIT 1),
            NOW(),
            79.00,
            'paid',
            'Professional Plan - Monthly',
            'Card ending in 1234',
            15.80,
            0,
            NOW()
        );
        
        -- Create sample usage data
        INSERT INTO public.usage_data (
            organization_id,
            date,
            drivers,
            vehicles,
            storage,
            api_calls,
            created_at
        ) VALUES (
            org_id,
            CURRENT_DATE,
            12,
            25,
            45.5,
            2500,
            NOW()
        );
        
        RAISE NOTICE 'Sample subscription created for organization: %', org_id;
    ELSE
        RAISE NOTICE 'No organization or plan found to create sample subscription';
    END IF;
END $$;

