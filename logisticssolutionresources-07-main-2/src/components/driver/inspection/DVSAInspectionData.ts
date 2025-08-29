// DVSA-Compliant Vehicle Inspection Data
// Following the official DVSA walkaround order and vehicle-specific requirements

export interface DVSAInspectionQuestion {
  id: string;
  title: string;
  description: string;
  guidanceImage: string;
  guidance: string;
  dvsaReference?: string;
  category: 'safety' | 'mechanical' | 'legal' | 'passenger' | 'load';
  walkaroundPosition: number;
  vehicleTypes: VehicleType[];
  isRequired: boolean;
  hasPhotoOption: boolean;
  legalConsequence?: string;
}

export type VehicleType = 'bus' | 'minibus' | 'coach' | 'truck' | 'hgv' | 'all';

export interface WalkaroundPosition {
  id: string;
  name: string;
  description: string;
  position: number;
  coordinates: { x: number; y: number };
  direction: string;
}

// DVSA-compliant walkaround positions
export const walkaroundPositions: WalkaroundPosition[] = [
  {
    id: 'front-left-start',
    name: 'Front Left Corner',
    description: 'Starting position - left front mirror area',
    position: 1,
    coordinates: { x: 15, y: 20 },
    direction: 'Start at the front left corner of the vehicle'
  },
  {
    id: 'front-left-mirror',
    name: 'Left Mirror & Front Lights',
    description: 'Left mirror, front light clusters, windscreen',
    position: 2,
    coordinates: { x: 25, y: 15 },
    direction: 'Check left mirror and front lighting'
  },
  {
    id: 'front-center',
    name: 'Front Center',
    description: 'Windscreen, wipers, number plate',
    position: 3,
    coordinates: { x: 50, y: 10 },
    direction: 'Inspect front windscreen and registration'
  },
  {
    id: 'front-right',
    name: 'Front Right Corner',
    description: 'Right mirror, indicators, front right tyre',
    position: 4,
    coordinates: { x: 75, y: 15 },
    direction: 'Move to front right corner'
  },
  {
    id: 'right-side',
    name: 'Right Side',
    description: 'Right side bodywork, doors, emergency exits',
    position: 5,
    coordinates: { x: 85, y: 50 },
    direction: 'Walk along the right side'
  },
  {
    id: 'rear-right',
    name: 'Rear Right',
    description: 'Rear right corner, lights, tyres',
    position: 6,
    coordinates: { x: 75, y: 85 },
    direction: 'Check rear right corner'
  },
  {
    id: 'rear-center',
    name: 'Rear Center',
    description: 'Rear lights, number plate, reflectors',
    position: 7,
    coordinates: { x: 50, y: 90 },
    direction: 'Inspect rear of vehicle'
  },
  {
    id: 'rear-left',
    name: 'Rear Left',
    description: 'Rear left corner and tyre',
    position: 8,
    coordinates: { x: 25, y: 85 },
    direction: 'Check rear left corner'
  },
  {
    id: 'left-side',
    name: 'Left Side',
    description: 'Left side bodywork and indicators',
    position: 9,
    coordinates: { x: 15, y: 50 },
    direction: 'Walk along the left side'
  },
  {
    id: 'interior-cab',
    name: 'Interior/Cab',
    description: 'Dashboard, controls, safety equipment',
    position: 10,
    coordinates: { x: 50, y: 50 },
    direction: 'Enter vehicle for interior checks'
  }
];

// DVSA-compliant inspection questions in walkaround order
export const dvsaInspectionQuestions: DVSAInspectionQuestion[] = [
  // Position 1-2: Front Left Corner & Mirror
  {
    id: 'left-mirror-condition',
    title: 'Left Mirror Condition',
    description: 'Check left external mirror is secure, clean, and undamaged',
    guidanceImage: '🪞',
    guidance: 'Ensure mirror is firmly mounted, glass is clean and crack-free, adjustment mechanism works. Mirror must provide clear view of road behind.',
    dvsaReference: 'Vehicle defect categories A-C',
    category: 'safety',
    walkaroundPosition: 1,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: true,
    legalConsequence: 'Driving with defective mirrors can result in 3 penalty points and £100 fine'
  },
  {
    id: 'front-left-light-cluster',
    title: 'Front Left Light Cluster',
    description: 'Check headlight, indicator, and side lights function correctly',
    guidanceImage: '💡',
    guidance: 'Test main beam, dip beam, side lights, and indicators. Check for cracked lenses or water ingress.',
    dvsaReference: 'Lighting regulations RVLR',
    category: 'safety',
    walkaroundPosition: 2,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: true,
    legalConsequence: 'Faulty lights can result in prosecution and fines up to £1,000'
  },
  
  // Position 3: Front Center
  {
    id: 'windscreen-condition',
    title: 'Windscreen Condition',
    description: 'Check for cracks, chips, or damage that could impair vision',
    guidanceImage: '🚗',
    guidance: 'No damage larger than 10mm in driver\'s view (zone A), or 40mm elsewhere. Check screen is secure in frame.',
    dvsaReference: 'Construction & Use Regulations',
    category: 'safety',
    walkaroundPosition: 3,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: true,
    legalConsequence: 'Driving with damaged windscreen can result in 3 penalty points and £60 fine'
  },
  {
    id: 'wipers-washers',
    title: 'Wipers and Washers',
    description: 'Test windscreen wipers and washer system operation',
    guidanceImage: '🌧️',
    guidance: 'Wipers must clear screen effectively without streaking. Washer fluid must spray adequately onto screen.',
    dvsaReference: 'Road Traffic Act requirements',
    category: 'safety',
    walkaroundPosition: 3,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: false
  },
  {
    id: 'front-number-plate',
    title: 'Front Number Plate',
    description: 'Check number plate is secure, clean, and legally compliant',
    guidanceImage: '🔢',
    guidance: 'Plate must be clearly visible, correctly formatted, securely mounted. No damage or obscuring.',
    dvsaReference: 'Vehicle Registration Regulations',
    category: 'legal',
    walkaroundPosition: 3,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: true,
    legalConsequence: 'Invalid number plates can result in £1,000 fine'
  },

  // Position 4: Front Right
  {
    id: 'right-mirror-condition',
    title: 'Right Mirror Condition',
    description: 'Check right external mirror is secure, clean, and undamaged',
    guidanceImage: '🪞',
    guidance: 'Mirror must be firmly mounted with clear, undamaged glass. Check adjustment mechanism works properly.',
    category: 'safety',
    walkaroundPosition: 4,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: true
  },
  {
    id: 'front-right-tyre',
    title: 'Front Right Tyre',
    description: 'Inspect tyre condition, tread depth, and inflation',
    guidanceImage: '🛞',
    guidance: 'Minimum 1.6mm tread depth across central 3/4 of tyre. Check for cuts, bulges, or irregular wear. Ensure proper inflation.',
    dvsaReference: 'Road Traffic Act - Tyre regulations',
    category: 'safety',
    walkaroundPosition: 4,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: true,
    legalConsequence: 'Illegal tyres can result in 3 penalty points and £2,500 fine per tyre'
  },

  // Position 5: Right Side
  {
    id: 'right-side-bodywork',
    title: 'Right Side Bodywork',
    description: 'Check bodywork for damage that could cause injury',
    guidanceImage: '🚌',
    guidance: 'Look for sharp edges, loose panels, or damage that could cause injury to passengers or other road users.',
    category: 'safety',
    walkaroundPosition: 5,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: true
  },
  {
    id: 'passenger-doors-right',
    title: 'Passenger Doors (Right)',
    description: 'Check passenger doors open, close, and secure properly',
    guidanceImage: '🚪',
    guidance: 'All doors must open and close correctly. Check handles, hinges, and locking mechanisms work.',
    category: 'passenger',
    walkaroundPosition: 5,
    vehicleTypes: ['bus', 'minibus', 'coach'],
    isRequired: true,
    hasPhotoOption: true
  },
  {
    id: 'emergency-exits-right',
    title: 'Emergency Exits (Right)',
    description: 'Check emergency exit doors and windows are functional',
    guidanceImage: '🚨',
    guidance: 'Emergency exits must open easily, handles clearly marked. Check emergency door buzzers work.',
    category: 'passenger',
    walkaroundPosition: 5,
    vehicleTypes: ['bus', 'coach'],
    isRequired: true,
    hasPhotoOption: true,
    legalConsequence: 'Faulty emergency exits can result in vehicle prohibition'
  },

  // Position 6-7: Rear
  {
    id: 'rear-lights',
    title: 'Rear Light Cluster',
    description: 'Test all rear lights including brake lights and indicators',
    guidanceImage: '🔴',
    guidance: 'Check brake lights, indicators, reversing lights, and rear position lights. Test hazard warning lights.',
    category: 'safety',
    walkaroundPosition: 6,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: true
  },
  {
    id: 'rear-number-plate',
    title: 'Rear Number Plate',
    description: 'Check rear number plate condition and illumination',
    guidanceImage: '🔢',
    guidance: 'Plate must be clean, secure, and properly illuminated. Check number plate light works.',
    category: 'legal',
    walkaroundPosition: 7,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: true
  },
  {
    id: 'reflectors',
    title: 'Reflectors and Markings',
    description: 'Check rear reflectors and hazard markings are present',
    guidanceImage: '⚡',
    guidance: 'Red reflectors must be clean and secure. Check chevron markings on larger vehicles.',
    category: 'safety',
    walkaroundPosition: 7,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: true
  },
  {
    id: 'trailer-coupling',
    title: 'Trailer Coupling',
    description: 'Check trailer coupling and brake connections (if applicable)',
    guidanceImage: '🔗',
    guidance: 'Coupling must be secure, brake lines connected, electrical connections working.',
    category: 'mechanical',
    walkaroundPosition: 7,
    vehicleTypes: ['truck', 'hgv'],
    isRequired: false,
    hasPhotoOption: true
  },

  // Position 8-9: Left Side and Rear Left
  {
    id: 'rear-left-tyre',
    title: 'Rear Left Tyre',
    description: 'Inspect rear left tyre condition and tread depth',
    guidanceImage: '🛞',
    guidance: 'Check tread depth, sidewall condition, and proper inflation. Look for irregular wear patterns.',
    category: 'safety',
    walkaroundPosition: 8,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: true
  },
  {
    id: 'left-side-indicators',
    title: 'Left Side Indicators',
    description: 'Test left side indicator lights and side markers',
    guidanceImage: '⚠️',
    guidance: 'Check all left side indicators flash correctly and side marker lights work.',
    category: 'safety',
    walkaroundPosition: 9,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: true
  },

  // Position 10: Interior/Cab
  {
    id: 'dashboard-warning-lights',
    title: 'Dashboard Warning Lights',
    description: 'Check dashboard for any warning lights or fault codes',
    guidanceImage: '⚠️',
    guidance: 'With ignition on, check for any warning lights. Pay attention to brake, ABS, engine management lights.',
    category: 'mechanical',
    walkaroundPosition: 10,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: true,
    legalConsequence: 'Ignoring warning lights can lead to vehicle defects and penalties'
  },
  {
    id: 'horn-operation',
    title: 'Horn Operation',
    description: 'Test horn is audible and functions correctly',
    guidanceImage: '📢',
    guidance: 'Horn must produce adequate sound when pressed. Check steering wheel horn button works.',
    category: 'safety',
    walkaroundPosition: 10,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: false
  },
  {
    id: 'driver-seatbelt',
    title: 'Driver Seatbelt',
    description: 'Check driver seatbelt retracts and buckles correctly',
    guidanceImage: '🔒',
    guidance: 'Seatbelt must retract smoothly, buckle securely, and webbing must be undamaged.',
    category: 'safety',
    walkaroundPosition: 10,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: true,
    legalConsequence: 'Defective seatbelts can result in fixed penalty and prohibition'
  },
  {
    id: 'brake-pedal-feel',
    title: 'Brake Pedal Feel',
    description: 'Test brake pedal firmness and travel',
    guidanceImage: '🛑',
    guidance: 'Brake pedal should feel firm and not sink to floor. Check handbrake operates effectively.',
    category: 'safety',
    walkaroundPosition: 10,
    vehicleTypes: ['all'],
    isRequired: true,
    hasPhotoOption: false,
    legalConsequence: 'Defective brakes can result in immediate prohibition'
  },
  {
    id: 'fire-extinguisher',
    title: 'Fire Extinguisher',
    description: 'Check fire extinguisher is present and in date',
    guidanceImage: '🧯',
    guidance: 'Fire extinguisher must be securely mounted, in date, and pressure gauge showing green.',
    category: 'passenger',
    walkaroundPosition: 10,
    vehicleTypes: ['bus', 'coach'],
    isRequired: true,
    hasPhotoOption: true,
    legalConsequence: 'Missing fire safety equipment can result in vehicle prohibition'
  },
  {
    id: 'first-aid-kit',
    title: 'First Aid Kit',
    description: 'Check first aid kit is present and contents are in date',
    guidanceImage: '🏥',
    guidance: 'First aid kit must be present, accessible, and contents within expiry dates.',
    category: 'passenger',
    walkaroundPosition: 10,
    vehicleTypes: ['bus', 'coach'],
    isRequired: true,
    hasPhotoOption: true
  },
  {
    id: 'emergency-door-buzzer',
    title: 'Emergency Door Buzzer',
    description: 'Test emergency door warning system',
    guidanceImage: '🔔',
    guidance: 'Emergency door buzzer must sound when doors are opened while engine is running.',
    category: 'passenger',
    walkaroundPosition: 10,
    vehicleTypes: ['bus', 'coach'],
    isRequired: true,
    hasPhotoOption: false
  },
  {
    id: 'tachograph-driver-card',
    title: 'Tachograph/Driver Card',
    description: 'Check tachograph operation and driver card validity',
    guidanceImage: '📊',
    guidance: 'Ensure tachograph is functioning, driver card is valid and inserted correctly.',
    category: 'legal',
    walkaroundPosition: 10,
    vehicleTypes: ['truck', 'hgv', 'coach'],
    isRequired: true,
    hasPhotoOption: true,
    legalConsequence: 'Tachograph offences can result in prosecution and operator license penalty'
  },

  // Additional HGV/Truck specific checks
  {
    id: 'load-security',
    title: 'Load Security',
    description: 'Check load is properly secured with appropriate restraints',
    guidanceImage: '📦',
    guidance: 'Load must be properly secured to prevent movement. Check straps, ropes, or other restraints.',
    category: 'load',
    walkaroundPosition: 5,
    vehicleTypes: ['truck', 'hgv'],
    isRequired: true,
    hasPhotoOption: true,
    legalConsequence: 'Insecure loads can result in prosecution and immediate prohibition'
  },
  {
    id: 'spray-suppression',
    title: 'Spray Suppression',
    description: 'Check spray suppression equipment is fitted and undamaged',
    guidanceImage: '💦',
    guidance: 'Mudflaps and spray suppression must be present and properly fitted to reduce spray.',
    category: 'safety',
    walkaroundPosition: 7,
    vehicleTypes: ['truck', 'hgv'],
    isRequired: true,
    hasPhotoOption: true
  }
];

// Vehicle type specific required checks
export const getVehicleSpecificQuestions = (vehicleType: VehicleType): DVSAInspectionQuestion[] => {
  return dvsaInspectionQuestions.filter(q => 
    q.vehicleTypes.includes(vehicleType) || q.vehicleTypes.includes('all')
  );
};

// Get questions for specific walkaround position
export const getQuestionsForPosition = (position: number, vehicleType: VehicleType): DVSAInspectionQuestion[] => {
  return getVehicleSpecificQuestions(vehicleType).filter(q => q.walkaroundPosition === position);
};