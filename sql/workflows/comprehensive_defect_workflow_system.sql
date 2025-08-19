-- =====================================================
-- COMPREHENSIVE DEFECT WORKFLOW SYSTEM
-- =====================================================
-- This system implements a complete defect management workflow
-- following automotive industry best practices

-- 1. ENHANCE EXISTING DEFECT_REPORTS TABLE
-- Add workflow-specific fields to defect_reports
ALTER TABLE public.defect_reports 
ADD COLUMN IF NOT EXISTS work_order_number VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS assigned_mechanic_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS work_notes TEXT,
ADD COLUMN IF NOT EXISTS customer_approval_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS customer_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS customer_approval_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS customer_approval_notes TEXT;

-- 2. CREATE WORK ORDER STAGES TABLE
CREATE TABLE IF NOT EXISTS public.work_order_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID NOT NULL REFERENCES public.defect_reports(id) ON DELETE CASCADE,
    stage_name VARCHAR(50) NOT NULL,
    stage_order INTEGER NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')) DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    mechanic_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE PARTS REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.parts_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID NOT NULL REFERENCES public.defect_reports(id) ON DELETE CASCADE,
    part_name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    supplier VARCHAR(255),
    supplier_contact TEXT,
    status VARCHAR(20) CHECK (status IN ('requested', 'ordered', 'received', 'installed', 'cancelled')) DEFAULT 'requested',
    requested_by UUID REFERENCES public.profiles(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ordered_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE,
    installed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE REPAIR INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.repair_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID NOT NULL REFERENCES public.defect_reports(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    labor_hours DECIMAL(5,2) DEFAULT 0,
    labor_rate DECIMAL(10,2) DEFAULT 0,
    labor_total DECIMAL(10,2) DEFAULT 0,
    parts_total DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
    payment_terms VARCHAR(100),
    due_date TIMESTAMP WITH TIME ZONE,
    paid_date TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE REPAIR PHOTOS TABLE
CREATE TABLE IF NOT EXISTS public.repair_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID NOT NULL REFERENCES public.defect_reports(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    photo_type VARCHAR(50) CHECK (photo_type IN ('before', 'during', 'after', 'parts', 'damage', 'other')),
    description TEXT,
    uploaded_by UUID REFERENCES public.profiles(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE REPAIR TIME LOGS TABLE
CREATE TABLE IF NOT EXISTS public.repair_time_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID NOT NULL REFERENCES public.defect_reports(id) ON DELETE CASCADE,
    mechanic_id UUID NOT NULL REFERENCES public.profiles(id),
    activity_type VARCHAR(50) CHECK (activity_type IN ('diagnosis', 'repair', 'testing', 'documentation', 'other')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CREATE CUSTOMER COMMUNICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.customer_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID NOT NULL REFERENCES public.defect_reports(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) CHECK (communication_type IN ('phone', 'email', 'sms', 'in_person', 'other')),
    direction VARCHAR(10) CHECK (direction IN ('inbound', 'outbound')),
    subject VARCHAR(255),
    message TEXT,
    contact_person VARCHAR(255),
    contact_method VARCHAR(100),
    communication_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    mechanic_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CREATE WORKFLOW TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) NOT NULL,
    defect_type VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CREATE WORKFLOW TEMPLATE STAGES TABLE
CREATE TABLE IF NOT EXISTS public.workflow_template_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
    stage_name VARCHAR(100) NOT NULL,
    stage_order INTEGER NOT NULL,
    stage_description TEXT,
    estimated_duration_minutes INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. CREATE FUNCTION TO GENERATE WORK ORDER NUMBERS
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
RETURNS VARCHAR(50)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- 11. CREATE FUNCTION TO GENERATE INVOICE NUMBERS
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS VARCHAR(50)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- 12. CREATE TRIGGER TO AUTO-GENERATE WORK ORDER NUMBERS
CREATE OR REPLACE FUNCTION public.set_work_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Only set work order number if not already set and status is being changed to 'repairing'
    IF NEW.work_order_number IS NULL AND NEW.status = 'repairing' THEN
        NEW.work_order_number := public.generate_work_order_number();
        NEW.start_date := NOW();
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_work_order_number
    BEFORE UPDATE ON public.defect_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.set_work_order_number();

-- 13. CREATE TRIGGER TO AUTO-GENERATE INVOICE NUMBERS
CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Only set invoice number if not already set
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := public.generate_invoice_number();
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_invoice_number
    BEFORE INSERT ON public.repair_invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.set_invoice_number();

-- 14. ENABLE RLS ON ALL NEW TABLES
ALTER TABLE public.work_order_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_template_stages ENABLE ROW LEVEL SECURITY;

-- 15. CREATE RLS POLICIES FOR WORK ORDER STAGES
CREATE POLICY "Mechanics can manage work order stages" ON public.work_order_stages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.defect_reports dr
            JOIN public.profiles p ON dr.organization_id = p.organization_id
            WHERE dr.id = work_order_stages.defect_id
            AND p.id = auth.uid()
            AND p.role IN ('mechanic', 'admin', 'council')
        )
    );

-- 16. CREATE RLS POLICIES FOR PARTS REQUESTS
CREATE POLICY "Mechanics can manage parts requests" ON public.parts_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.defect_reports dr
            JOIN public.profiles p ON dr.organization_id = p.organization_id
            WHERE dr.id = parts_requests.defect_id
            AND p.id = auth.uid()
            AND p.role IN ('mechanic', 'admin', 'council')
        )
    );

-- 17. CREATE RLS POLICIES FOR REPAIR INVOICES
CREATE POLICY "Mechanics can manage repair invoices" ON public.repair_invoices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.defect_reports dr
            JOIN public.profiles p ON dr.organization_id = p.organization_id
            WHERE dr.id = repair_invoices.defect_id
            AND p.id = auth.uid()
            AND p.role IN ('mechanic', 'admin', 'council')
        )
    );

-- 18. CREATE RLS POLICIES FOR REPAIR PHOTOS
CREATE POLICY "Mechanics can manage repair photos" ON public.repair_photos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.defect_reports dr
            JOIN public.profiles p ON dr.organization_id = p.organization_id
            WHERE dr.id = repair_photos.defect_id
            AND p.id = auth.uid()
            AND p.role IN ('mechanic', 'admin', 'council')
        )
    );

-- 19. CREATE RLS POLICIES FOR REPAIR TIME LOGS
CREATE POLICY "Mechanics can manage repair time logs" ON public.repair_time_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.defect_reports dr
            JOIN public.profiles p ON dr.organization_id = p.organization_id
            WHERE dr.id = repair_time_logs.defect_id
            AND p.id = auth.uid()
            AND p.role IN ('mechanic', 'admin', 'council')
        )
    );

-- 20. CREATE RLS POLICIES FOR CUSTOMER COMMUNICATIONS
CREATE POLICY "Mechanics can manage customer communications" ON public.customer_communications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.defect_reports dr
            JOIN public.profiles p ON dr.organization_id = p.organization_id
            WHERE dr.id = customer_communications.defect_id
            AND p.id = auth.uid()
            AND p.role IN ('mechanic', 'admin', 'council')
        )
    );

-- 21. CREATE RLS POLICIES FOR WORKFLOW TEMPLATES
CREATE POLICY "Mechanics can view workflow templates" ON public.workflow_templates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('mechanic', 'admin', 'council')
        )
    );

CREATE POLICY "Admins can manage workflow templates" ON public.workflow_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'council')
        )
    );

-- 22. CREATE RLS POLICIES FOR WORKFLOW TEMPLATE STAGES
CREATE POLICY "Mechanics can view workflow template stages" ON public.workflow_template_stages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('mechanic', 'admin', 'council')
        )
    );

CREATE POLICY "Admins can manage workflow template stages" ON public.workflow_template_stages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'council')
        )
    );

-- 23. INSERT DEFAULT WORKFLOW TEMPLATES
INSERT INTO public.workflow_templates (template_name, defect_type, description, created_by) VALUES
('Standard Mechanical Repair', 'mechanical', 'Standard workflow for mechanical repairs', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),
('Electrical System Repair', 'electrical', 'Workflow for electrical system diagnostics and repair', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),
('Safety System Inspection', 'safety', 'Comprehensive safety system inspection and repair', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),
('Cosmetic Repair', 'cosmetic', 'Workflow for cosmetic repairs and bodywork', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1));

-- 24. INSERT DEFAULT WORKFLOW STAGES FOR MECHANICAL REPAIRS
INSERT INTO public.workflow_template_stages (template_id, stage_name, stage_order, stage_description, estimated_duration_minutes, is_required, requires_approval) 
SELECT 
    wt.id,
    stage_name,
    stage_order,
    stage_description,
    estimated_duration_minutes,
    is_required,
    requires_approval
FROM (
    VALUES 
    ('Initial Assessment', 1, 'Initial visual inspection and problem identification', 30, TRUE, FALSE),
    ('Diagnostic Testing', 2, 'Perform diagnostic tests to confirm the issue', 60, TRUE, FALSE),
    ('Customer Approval', 3, 'Present findings to customer and get approval', 15, TRUE, TRUE),
    ('Parts Ordering', 4, 'Order required parts from suppliers', 30, FALSE, FALSE),
    ('Parts Receipt', 5, 'Receive and verify ordered parts', 15, FALSE, FALSE),
    ('Repair Execution', 6, 'Perform the actual repair work', 120, TRUE, FALSE),
    ('Quality Testing', 7, 'Test the repair to ensure it works correctly', 45, TRUE, FALSE),
    ('Final Inspection', 8, 'Final inspection and documentation', 30, TRUE, FALSE),
    ('Customer Handover', 9, 'Present completed work to customer', 15, TRUE, FALSE),
    ('Invoice Generation', 10, 'Generate and send invoice to customer', 15, TRUE, FALSE)
) AS stages(stage_name, stage_order, stage_description, estimated_duration_minutes, is_required, requires_approval)
CROSS JOIN public.workflow_templates wt
WHERE wt.template_name = 'Standard Mechanical Repair';

-- 25. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_defect_reports_work_order_number ON public.defect_reports(work_order_number);
CREATE INDEX IF NOT EXISTS idx_defect_reports_assigned_mechanic ON public.defect_reports(assigned_mechanic_id);
CREATE INDEX IF NOT EXISTS idx_defect_reports_status ON public.defect_reports(status);
CREATE INDEX IF NOT EXISTS idx_work_order_stages_defect_id ON public.work_order_stages(defect_id);
CREATE INDEX IF NOT EXISTS idx_parts_requests_defect_id ON public.parts_requests(defect_id);
CREATE INDEX IF NOT EXISTS idx_repair_invoices_defect_id ON public.repair_invoices(defect_id);
CREATE INDEX IF NOT EXISTS idx_repair_photos_defect_id ON public.repair_photos(defect_id);
CREATE INDEX IF NOT EXISTS idx_repair_time_logs_defect_id ON public.repair_time_logs(defect_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_defect_id ON public.customer_communications(defect_id);

-- 26. CREATE VIEW FOR WORK ORDER SUMMARY
CREATE OR REPLACE VIEW public.work_order_summary AS
SELECT 
    dr.id,
    dr.defect_number,
    dr.work_order_number,
    dr.title,
    dr.status,
    dr.priority,
    dr.assigned_mechanic_id,
    p.first_name || ' ' || p.last_name as mechanic_name,
    dr.estimated_hours,
    dr.actual_hours,
    dr.estimated_cost,
    dr.actual_cost,
    dr.start_date,
    dr.completion_date,
    COUNT(wos.id) as total_stages,
    COUNT(CASE WHEN wos.status = 'completed' THEN 1 END) as completed_stages,
    COUNT(pr.id) as total_parts_requests,
    COUNT(CASE WHEN pr.status = 'received' THEN 1 END) as received_parts,
    SUM(pr.total_cost) as total_parts_cost,
    ri.invoice_number,
    ri.total_amount as invoice_total,
    ri.status as invoice_status,
    dr.organization_id,
    o.name as organization_name,
    dr.created_at,
    dr.updated_at
FROM public.defect_reports dr
LEFT JOIN public.profiles p ON dr.assigned_mechanic_id = p.id
LEFT JOIN public.work_order_stages wos ON dr.id = wos.defect_id
LEFT JOIN public.parts_requests pr ON dr.id = pr.defect_id
LEFT JOIN public.repair_invoices ri ON dr.id = ri.defect_id
LEFT JOIN public.organizations o ON dr.organization_id = o.id
GROUP BY 
    dr.id, dr.defect_number, dr.work_order_number, dr.title, dr.status, dr.priority,
    dr.assigned_mechanic_id, p.first_name, p.last_name, dr.estimated_hours, dr.actual_hours,
    dr.estimated_cost, dr.actual_cost, dr.start_date, dr.completion_date,
    ri.invoice_number, ri.total_amount, ri.status, dr.organization_id, o.name,
    dr.created_at, dr.updated_at;

-- 27. CREATE FUNCTION TO START WORK ORDER
CREATE OR REPLACE FUNCTION public.start_work_order(p_defect_id UUID, p_mechanic_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    template_id UUID;
    stage_record RECORD;
BEGIN
    -- Update defect report status to 'repairing' and assign mechanic
    UPDATE public.defect_reports 
    SET 
        status = 'repairing',
        assigned_mechanic_id = p_mechanic_id,
        start_date = NOW(),
        updated_at = NOW()
    WHERE id = p_defect_id;
    
    -- Get the appropriate workflow template based on defect type
    SELECT id INTO template_id
    FROM public.workflow_templates wt
    JOIN public.defect_reports dr ON wt.defect_type = dr.defect_type
    WHERE dr.id = p_defect_id
    AND wt.is_active = TRUE
    LIMIT 1;
    
    -- If no specific template found, use the mechanical repair template
    IF template_id IS NULL THEN
        SELECT id INTO template_id
        FROM public.workflow_templates
        WHERE template_name = 'Standard Mechanical Repair'
        AND is_active = TRUE
        LIMIT 1;
    END IF;
    
    -- Create work order stages from template
    FOR stage_record IN 
        SELECT * FROM public.workflow_template_stages
        WHERE template_id = template_id
        ORDER BY stage_order
    LOOP
        INSERT INTO public.work_order_stages (
            defect_id,
            stage_name,
            stage_order,
            status,
            notes
        ) VALUES (
            p_defect_id,
            stage_record.stage_name,
            stage_record.stage_order,
            'pending',
            stage_record.stage_description
        );
    END LOOP;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- 28. CREATE FUNCTION TO COMPLETE WORK ORDER
CREATE OR REPLACE FUNCTION public.complete_work_order(p_defect_id UUID, p_mechanic_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- 29. CREATE FUNCTION TO LOG REPAIR TIME
CREATE OR REPLACE FUNCTION public.log_repair_time(
    p_defect_id UUID,
    p_mechanic_id UUID,
    p_activity_type VARCHAR(50),
    p_description TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.repair_time_logs (
        defect_id,
        mechanic_id,
        activity_type,
        start_time,
        description
    ) VALUES (
        p_defect_id,
        p_mechanic_id,
        p_activity_type,
        NOW(),
        p_description
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- 30. CREATE FUNCTION TO END REPAIR TIME LOG
CREATE OR REPLACE FUNCTION public.end_repair_time_log(
    p_defect_id UUID,
    p_mechanic_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.repair_time_logs 
    SET 
        end_time = NOW(),
        duration_minutes = EXTRACT(EPOCH FROM (NOW() - start_time)) / 60
    WHERE defect_id = p_defect_id 
    AND mechanic_id = p_mechanic_id 
    AND end_time IS NULL;
    
    -- Update total actual hours on defect report
    UPDATE public.defect_reports 
    SET actual_hours = (
        SELECT COALESCE(SUM(duration_minutes), 0) / 60.0
        FROM public.repair_time_logs
        WHERE defect_id = p_defect_id
    )
    WHERE id = p_defect_id;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- 31. GRANT PERMISSIONS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_order_stages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parts_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repair_invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repair_photos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repair_time_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_communications TO authenticated;
GRANT SELECT ON public.workflow_templates TO authenticated;
GRANT SELECT ON public.workflow_template_stages TO authenticated;
GRANT SELECT ON public.work_order_summary TO authenticated;

GRANT EXECUTE ON FUNCTION public.start_work_order(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_work_order(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_repair_time(UUID, UUID, VARCHAR, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_repair_time_log(UUID, UUID) TO authenticated;

-- 32. CREATE SAMPLE DATA FOR TESTING
INSERT INTO public.workflow_templates (template_name, defect_type, description, created_by) VALUES
('Electrical Diagnostic', 'electrical', 'Comprehensive electrical system diagnostic workflow', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert stages for electrical diagnostic
INSERT INTO public.workflow_template_stages (template_id, stage_name, stage_order, stage_description, estimated_duration_minutes, is_required, requires_approval) 
SELECT 
    wt.id,
    stage_name,
    stage_order,
    stage_description,
    estimated_duration_minutes,
    is_required,
    requires_approval
FROM (
    VALUES 
    ('Visual Inspection', 1, 'Initial visual inspection of electrical components', 20, TRUE, FALSE),
    ('Battery Testing', 2, 'Test battery voltage and charging system', 30, TRUE, FALSE),
    ('Circuit Testing', 3, 'Test electrical circuits and connections', 45, TRUE, FALSE),
    ('Component Testing', 4, 'Test individual electrical components', 60, TRUE, FALSE),
    ('Customer Approval', 5, 'Present findings and get customer approval', 15, TRUE, TRUE),
    ('Parts Replacement', 6, 'Replace faulty electrical components', 90, TRUE, FALSE),
    ('System Testing', 7, 'Test the complete electrical system', 30, TRUE, FALSE),
    ('Documentation', 8, 'Document all work performed', 15, TRUE, FALSE)
) AS stages(stage_name, stage_order, stage_description, estimated_duration_minutes, is_required, requires_approval)
CROSS JOIN public.workflow_templates wt
WHERE wt.template_name = 'Electrical Diagnostic'
ON CONFLICT DO NOTHING;

-- 33. FINAL VERIFICATION QUERY
SELECT 
    '=== SYSTEM VERIFICATION ===' as section,
    'Tables Created' as check_type,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'work_order_stages',
    'parts_requests', 
    'repair_invoices',
    'repair_photos',
    'repair_time_logs',
    'customer_communications',
    'workflow_templates',
    'workflow_template_stages'
);

SELECT 
    '=== WORKFLOW TEMPLATES ===' as section,
    'Templates Available' as check_type,
    template_name,
    defect_type,
    is_active
FROM public.workflow_templates
ORDER BY template_name;
