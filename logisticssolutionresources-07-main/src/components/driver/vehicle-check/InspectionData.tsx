
export const inspectionQuestions = [
  {
    id: 'engine',
    title: 'Engine Condition',
    description: 'Check the engine for any unusual noises, leaks, or warning lights',
    guidanceImage: '🔧',
    guidance: 'Look for: Oil leaks, unusual engine noises, warning lights on dashboard, smoke from exhaust. Check engine oil level and coolant. Listen for irregular sounds when engine is running.',
    category: 'mechanical'
  },
  {
    id: 'brakes',
    title: 'Brake System',
    description: 'Test brake pedal feel and check for any brake fluid leaks',
    guidanceImage: '🛑',
    guidance: 'Check: Brake pedal firmness, brake fluid level, no leaks under vehicle, handbrake operation. Press brake pedal - it should feel firm and not sink to the floor.',
    category: 'safety'
  },
  {
    id: 'tires',
    title: 'Tire Condition',
    description: 'Inspect all tires for wear, damage, and proper inflation',
    guidanceImage: '🛞',
    guidance: 'Look for: Tread depth (minimum 1.6mm), cuts or bulges, proper inflation, even wear patterns. Check tire pressure if gauge available. Look for objects stuck in tread.',
    category: 'safety'
  },
  {
    id: 'lights',
    title: 'Lighting System',
    description: 'Check all lights including headlights, taillights, and indicators',
    guidanceImage: '💡',
    guidance: 'Test: Headlights (high/low beam), taillights, brake lights, indicators, hazard lights. Ask someone to help or use reflective surfaces to check all lights work.',
    category: 'safety'
  },
  {
    id: 'mirrors',
    title: 'Mirrors and Visibility',
    description: 'Ensure all mirrors are clean, properly adjusted, and not damaged',
    guidanceImage: '🪞',
    guidance: 'Check: All mirrors clean and secure, no cracks, proper adjustment for visibility. Clean mirrors if dirty. Ensure side mirrors are properly positioned.',
    category: 'safety'
  },
  {
    id: 'seatbelts',
    title: 'Seatbelts and Safety',
    description: 'Test all seatbelts and safety equipment',
    guidanceImage: '🔒',
    guidance: 'Check: All seatbelts retract properly, buckles work, no fraying or damage. Test driver and passenger seatbelts. Check first aid kit and emergency equipment.',
    category: 'safety'
  }
];

export interface InspectionQuestion {
  id: string;
  title: string;
  description: string;
  guidanceImage: string;
  guidance: string;
  category: string;
}
