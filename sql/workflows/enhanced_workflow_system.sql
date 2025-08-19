-- =====================================================
-- ENHANCED WORKFLOW SYSTEM - AUTOMOTIVE INDUSTRY BEST PRACTICES
-- =====================================================
-- Based on research of automotive repair industry standards

-- 1. ENHANCE WORKFLOW TEMPLATES WITH MORE COMPREHENSIVE STAGES

-- Update Standard Mechanical Repair with comprehensive stages
DELETE FROM public.workflow_template_stages 
WHERE template_id = (SELECT id FROM public.workflow_templates WHERE template_name = 'Standard Mechanical Repair');

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
    -- PRE-REPAIR PHASE
    ('Initial Assessment', 1, 'Initial visual inspection and problem identification. Check vehicle history and customer concerns.', 30, TRUE, FALSE),
    ('Safety Check', 2, 'Perform safety checks including brakes, steering, and critical systems. Ensure vehicle is safe to work on.', 20, TRUE, FALSE),
    ('Diagnostic Testing', 3, 'Perform comprehensive diagnostic tests using appropriate equipment to confirm the root cause.', 60, TRUE, FALSE),
    ('Parts Identification', 4, 'Identify all required parts, check availability, and determine if OEM or aftermarket parts are needed.', 15, TRUE, FALSE),
    ('Cost Estimation', 5, 'Calculate total repair cost including parts, labor, and any additional services required.', 20, TRUE, FALSE),
    
    -- CUSTOMER APPROVAL PHASE
    ('Customer Communication', 6, 'Present findings to customer, explain the problem, and discuss repair options and costs.', 15, TRUE, TRUE),
    ('Customer Approval', 7, 'Obtain written or verbal approval from customer before proceeding with repairs.', 10, TRUE, TRUE),
    
    -- PARTS MANAGEMENT PHASE
    ('Parts Ordering', 8, 'Order required parts from suppliers. Include part numbers, quantities, and delivery requirements.', 30, FALSE, FALSE),
    ('Parts Receipt & Inspection', 9, 'Receive parts, verify correct items, check for damage, and ensure quality standards.', 15, FALSE, FALSE),
    ('Parts Preparation', 10, 'Prepare parts for installation, clean components, and organize workspace.', 10, FALSE, FALSE),
    
    -- REPAIR EXECUTION PHASE
    ('Workspace Preparation', 11, 'Prepare work area, gather tools, ensure proper lighting and ventilation.', 10, TRUE, FALSE),
    ('Component Removal', 12, 'Safely remove damaged or worn components following manufacturer procedures.', 45, TRUE, FALSE),
    ('Component Inspection', 13, 'Inspect removed components and surrounding areas for additional issues.', 20, TRUE, FALSE),
    ('Component Installation', 14, 'Install new or repaired components following manufacturer specifications and torque requirements.', 60, TRUE, FALSE),
    ('System Assembly', 15, 'Reassemble all related systems and components ensuring proper fit and function.', 30, TRUE, FALSE),
    
    -- QUALITY ASSURANCE PHASE
    ('Functional Testing', 16, 'Test the repaired system to ensure it operates correctly and meets specifications.', 30, TRUE, FALSE),
    ('Road Testing', 17, 'Perform road test to verify repair effectiveness and check for any remaining issues.', 20, TRUE, FALSE),
    ('Final Inspection', 18, 'Complete final inspection of all work performed and verify vehicle safety.', 25, TRUE, FALSE),
    ('Quality Control', 19, 'Review work against quality standards and ensure all procedures were followed.', 15, TRUE, FALSE),
    
    -- COMPLETION PHASE
    ('Documentation', 20, 'Complete all required documentation including work orders, warranty information, and service records.', 15, TRUE, FALSE),
    ('Customer Handover', 21, 'Present completed work to customer, explain what was done, and provide maintenance recommendations.', 20, TRUE, FALSE),
    ('Invoice Generation', 22, 'Generate detailed invoice with breakdown of parts, labor, and any additional charges.', 10, TRUE, FALSE),
    ('Follow-up Scheduling', 23, 'Schedule any necessary follow-up appointments or maintenance reminders.', 5, TRUE, FALSE)
) AS stages(stage_name, stage_order, stage_description, estimated_duration_minutes, is_required, requires_approval)
CROSS JOIN public.workflow_templates wt
WHERE wt.template_name = 'Standard Mechanical Repair';

-- Update Electrical System Repair with comprehensive stages
DELETE FROM public.workflow_template_stages 
WHERE template_id = (SELECT id FROM public.workflow_templates WHERE template_name = 'Electrical System Repair');

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
    -- ELECTRICAL DIAGNOSTIC PHASE
    ('Initial Assessment', 1, 'Initial visual inspection of electrical components and wiring harnesses.', 25, TRUE, FALSE),
    ('Battery Testing', 2, 'Test battery voltage, charging system, and electrical load capacity.', 30, TRUE, FALSE),
    ('Circuit Testing', 3, 'Test electrical circuits, check for shorts, opens, and voltage drops.', 45, TRUE, FALSE),
    ('Component Testing', 4, 'Test individual electrical components using appropriate diagnostic equipment.', 60, TRUE, FALSE),
    ('ECU Diagnostics', 5, 'Connect diagnostic scanner and check for fault codes and system status.', 30, TRUE, FALSE),
    ('Wiring Inspection', 6, 'Inspect wiring harnesses for damage, corrosion, or loose connections.', 40, TRUE, FALSE),
    
    -- CUSTOMER APPROVAL PHASE
    ('Customer Communication', 7, 'Present electrical findings and discuss repair options and costs.', 15, TRUE, TRUE),
    ('Customer Approval', 8, 'Obtain customer approval for electrical repairs and parts replacement.', 10, TRUE, TRUE),
    
    -- ELECTRICAL REPAIR PHASE
    ('Electrical Safety', 9, 'Ensure proper electrical safety procedures and disconnect power sources.', 15, TRUE, FALSE),
    ('Component Replacement', 10, 'Replace faulty electrical components following manufacturer procedures.', 90, TRUE, FALSE),
    ('Wiring Repair', 11, 'Repair or replace damaged wiring and ensure proper connections.', 60, TRUE, FALSE),
    ('System Programming', 12, 'Program or calibrate electrical systems as required by manufacturer.', 45, TRUE, FALSE),
    
    -- TESTING PHASE
    ('Electrical Testing', 13, 'Test all electrical systems and components for proper operation.', 40, TRUE, FALSE),
    ('System Integration', 14, 'Verify all electrical systems work together properly.', 30, TRUE, FALSE),
    ('Final Electrical Check', 15, 'Complete final electrical system check and clear any fault codes.', 25, TRUE, FALSE),
    
    -- COMPLETION PHASE
    ('Documentation', 16, 'Document all electrical work performed and update service records.', 15, TRUE, FALSE),
    ('Customer Handover', 17, 'Explain electrical repairs to customer and provide maintenance tips.', 20, TRUE, FALSE),
    ('Invoice Generation', 18, 'Generate invoice with electrical parts and labor costs.', 10, TRUE, FALSE)
) AS stages(stage_name, stage_order, stage_description, estimated_duration_minutes, is_required, requires_approval)
CROSS JOIN public.workflow_templates wt
WHERE wt.template_name = 'Electrical System Repair';

-- Create Enhanced Safety System Inspection
DELETE FROM public.workflow_template_stages 
WHERE template_id = (SELECT id FROM public.workflow_templates WHERE template_name = 'Safety System Inspection');

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
    -- SAFETY INSPECTION PHASE
    ('Initial Safety Assessment', 1, 'Initial assessment of all safety systems and components.', 30, TRUE, FALSE),
    ('Brake System Inspection', 2, 'Comprehensive brake system inspection including pads, rotors, and hydraulic systems.', 45, TRUE, FALSE),
    ('Steering System Check', 3, 'Inspect steering components, alignment, and steering response.', 30, TRUE, FALSE),
    ('Suspension Inspection', 4, 'Check suspension components, shocks, struts, and wheel bearings.', 40, TRUE, FALSE),
    ('Tire & Wheel Inspection', 5, 'Inspect tires for wear, damage, and proper inflation. Check wheel condition.', 25, TRUE, FALSE),
    ('Lighting System Check', 6, 'Test all exterior and interior lighting systems for proper operation.', 20, TRUE, FALSE),
    ('Safety Equipment Test', 7, 'Test seat belts, airbags, and other safety equipment.', 30, TRUE, FALSE),
    
    -- DIAGNOSTIC PHASE
    ('Safety System Diagnostics', 8, 'Connect diagnostic equipment and check for safety system fault codes.', 35, TRUE, FALSE),
    ('Road Safety Test', 9, 'Perform road test to verify safety system operation under real conditions.', 30, TRUE, FALSE),
    
    -- CUSTOMER APPROVAL PHASE
    ('Safety Report Generation', 10, 'Generate comprehensive safety inspection report with findings.', 20, TRUE, TRUE),
    ('Customer Communication', 11, 'Present safety findings and discuss required repairs or maintenance.', 15, TRUE, TRUE),
    ('Customer Approval', 12, 'Obtain customer approval for any required safety system repairs.', 10, TRUE, TRUE),
    
    -- REPAIR PHASE (if needed)
    ('Safety System Repairs', 13, 'Perform any required safety system repairs or maintenance.', 120, FALSE, FALSE),
    ('Post-Repair Testing', 14, 'Re-test safety systems after repairs to ensure proper operation.', 45, FALSE, FALSE),
    
    -- COMPLETION PHASE
    ('Safety Certification', 15, 'Complete safety certification and documentation requirements.', 15, TRUE, FALSE),
    ('Customer Handover', 16, 'Present safety inspection results and provide maintenance recommendations.', 20, TRUE, FALSE),
    ('Invoice Generation', 17, 'Generate invoice for safety inspection and any repairs performed.', 10, TRUE, FALSE)
) AS stages(stage_name, stage_order, stage_description, estimated_duration_minutes, is_required, requires_approval)
CROSS JOIN public.workflow_templates wt
WHERE wt.template_name = 'Safety System Inspection';

-- Create Enhanced Cosmetic Repair Workflow
DELETE FROM public.workflow_template_stages 
WHERE template_id = (SELECT id FROM public.workflow_templates WHERE template_name = 'Cosmetic Repair');

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
    -- ASSESSMENT PHASE
    ('Initial Assessment', 1, 'Assess cosmetic damage and determine repair approach.', 30, TRUE, FALSE),
    ('Damage Documentation', 2, 'Document damage with photos and detailed notes for insurance or warranty.', 20, TRUE, FALSE),
    ('Paint & Material Matching', 3, 'Match paint colors and materials for seamless repair.', 45, TRUE, FALSE),
    ('Cost Estimation', 4, 'Calculate repair costs including materials, labor, and paint.', 25, TRUE, FALSE),
    
    -- CUSTOMER APPROVAL PHASE
    ('Customer Communication', 5, 'Present cosmetic repair plan and cost estimate to customer.', 15, TRUE, TRUE),
    ('Customer Approval', 6, 'Obtain customer approval for cosmetic repairs.', 10, TRUE, TRUE),
    
    -- PREPARATION PHASE
    ('Surface Preparation', 7, 'Prepare surfaces for repair including cleaning, sanding, and masking.', 60, TRUE, FALSE),
    ('Material Preparation', 8, 'Prepare repair materials, paints, and tools for the job.', 30, TRUE, FALSE),
    
    -- REPAIR PHASE
    ('Body Repair', 9, 'Perform body repairs including dent removal, panel replacement, or welding.', 120, TRUE, FALSE),
    ('Paint Application', 10, 'Apply primer, base coat, and clear coat following manufacturer procedures.', 90, TRUE, FALSE),
    ('Paint Curing', 11, 'Allow paint to cure properly under controlled conditions.', 240, TRUE, FALSE),
    
    -- FINISHING PHASE
    ('Paint Polishing', 12, 'Polish and buff paint to achieve factory finish quality.', 60, TRUE, FALSE),
    ('Final Inspection', 13, 'Inspect completed cosmetic repairs for quality and finish.', 30, TRUE, FALSE),
    ('Quality Control', 14, 'Ensure cosmetic repairs meet quality standards and customer expectations.', 20, TRUE, FALSE),
    
    -- COMPLETION PHASE
    ('Documentation', 15, 'Document all cosmetic work performed and update service records.', 15, TRUE, FALSE),
    ('Customer Handover', 16, 'Present completed cosmetic repairs to customer.', 20, TRUE, FALSE),
    ('Invoice Generation', 17, 'Generate invoice for cosmetic repairs and materials.', 10, TRUE, FALSE)
) AS stages(stage_name, stage_order, stage_description, estimated_duration_minutes, is_required, requires_approval)
CROSS JOIN public.workflow_templates wt
WHERE wt.template_name = 'Cosmetic Repair';

-- 2. CREATE ADDITIONAL SPECIALIZED WORKFLOWS

-- Add Engine Diagnostic Workflow
INSERT INTO public.workflow_templates (template_name, defect_type, description, created_by) VALUES
('Engine Diagnostic & Repair', 'mechanical', 'Comprehensive engine diagnostic and repair workflow', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1))
ON CONFLICT DO NOTHING;

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
    ('Initial Engine Assessment', 1, 'Initial visual and auditory assessment of engine condition.', 30, TRUE, FALSE),
    ('Engine Diagnostic Scan', 2, 'Connect diagnostic scanner and retrieve engine fault codes.', 25, TRUE, FALSE),
    ('Compression Testing', 3, 'Perform engine compression test to assess internal engine condition.', 45, TRUE, FALSE),
    ('Oil Analysis', 4, 'Check oil condition, level, and analyze for contaminants.', 20, TRUE, FALSE),
    ('Cooling System Check', 5, 'Inspect cooling system, hoses, and radiator condition.', 30, TRUE, FALSE),
    ('Fuel System Inspection', 6, 'Check fuel system components and fuel quality.', 35, TRUE, FALSE),
    ('Customer Communication', 7, 'Present engine diagnostic findings and repair options.', 15, TRUE, TRUE),
    ('Customer Approval', 8, 'Obtain customer approval for engine repairs.', 10, TRUE, TRUE),
    ('Engine Disassembly', 9, 'Disassemble engine components as required for repair.', 180, TRUE, FALSE),
    ('Component Repair/Replacement', 10, 'Repair or replace engine components as needed.', 240, TRUE, FALSE),
    ('Engine Reassembly', 11, 'Reassemble engine following manufacturer specifications.', 180, TRUE, FALSE),
    ('Engine Testing', 12, 'Test engine operation and performance after repairs.', 60, TRUE, FALSE),
    ('Road Testing', 13, 'Perform road test to verify engine performance.', 30, TRUE, FALSE),
    ('Final Inspection', 14, 'Complete final engine inspection and quality check.', 25, TRUE, FALSE),
    ('Documentation', 15, 'Document all engine work performed.', 15, TRUE, FALSE),
    ('Customer Handover', 16, 'Present completed engine work to customer.', 20, TRUE, FALSE),
    ('Invoice Generation', 17, 'Generate invoice for engine diagnostic and repairs.', 10, TRUE, FALSE)
) AS stages(stage_name, stage_order, stage_description, estimated_duration_minutes, is_required, requires_approval)
CROSS JOIN public.workflow_templates wt
WHERE wt.template_name = 'Engine Diagnostic & Repair'
ON CONFLICT DO NOTHING;

-- Add Transmission Service Workflow
INSERT INTO public.workflow_templates (template_name, defect_type, description, created_by) VALUES
('Transmission Service & Repair', 'mechanical', 'Transmission diagnostic, service, and repair workflow', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1))
ON CONFLICT DO NOTHING;

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
    ('Initial Assessment', 1, 'Initial assessment of transmission operation and symptoms.', 25, TRUE, FALSE),
    ('Transmission Diagnostic Scan', 2, 'Connect diagnostic scanner and check transmission fault codes.', 30, TRUE, FALSE),
    ('Fluid Level & Condition Check', 3, 'Check transmission fluid level, color, and condition.', 20, TRUE, FALSE),
    ('Road Test', 4, 'Perform road test to assess transmission operation under load.', 45, TRUE, FALSE),
    ('Customer Communication', 5, 'Present transmission findings and service options.', 15, TRUE, TRUE),
    ('Customer Approval', 6, 'Obtain customer approval for transmission service or repair.', 10, TRUE, TRUE),
    ('Fluid Service', 7, 'Perform transmission fluid and filter service if approved.', 90, FALSE, FALSE),
    ('Transmission Removal', 8, 'Remove transmission for internal inspection or repair.', 120, FALSE, FALSE),
    ('Transmission Disassembly', 9, 'Disassemble transmission for internal component inspection.', 180, FALSE, FALSE),
    ('Component Repair/Replacement', 10, 'Repair or replace transmission components as needed.', 240, FALSE, FALSE),
    ('Transmission Reassembly', 11, 'Reassemble transmission following manufacturer specifications.', 180, FALSE, FALSE),
    ('Transmission Installation', 12, 'Install transmission back into vehicle.', 120, FALSE, FALSE),
    ('System Testing', 13, 'Test transmission operation and performance.', 60, TRUE, FALSE),
    ('Final Road Test', 14, 'Perform final road test to verify transmission operation.', 45, TRUE, FALSE),
    ('Documentation', 15, 'Document all transmission work performed.', 15, TRUE, FALSE),
    ('Customer Handover', 16, 'Present completed transmission work to customer.', 20, TRUE, FALSE),
    ('Invoice Generation', 17, 'Generate invoice for transmission service and repairs.', 10, TRUE, FALSE)
) AS stages(stage_name, stage_order, stage_description, estimated_duration_minutes, is_required, requires_approval)
CROSS JOIN public.workflow_templates wt
WHERE wt.template_name = 'Transmission Service & Repair'
ON CONFLICT DO NOTHING;

-- 3. VERIFICATION QUERY
SELECT 
    '=== ENHANCED WORKFLOW TEMPLATES ===' as section,
    'Template Summary' as check_type,
    wt.template_name,
    wt.defect_type,
    COUNT(wts.id) as total_stages,
    COUNT(CASE WHEN wts.is_required = TRUE THEN 1 END) as required_stages,
    COUNT(CASE WHEN wts.requires_approval = TRUE THEN 1 END) as approval_stages
FROM public.workflow_templates wt
LEFT JOIN public.workflow_template_stages wts ON wt.id = wts.template_id
WHERE wt.is_active = TRUE
GROUP BY wt.id, wt.template_name, wt.defect_type
ORDER BY wt.template_name;

-- 4. SHOW DETAILED STAGES FOR EACH TEMPLATE
SELECT 
    '=== DETAILED STAGES ===' as section,
    'Stage Details' as check_type,
    wt.template_name,
    wts.stage_name,
    wts.stage_order,
    wts.stage_description,
    wts.estimated_duration_minutes,
    wts.is_required,
    wts.requires_approval
FROM public.workflow_templates wt
JOIN public.workflow_template_stages wts ON wt.id = wts.template_id
WHERE wt.is_active = TRUE
ORDER BY wt.template_name, wts.stage_order;
