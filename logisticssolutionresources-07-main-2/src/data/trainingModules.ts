export interface TrainingModule {
  id: string;
  name: string;
  description: string;
  category: 'safety' | 'legal' | 'operational' | 'vehicle' | 'emergency';
  duration: number; // in minutes
  mandatory: boolean;
  content: TrainingContent[];
  assessment: AssessmentQuestion[];
  passScore: number;
  validityPeriod: number; // in months
}

export interface TrainingContent {
  type: 'text' | 'video' | 'document' | 'checklist';
  title: string;
  content: string;
  duration?: number;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ComplianceDocument {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  mandatory: boolean;
  category: 'policy' | 'procedure' | 'regulation' | 'training';
  fileSize?: string;
  downloadUrl?: string;
}

export const complianceDocuments: ComplianceDocument[] = [
  {
    id: 'doc_1',
    title: 'Driver Safety Handbook',
    description: 'Comprehensive guide to driver safety protocols and procedures',
    lastUpdated: '2024-06-15',
    mandatory: true,
    category: 'training'
  },
  {
    id: 'doc_2',
    title: 'Vehicle Inspection Guidelines',
    description: 'DVSA approved vehicle inspection procedures',
    lastUpdated: '2024-06-10',
    mandatory: true,
    category: 'procedure'
  },
  {
    id: 'doc_3',
    title: 'Emergency Response Procedures',
    description: 'Step-by-step emergency response protocols',
    lastUpdated: '2024-06-01',
    mandatory: true,
    category: 'procedure'
  }
];

export const trainingModules: TrainingModule[] = [
  {
    id: 'driver-safety-fundamentals',
    name: 'Driver Safety Fundamentals',
    description: 'Essential safety practices for professional drivers',
    category: 'safety',
    duration: 45,
    mandatory: true,
    validityPeriod: 12,
    passScore: 80,
    content: [
      {
        type: 'text',
        title: 'Introduction to Driver Safety',
        content: `Professional driving requires constant vigilance and adherence to safety protocols. This module covers:

• Defensive driving techniques
• Hazard recognition and response
• Vehicle safety systems
• Emergency procedures
• Fatigue management
• Weather-related driving considerations

As a professional driver, you are responsible for the safety of passengers, other road users, and cargo. This training provides the foundation for safe, professional driving practices.`
      },
      {
        type: 'text',
        title: 'Defensive Driving Principles',
        content: `Defensive driving involves:

1. **Scanning and Awareness**
   - Continuously scan the road environment
   - Check mirrors every 5-8 seconds
   - Maintain 360-degree awareness
   - Watch for potential hazards

2. **Safe Following Distances**
   - Maintain 3-second rule in normal conditions
   - Increase to 4-6 seconds in adverse weather
   - Use the "Smith System" - aim high in steering
   - Leave yourself an "out" at all times

3. **Speed Management**
   - Drive according to conditions, not just speed limits
   - Reduce speed in construction zones
   - Adjust for visibility and road surface conditions
   - Use engine braking when appropriate

4. **Communication**
   - Use signals early and clearly
   - Make eye contact when possible
   - Use horn appropriately to warn of danger
   - Position vehicle to be seen by others`
      },
      {
        type: 'checklist',
        title: 'Pre-Trip Safety Checklist',
        content: `Complete this checklist before every trip:

□ Vehicle exterior inspection completed
□ Tire condition and pressure checked
□ Lights and signals tested
□ Mirrors properly adjusted
□ Seat and steering wheel adjusted
□ Safety equipment present and accessible
□ Route planned and weather checked
□ Personal health and alertness assessed
□ Mobile phone charged and accessible
□ Emergency contact information available
□ Documentation and licenses current
□ Vehicle maintenance up to date`
      }
    ],
    assessment: [
      {
        id: 'q1',
        question: 'What is the minimum safe following distance in normal driving conditions?',
        options: ['1 second', '2 seconds', '3 seconds', '4 seconds'],
        correctAnswer: 2,
        explanation: 'The 3-second rule provides adequate stopping distance in normal conditions.'
      },
      {
        id: 'q2',
        question: 'When should you increase your following distance?',
        options: ['Only at night', 'In adverse weather conditions', 'Only in heavy traffic', 'Never'],
        correctAnswer: 1,
        explanation: 'Adverse weather conditions require increased following distance for safety.'
      },
      {
        id: 'q3',
        question: 'What is the most important aspect of defensive driving?',
        options: ['Speed', 'Awareness and anticipation', 'Vehicle size', 'Experience'],
        correctAnswer: 1,
        explanation: 'Awareness and anticipation help prevent accidents before they occur.'
      }
    ]
  },
  {
    id: 'vehicle-inspection-training',
    name: 'Daily Vehicle Inspection Procedures',
    description: 'Comprehensive vehicle inspection and maintenance procedures',
    category: 'operational',
    duration: 30,
    mandatory: true,
    validityPeriod: 12,
    passScore: 85,
    content: [
      {
        type: 'text',
        title: 'Legal Requirements for Vehicle Inspections',
        content: `Daily vehicle inspections are legally required and must be documented:

**Legal Framework:**
• Road Traffic Act requirements
• DVSA guidelines and standards
• Company policy compliance
• Insurance requirements
• DOT regulations (where applicable)

**Driver Responsibilities:**
• Conduct thorough pre-trip inspections
• Document all findings accurately
• Report defects immediately
• Do not operate unsafe vehicles
• Maintain inspection records

**Consequences of Non-Compliance:**
• Legal liability for accidents
• Fines and penalties
• License suspension
• Criminal charges in severe cases
• Company disciplinary action`
      },
      {
        type: 'document',
        title: 'DVSA Inspection Standards',
        content: `Follow DVSA Category B inspection guidelines:

**Exterior Inspection Points:**
1. Body condition and damage assessment
2. Light functionality (all positions)
3. Mirror condition and adjustment
4. Tire condition and tread depth (minimum 1.6mm)
5. Wheel integrity and fasteners
6. Suspension and steering components
7. Brake system visual inspection
8. Exhaust system integrity
9. Registration plates legibility
10. Load security and restraints

**Interior Inspection Points:**
1. Seat condition and adjustment
2. Safety belt functionality
3. Dashboard warning lights
4. Steering wheel free play
5. Brake pedal operation
6. Handbrake operation
7. Horn functionality
8. Windscreen condition
9. Wiper and washer operation
10. Emergency equipment access`
      },
      {
        type: 'checklist',
        title: 'Daily Inspection Form',
        content: `Vehicle Registration: _______________  Date: _______________
Driver Name: _______________  Odometer: _______________

**EXTERIOR CHECKS**
□ Lights (headlights, taillights, indicators, hazards)
□ Tires (condition, pressure, tread depth)
□ Body (damage, corrosion, doors, locks)
□ Mirrors (clean, secure, properly adjusted)
□ Windscreen (chips, cracks, cleanliness)
□ Registration plates (secure, clean, visible)
□ Fuel/fluid levels
□ Load restraints (if applicable)

**INTERIOR CHECKS**
□ Seat belts (all positions)
□ Steering (free play, alignment)
□ Brakes (pedal travel, handbrake)
□ Dashboard warnings
□ Horn functionality
□ Wipers and washers
□ Heating/ventilation
□ First aid kit present
□ Fire extinguisher present
□ Emergency triangle/warning devices

**DEFECTS FOUND:**
_________________________________
_________________________________

Driver Signature: _______________  Time: _______________`
      }
    ],
    assessment: [
      {
        id: 'v1',
        question: 'What is the minimum legal tread depth for vehicle tires?',
        options: ['1.0mm', '1.6mm', '2.0mm', '3.0mm'],
        correctAnswer: 1,
        explanation: '1.6mm is the legal minimum tread depth across the central three-quarters of the tire.'
      },
      {
        id: 'v2',
        question: 'If you discover a safety-critical defect during inspection, what should you do?',
        options: ['Continue driving carefully', 'Report it after the trip', 'Do not drive the vehicle', 'Fix it yourself'],
        correctAnswer: 2,
        explanation: 'Safety-critical defects require immediate removal of the vehicle from service.'
      },
      {
        id: 'v3',
        question: 'How often must vehicle inspections be documented?',
        options: ['Weekly', 'Daily', 'Monthly', 'Only when defects found'],
        correctAnswer: 1,
        explanation: 'Daily inspections must be documented every day the vehicle is used.'
      }
    ]
  },
  {
    id: 'emergency-procedures',
    name: 'Emergency Response Procedures',
    description: 'Comprehensive emergency response and crisis management',
    category: 'emergency',
    duration: 35,
    mandatory: true,
    validityPeriod: 12,
    passScore: 90,
    content: [
      {
        type: 'text',
        title: 'Emergency Response Framework',
        content: `Emergency situations require immediate, decisive action following established protocols:

**Types of Emergencies:**
• Vehicle breakdown or mechanical failure
• Traffic accidents and collisions
• Medical emergencies (driver or passenger)
• Fire or explosion hazards
• Severe weather conditions
• Security threats or suspicious activity
• Cargo-related incidents

**Response Priorities:**
1. Ensure personal safety
2. Protect passengers and public
3. Secure the scene
4. Call appropriate emergency services
5. Notify company dispatch
6. Document the incident
7. Cooperate with authorities

**Emergency Contact Numbers:**
• Emergency Services: 999
• Company Control: [Company Number]
• Breakdown Recovery: [Recovery Number]
• Insurance Hotline: [Insurance Number]`
      },
      {
        type: 'text',
        title: 'Accident Response Procedures',
        content: `In case of an accident, follow the SCENE protocol:

**S - Stop and Secure**
• Stop immediately if safe to do so
• Turn on hazard lights
• Set up warning triangles (50m behind vehicle)
• Turn off engine and set handbrake

**C - Check for Casualties**
• Check yourself first
• Check passengers and other parties
• Do not move seriously injured persons
• Call 999 if anyone is injured

**E - Exchange Information**
• Names and contact details
• Insurance company and policy numbers
• Vehicle registration numbers
• Driving license details
• Description of what happened

**N - Note Everything**
• Take photographs of damage
• Record exact location and time
• Note weather and road conditions
• Get witness statements and contacts
• Do not admit fault or liability

**E - Emergency Services**
• Call 999 for injuries or serious damage
• Report to police if required
• Notify company control immediately
• Contact insurance company within 24 hours`
      },
      {
        type: 'document',
        title: 'Fire Emergency Procedures',
        content: `Vehicle Fire Emergency Response:

**Detection:**
• Unusual smells (burning, fuel, electrical)
• Smoke visible from engine or passenger area
• Warning lights indicating overheating
• Unusual sounds or vibrations

**Immediate Actions:**
1. Stop safely and quickly
2. Turn off engine immediately
3. Evacuate all passengers
4. Call Fire Brigade (999)
5. Use fire extinguisher if safe to do so
6. Do not open hood if engine fire suspected
7. Move upwind from vehicle
8. Keep public at safe distance (100m minimum)

**Fire Extinguisher Use:**
• Only if fire is small and you have escape route
• Pull pin, aim at base of flames
• Squeeze handle, sweep side to side
• If fire doesn't extinguish quickly, retreat
• Never turn your back on a fire

**Post-Incident:**
• Ensure Fire Brigade has vehicle details
• Notify company control
• Complete incident report
• Arrange recovery
• Seek medical attention if smoke inhalation occurred`
      }
    ],
    assessment: [
      {
        id: 'e1',
        question: 'What is the first priority in any emergency situation?',
        options: ['Call emergency services', 'Ensure personal safety', 'Help others', 'Secure the vehicle'],
        correctAnswer: 1,
        explanation: 'Personal safety must be ensured first before you can effectively help others.'
      },
      {
        id: 'e2',
        question: 'How far behind your vehicle should warning triangles be placed?',
        options: ['25 meters', '50 meters', '75 meters', '100 meters'],
        correctAnswer: 1,
        explanation: '50 meters provides adequate warning distance for approaching traffic.'
      },
      {
        id: 'e3',
        question: 'In a vehicle fire, when should you NOT use a fire extinguisher?',
        options: ['If fire is small', 'If you have an escape route', 'If fire is large or spreading rapidly', 'If fire extinguisher is CO2 type'],
        correctAnswer: 2,
        explanation: 'Large or rapidly spreading fires require professional firefighting equipment.'
      }
    ]
  },
  {
    id: 'legal-compliance',
    name: 'Legal Compliance and Documentation',
    description: 'Understanding legal requirements and proper documentation',
    category: 'legal',
    duration: 40,
    mandatory: true,
    validityPeriod: 12,
    passScore: 85,
    content: [
      {
        type: 'text',
        title: 'Driver Legal Requirements',
        content: `Professional drivers must comply with numerous legal requirements:

**Licensing Requirements:**
• Valid driving license for vehicle category
• Professional competence certificate (if applicable)
• Medical fitness certification
• Criminal background check clearance
• Regular license renewal and updates

**Documentation Requirements:**
• Driver qualification card (DQC)
• Vehicle registration documents
• Insurance certificates
• Operator's license (O-License)
• Route risk assessments
• Daily inspection reports
• Hours of work records
• Training certificates

**Legal Obligations:**
• Duty of care to passengers
• Health and safety compliance
• Environmental protection
• Data protection (passenger information)
• Safeguarding vulnerable passengers
• Compliance with working time regulations`
      },
      {
        type: 'text',
        title: 'Working Time Regulations',
        content: `Working Time Regulations 1998 apply to professional drivers:

**Daily Limits:**
• Maximum 10 hours driving per day
• Maximum 15 hours total working time
• Minimum 9 hours daily rest (can be reduced to 8 hours)
• Maximum 56 hours driving per week
• Maximum 90 hours driving per fortnight

**Break Requirements:**
• 45-minute break after 4.5 hours driving
• Can be split into 15 + 30 minutes
• Break must be recorded in log
• No driving during mandatory break periods

**Weekly Rest:**
• Minimum 45 hours weekly rest
• Can be reduced to 24 hours (compensation required)
• Weekly rest must be taken every 6 x 24-hour periods
• Compensation must be attached to another rest period

**Record Keeping:**
• Manual logbooks or digital tachographs
• Records must be kept for 28 days
• Available for inspection on demand
• Accurate recording is legal requirement`
      },
      {
        type: 'document',
        title: 'Safeguarding and Child Protection',
        content: `All drivers have safeguarding responsibilities:

**Duty of Care:**
• Report suspected abuse or neglect
• Maintain appropriate professional boundaries
• Ensure passenger safety and wellbeing
• Follow company safeguarding policies

**Warning Signs to Report:**
• Unexplained injuries or marks
• Changes in behavior or demeanor
• Signs of neglect (hygiene, clothing)
• Disclosure of harm or abuse
• Concerning adult behavior toward children

**Reporting Procedures:**
1. Ensure immediate safety
2. Document observations factually
3. Report to designated safeguarding officer
4. Complete incident report
5. Cooperate with investigations
6. Maintain confidentiality

**Professional Boundaries:**
• No personal relationships with passengers
• No exchange of personal contact information
• No gifts or favors
• No private communication outside work
• Always maintain professional demeanor
• Report any concerns about colleagues`
      }
    ],
    assessment: [
      {
        id: 'l1',
        question: 'What is the maximum daily driving time under Working Time Regulations?',
        options: ['8 hours', '9 hours', '10 hours', '12 hours'],
        correctAnswer: 2,
        explanation: '10 hours is the maximum daily driving time, with possible extension to 11 hours twice per week.'
      },
      {
        id: 'l2',
        question: 'How long must driver records be kept?',
        options: ['7 days', '14 days', '28 days', '12 months'],
        correctAnswer: 2,
        explanation: 'Driver records must be kept and be available for inspection for 28 days.'
      },
      {
        id: 'l3',
        question: 'If you suspect a passenger is being abused, what should you do first?',
        options: ['Confront the suspected abuser', 'Ensure immediate safety', 'Call police immediately', 'Discuss with other drivers'],
        correctAnswer: 1,
        explanation: 'Ensuring immediate safety is the first priority in safeguarding situations.'
      }
    ]
  },
  {
    id: 'passenger-assistance',
    name: 'Passenger Assistance and Accessibility',
    description: 'Supporting passengers with disabilities and special needs',
    category: 'operational',
    duration: 25,
    mandatory: true,
    validityPeriod: 24,
    passScore: 80,
    content: [
      {
        type: 'text',
        title: 'Equality Act 2010 Requirements',
        content: `The Equality Act 2010 requires equal access for all passengers:

**Protected Characteristics:**
• Disability (physical, mental, sensory)
• Age (elderly passengers, unaccompanied minors)
• Pregnancy and maternity
• Race and ethnicity
• Religion and belief
• Sexual orientation

**Reasonable Adjustments:**
• Extra time for boarding and alighting
• Assistance with luggage
• Clear communication and instructions
• Flexible policies where appropriate
• Additional support during emergencies

**Disability Types:**
• Mobility impairments (wheelchairs, walking aids)
• Visual impairments (blindness, partial sight)
• Hearing impairments (deafness, partial hearing)
• Learning disabilities
• Hidden disabilities (autism, epilepsy)
• Mental health conditions`
      },
      {
        type: 'text',
        title: 'Wheelchair Accessibility Procedures',
        content: `Proper wheelchair assistance procedures:

**Before Boarding:**
• Ask before providing assistance
• Check wheelchair space is clear
• Ensure ramp is safe and secure
• Allow passenger to position themselves

**During Boarding:**
• Deploy ramp or lift safely
• Guide but don't push unless asked
• Secure wheelchair in designated space
• Ensure passenger is comfortable
• Store walking aids safely

**During Journey:**
• Check on passenger regularly
• Be aware of sharp turns or braking
• Communicate stops and route changes
• Monitor wheelchair security

**Alighting:**
• Give plenty of notice of arrival
• Ensure safe deployment of ramp/lift
• Assist with retrieving belongings
• Allow time for safe exit
• Check nothing left behind`
      },
      {
        type: 'checklist',
        title: 'Accessibility Equipment Check',
        content: `Daily accessibility equipment inspection:

□ Wheelchair ramp operational
□ Wheelchair restraints functional
□ Audio announcements working
□ Visual display screens operational
□ Emergency communication devices tested
□ Handrails secure and clean
□ Non-slip surfaces in good condition
□ Priority seating clearly marked
□ Accessibility signage visible
□ Emergency evacuation aids present
□ First aid kit accessible
□ Emergency contact information displayed

**If equipment defective:**
□ Report immediately to control
□ Complete defect report
□ Take vehicle out of service if safety-critical
□ Arrange alternative accessible transport
□ Inform passengers of delays`
      }
    ],
    assessment: [
      {
        id: 'p1',
        question: 'What should you do before helping a passenger in a wheelchair?',
        options: ['Just start helping', 'Ask if they need assistance', 'Wait for them to ask', 'Help anyway'],
        correctAnswer: 1,
        explanation: 'Always ask before providing assistance to maintain dignity and autonomy.'
      },
      {
        id: 'p2',
        question: 'Which act requires equal access for disabled passengers?',
        options: ['Transport Act 2000', 'Equality Act 2010', 'Disability Act 1995', 'Access Act 2005'],
        correctAnswer: 1,
        explanation: 'The Equality Act 2010 sets out requirements for equal access and reasonable adjustments.'
      }
    ]
  }
];
