-- =====================================================
-- CREATE WALK AROUND CHECK QUESTIONS - IMMEDIATE EXECUTION
-- =====================================================
-- This script creates the tables and adds the 56 walk around check questions
-- Run this directly in your database to see the questions immediately
-- =====================================================

-- 1. Create inspection_question_sets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.inspection_question_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create inspection_questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.inspection_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    question_type TEXT NOT NULL DEFAULT 'yes_no',
    is_required BOOLEAN DEFAULT true,
    is_critical BOOLEAN DEFAULT false,
    has_photo BOOLEAN DEFAULT false,
    has_notes BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    guidance TEXT,
    question_set_id UUID NOT NULL REFERENCES public.inspection_question_sets(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE public.inspection_question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_questions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for question sets
DROP POLICY IF EXISTS "Users can view question sets from their organization" ON public.inspection_question_sets;
CREATE POLICY "Users can view question sets from their organization" ON public.inspection_question_sets
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage question sets" ON public.inspection_question_sets;
CREATE POLICY "Users can manage question sets" ON public.inspection_question_sets
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- 5. Create RLS policies for questions
DROP POLICY IF EXISTS "Users can view questions from their organization" ON public.inspection_questions;
CREATE POLICY "Users can view questions from their organization" ON public.inspection_questions
    FOR SELECT USING (
        question_set_id IN (
            SELECT id FROM inspection_question_sets 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Users can manage questions" ON public.inspection_questions;
CREATE POLICY "Users can manage questions" ON public.inspection_questions
    FOR ALL USING (
        question_set_id IN (
            SELECT id FROM inspection_question_sets 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inspection_question_sets_org_id ON public.inspection_question_sets(organization_id);
CREATE INDEX IF NOT EXISTS idx_inspection_question_sets_created_by ON public.inspection_question_sets(created_by);
CREATE INDEX IF NOT EXISTS idx_inspection_questions_set_id ON public.inspection_questions(question_set_id);
CREATE INDEX IF NOT EXISTS idx_inspection_questions_order ON public.inspection_questions(order_index);

-- 7. Grant permissions
GRANT ALL ON public.inspection_question_sets TO anon, authenticated;
GRANT ALL ON public.inspection_questions TO anon, authenticated;

-- 8. Function to create default walk around check questions
CREATE OR REPLACE FUNCTION create_default_walk_around_questions(
    org_id UUID,
    creator_id UUID
)
RETURNS UUID AS $$
DECLARE
    set_id UUID;
BEGIN
    -- Create the "Daily Pre-Trip Inspection" question set
    INSERT INTO public.inspection_question_sets (
        name,
        description, 
        is_active,
        is_default,
        organization_id,
        created_by
    ) VALUES (
        'Daily Pre-Trip Inspection',
        'Comprehensive daily vehicle inspection covering all safety-critical areas including exterior, interior, safety equipment, load security, and driver fitness. Based on DVSA standards.',
        true,
        true,
        org_id,
        creator_id
    )
    RETURNING id INTO set_id;

    -- Insert all 56 comprehensive walk around check questions
    INSERT INTO public.inspection_questions (
        question,
        category,
        question_type,
        is_required,
        is_critical, 
        has_photo,
        has_notes,
        order_index,
        guidance,
        question_set_id
    ) VALUES
    -- ===== FRONT OF VEHICLE (Questions 1-8) =====
    (
        'Are there any fuel, oil, or fluid leaks under the vehicle?',
        'exterior',
        'yes_no',
        true,
        true,
        true,
        true,
        1,
        'Check for any visible leaks under the vehicle. Look for oil, fuel, coolant, or other fluid stains on the ground. Pay attention to the engine area, transmission, and fuel tank.',
        set_id
    ),
    (
        'Is the windscreen clean and free from cracks or damage?',
        'exterior',
        'yes_no',
        true,
        true,
        true,
        true,
        2,
        'Inspect the windscreen for cracks, chips, or damage. Ensure it''s clean and provides clear visibility. Check for any delamination or distortion.',
        set_id
    ),
    (
        'Are the windscreen wipers and washers working correctly?',
        'exterior',
        'yes_no',
        true,
        true,
        false,
        true,
        3,
        'Test the wipers by turning them on. Check that they clear the windscreen effectively. Test the washer fluid spray and ensure it reaches the windscreen.',
        set_id
    ),
    (
        'Are the headlights (main/dip) working and lenses clean?',
        'lights',
        'yes_no',
        true,
        true,
        true,
        true,
        4,
        'Turn on the headlights and check both main beam and dipped beam. Ensure lenses are clean and not cracked. Check that both lights are working.',
        set_id
    ),
    (
        'Are the front indicators including side repeaters working?',
        'lights',
        'yes_no',
        true,
        true,
        false,
        true,
        5,
        'Test all front indicators including side repeaters. Ensure they flash at the correct rate and are visible from all angles.',
        set_id
    ),
    (
        'Is the horn working clearly?',
        'general',
        'yes_no',
        true,
        true,
        false,
        true,
        6,
        'Test the horn by pressing it. Ensure it produces a clear, audible sound that can be heard from outside the vehicle.',
        set_id
    ),
    (
        'Are mirrors fitted, secure, adjusted, and not cracked?',
        'exterior',
        'yes_no',
        true,
        true,
        true,
        true,
        7,
        'Check all mirrors are securely fitted and properly adjusted. Ensure they''re not cracked or damaged. Test that they provide adequate rearward visibility.',
        set_id
    ),
    (
        'Is the front registration plate present, clean, and secure?',
        'exterior',
        'yes_no',
        true,
        true,
        true,
        true,
        8,
        'Verify the front registration plate is present, clean, and securely attached. Check that all numbers and letters are clearly visible and not obscured.',
        set_id
    ),

    -- ===== NEARSIDE/PASSENGER SIDE (Questions 9-13) =====
    (
        'Are the tyres in good condition with adequate tread depth and proper inflation?',
        'tires',
        'yes_no',
        true,
        true,
        true,
        true,
        9,
        'Inspect all tyres on the passenger side. Check tread depth (minimum 1.6mm), look for cuts, bulges, or damage. Check tyre pressure and ensure valve caps are present.',
        set_id
    ),
    (
        'Are the wheel nuts secure with no cracks, rust marks, or missing nuts?',
        'tires',
        'yes_no',
        true,
        true,
        true,
        true,
        10,
        'Check all wheel nuts are present and properly tightened. Look for any signs of rust, cracks, or missing nuts. Ensure wheel covers are secure.',
        set_id
    ),
    (
        'Are mudguards and spray suppression devices properly fitted?',
        'exterior',
        'yes_no',
        true,
        false,
        true,
        true,
        11,
        'Inspect mudguards and spray suppression devices. Ensure they''re properly fitted and not damaged. Check they''re positioned correctly to prevent spray.',
        set_id
    ),
    (
        'Is the bodywork free from damage, sharp edges, or corrosion?',
        'exterior',
        'yes_no',
        true,
        false,
        true,
        true,
        12,
        'Check bodywork for any damage, sharp edges, or corrosion. Look for dents, scratches, or areas that could cause injury or further damage.',
        set_id
    ),
    (
        'Are all reflectors on the nearside clean, secure, and properly positioned?',
        'lights',
        'yes_no',
        true,
        true,
        true,
        true,
        13,
        'Inspect all reflectors on the passenger side. Ensure they''re clean, secure, and properly positioned. Check they''re not cracked or damaged.',
        set_id
    ),

    -- ===== REAR OF VEHICLE (Questions 14-20) =====
    (
        'Are all rear lights (brake, tail, indicators) working correctly?',
        'lights',
        'yes_no',
        true,
        true,
        false,
        true,
        14,
        'Test all rear lights including brake lights, indicators, and tail lights. Ensure they''re working correctly and visible from behind the vehicle.',
        set_id
    ),
    (
        'Is the number plate light working and illuminating the plate clearly?',
        'lights',
        'yes_no',
        true,
        true,
        false,
        true,
        15,
        'Check the number plate light is working and illuminates the registration plate clearly. Ensure it''s not cracked or damaged.',
        set_id
    ),
    (
        'Is the rear registration plate clean, secure, and clearly visible?',
        'exterior',
        'yes_no',
        true,
        true,
        true,
        true,
        16,
        'Inspect the rear registration plate. Ensure it''s clean, secure, and all numbers/letters are clearly visible.',
        set_id
    ),
    (
        'Are rear reflectors clean, secure, and properly positioned?',
        'lights',
        'yes_no',
        true,
        true,
        true,
        true,
        17,
        'Check rear reflectors are clean, secure, and properly positioned. Ensure they''re not damaged or missing.',
        set_id
    ),
    (
        'If fitted, does the tail lift operate smoothly and lock securely?',
        'general',
        'yes_no',
        false,
        false,
        false,
        true,
        18,
        'If fitted, test the tail lift operation. Check it raises and lowers smoothly, and locks securely in both positions.',
        set_id
    ),
    (
        'Are under-run protection bars securely attached and undamaged?',
        'exterior',
        'yes_no',
        false,
        false,
        true,
        true,
        19,
        'Inspect under-run protection bars if fitted. Ensure they''re securely attached and not damaged or bent.',
        set_id
    ),
    (
        'Do rear doors/tailgate operate correctly with secure hinges and locks?',
        'general',
        'yes_no',
        true,
        false,
        false,
        true,
        20,
        'Test rear doors or tailgate operation. Check hinges, locks, and latches work correctly. Ensure doors close and seal properly.',
        set_id
    ),

    -- ===== OFFSIDE/DRIVER''S SIDE (Questions 21-24) =====
    (
        'Are the driver''s side tyres in good condition with adequate tread?',
        'tires',
        'yes_no',
        true,
        true,
        true,
        true,
        21,
        'Inspect all tyres on the driver''s side. Check tread depth, condition, pressure, and look for any damage or wear.',
        set_id
    ),
    (
        'Is the exhaust system secure and not leaking?',
        'engine',
        'yes_no',
        true,
        true,
        false,
        true,
        22,
        'Check the exhaust system is secure and not leaking. Look for excessive smoke or unusual noises. Ensure the exhaust pipe is not damaged.',
        set_id
    ),
    (
        'Are side marker lamps working correctly and visible?',
        'lights',
        'yes_no',
        true,
        true,
        false,
        true,
        23,
        'Test side marker lamps are working correctly. Ensure they''re visible and not damaged.',
        set_id
    ),
    (
        'Is the fuel filler cap secure and not leaking?',
        'fuel',
        'yes_no',
        true,
        true,
        false,
        true,
        24,
        'Check the fuel filler cap is secure and not leaking. Ensure the cap fits properly and the seal is intact.',
        set_id
    ),

    -- ===== INSIDE CAB (Questions 25-33) =====
    (
        'Are the driver''s seat and seat belts secure and functioning?',
        'interior',
        'yes_no',
        true,
        true,
        false,
        true,
        25,
        'Check the driver''s seat is secure and properly adjusted. Test seat belts buckle and unbuckle correctly. Ensure belts retract properly.',
        set_id
    ),
    (
        'Is the steering wheel secure with no excessive play?',
        'interior',
        'yes_no',
        true,
        true,
        false,
        true,
        26,
        'Check steering wheel for excessive play or looseness. Ensure it turns smoothly and returns to center properly.',
        set_id
    ),
    (
        'Are the brakes working with firm pedal feel?',
        'brakes',
        'yes_no',
        true,
        true,
        false,
        true,
        27,
        'Test brake pedal feel and travel. Check for any brake warning lights. Ensure brakes feel firm and responsive.',
        set_id
    ),
    (
        'Are all dashboard warning lights functioning correctly?',
        'interior',
        'yes_no',
        true,
        true,
        false,
        true,
        28,
        'Check all dashboard warning lights are functioning. Ensure no warning lights remain illuminated when they shouldn''t be.',
        set_id
    ),
    (
        'Is the tachograph working and properly calibrated?',
        'interior',
        'yes_no',
        true,
        true,
        false,
        true,
        29,
        'Verify tachograph is working and calibrated. Check paper roll is available and properly fitted. Ensure time is set correctly.',
        set_id
    ),
    (
        'Is the odometer functioning and speed limiter working?',
        'interior',
        'yes_no',
        true,
        true,
        false,
        true,
        30,
        'Check odometer is functioning and recording mileage correctly. Test speed limiter if fitted.',
        set_id
    ),
    (
        'Does the handbrake/parking brake hold the vehicle securely?',
        'brakes',
        'yes_no',
        true,
        true,
        false,
        true,
        31,
        'Test handbrake/parking brake operation. Ensure it holds the vehicle securely on a slope.',
        set_id
    ),
    (
        'Are heating and ventilation systems working correctly?',
        'interior',
        'yes_no',
        true,
        false,
        false,
        true,
        32,
        'Test heating and ventilation systems. Ensure air flows correctly and temperature controls work.',
        set_id
    ),
    (
        'Are saloon lighting and flooring safe and secure?',
        'interior',
        'yes_no',
        true,
        false,
        true,
        true,
        33,
        'Check saloon lighting and flooring are safe and secure. Look for any loose or damaged floor panels.',
        set_id
    ),

    -- ===== SAFETY EQUIPMENT (Questions 34-42) =====
    (
        'Is the fire extinguisher present, secure, and in date?',
        'safety',
        'yes_no',
        true,
        true,
        true,
        true,
        34,
        'Verify fire extinguisher is present, secure, and in date. Check it''s easily accessible and properly mounted.',
        set_id
    ),
    (
        'Is the first aid kit present, stocked, and in date?',
        'safety',
        'yes_no',
        true,
        true,
        true,
        true,
        35,
        'Check first aid kit is present, stocked, and in date. Ensure it''s easily accessible and properly stored.',
        set_id
    ),
    (
        'Do all passenger doors open/close properly with clear emergency exits?',
        'safety',
        'yes_no',
        true,
        true,
        false,
        true,
        36,
        'Test all passenger doors open and close properly. Check emergency exits are clearly marked and functional.',
        set_id
    ),
    (
        'Are emergency hammers present, secure, and easily accessible?',
        'safety',
        'yes_no',
        false,
        false,
        true,
        true,
        37,
        'If fitted, check emergency hammers are present and secure. Ensure they''re easily accessible in an emergency.',
        set_id
    ),
    (
        'Does the wheelchair ramp/lift operate smoothly and safely?',
        'safety',
        'yes_no',
        false,
        false,
        false,
        true,
        38,
        'If fitted, test wheelchair ramp/lift operation. Ensure it works smoothly and safely.',
        set_id
    ),
    (
        'Are all passenger seat belts working correctly?',
        'safety',
        'yes_no',
        true,
        true,
        false,
        true,
        39,
        'Check all passenger seat belts are working correctly. Ensure they buckle and retract properly.',
        set_id
    ),
    (
        'Is accessibility signage fitted and clearly visible?',
        'safety',
        'yes_no',
        false,
        false,
        true,
        true,
        40,
        'Verify accessibility signage is fitted and visible. Check it meets required standards.',
        set_id
    ),
    (
        'Are camera systems working with clear displays?',
        'general',
        'yes_no',
        false,
        false,
        false,
        true,
        41,
        'If fitted, check camera systems are working and clean. Ensure displays are clear and functional.',
        set_id
    ),
    (
        'Is the fresnel lens properly positioned and visible?',
        'general',
        'yes_no',
        false,
        false,
        true,
        true,
        42,
        'If fitted, check fresnel lens is properly positioned and visible. Ensure it provides adequate blind spot coverage.',
        set_id
    ),

    -- ===== LOAD & TRAILER (Questions 43-47) =====
    (
        'Is the load properly secured with appropriate restraints?',
        'general',
        'yes_no',
        false,
        false,
        true,
        true,
        43,
        'Check load is properly secured with appropriate restraints. Ensure curtains or straps are tight and secure.',
        set_id
    ),
    (
        'Is the load height within legal limits?',
        'general',
        'yes_no',
        false,
        false,
        false,
        true,
        44,
        'Verify load height is within legal limits. Check it doesn''t exceed maximum permitted height.',
        set_id
    ),
    (
        'Are trailer brake lines secure and not leaking?',
        'brakes',
        'yes_no',
        false,
        false,
        false,
        true,
        45,
        'If towing, check trailer brake lines are secure and not leaking. Test brake operation.',
        set_id
    ),
    (
        'Is the trailer coupling secure with electrical connections safe?',
        'general',
        'yes_no',
        false,
        false,
        false,
        true,
        46,
        'If towing, check trailer coupling is secure and clip is in place. Ensure electrical connections are safe.',
        set_id
    ),
    (
        'Are trailer landing legs up and secure?',
        'general',
        'yes_no',
        false,
        false,
        false,
        true,
        47,
        'If towing, check trailer landing legs are up and secure. Ensure they''re not dragging or loose.',
        set_id
    ),

    -- ===== GENERAL EQUIPMENT (Questions 48-52) =====
    (
        'Is the AdBlue level adequate and system functioning?',
        'fuel',
        'yes_no',
        false,
        false,
        false,
        true,
        48,
        'Check AdBlue level if fitted. Ensure cap is secure and system is functioning.',
        set_id
    ),
    (
        'Are warning triangles or warning devices on board and accessible?',
        'safety',
        'yes_no',
        true,
        false,
        true,
        true,
        49,
        'Verify warning triangles or other warning devices are on board and accessible.',
        set_id
    ),
    (
        'Are emergency contact numbers carried and easily accessible?',
        'documentation',
        'yes_no',
        true,
        false,
        false,
        true,
        50,
        'Check emergency contact numbers are carried in the cab and easily accessible.',
        set_id
    ),
    (
        'Is the fire suppression system operating correctly?',
        'safety',
        'yes_no',
        false,
        false,
        false,
        true,
        51,
        'If fitted, test fire suppression system operation. Ensure it''s properly maintained.',
        set_id
    ),
    (
        'Is the cab clean and free from loose hazardous items?',
        'general',
        'yes_no',
        true,
        false,
        false,
        true,
        52,
        'Check cab is clean and free from loose items that could cause hazards during operation.',
        set_id
    ),

    -- ===== FINAL CHECK (Questions 53-54) =====
    (
        'Have all defects been properly documented and reported?',
        'documentation',
        'yes_no',
        true,
        true,
        false,
        true,
        53,
        'Confirm no defects were found during the inspection. If defects were found, ensure they''re properly documented.',
        set_id
    ),
    (
        'Have defects been reported to the transport manager immediately?',
        'documentation',
        'yes_no',
        true,
        true,
        false,
        true,
        54,
        'Verify all defects have been reported to the transport manager immediately. Ensure proper reporting procedures were followed.',
        set_id
    ),

    -- ===== DOCUMENTATION & DRIVER (Questions 55-56) =====
    (
        'Current mileage reading',
        'documentation',
        'number',
        true,
        false,
        false,
        true,
        55,
        'Record the current mileage reading from the vehicle odometer. Ensure it''s accurate and legible.',
        set_id
    ),
    (
        'Are you fit to drive and not under any influence?',
        'driver',
        'yes_no',
        true,
        true,
        false,
        true,
        56,
        'Confirm you are fit to drive. Check you''re not tired, under the influence, or suffering from any condition that could affect driving ability.',
        set_id
    );

    RETURN set_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Create the walk around check questions for the first organization
-- This will create the questions immediately when you run this script
DO $$
DECLARE
    org_id UUID;
    admin_id UUID;
BEGIN
    -- Get the first organization
    SELECT id INTO org_id FROM public.organizations LIMIT 1;
    
    -- Get an admin user from that organization
    SELECT id INTO admin_id FROM public.profiles 
    WHERE organization_id = org_id 
    AND role IN ('admin', 'council') 
    LIMIT 1;
    
    -- If we found both, create the questions
    IF org_id IS NOT NULL AND admin_id IS NOT NULL THEN
        PERFORM create_default_walk_around_questions(org_id, admin_id);
        RAISE NOTICE 'Walk around check questions created successfully for organization %', org_id;
    ELSE
        RAISE NOTICE 'Could not find organization or admin user to create questions';
    END IF;
END $$;

-- 10. Show the results
SELECT 
    'Question Sets Created:' as info,
    COUNT(*) as count
FROM public.inspection_question_sets 
WHERE name = 'Daily Pre-Trip Inspection';

SELECT 
    'Questions Created:' as info,
    COUNT(*) as count
FROM public.inspection_questions iq
JOIN public.inspection_question_sets iqs ON iq.question_set_id = iqs.id
WHERE iqs.name = 'Daily Pre-Trip Inspection';

