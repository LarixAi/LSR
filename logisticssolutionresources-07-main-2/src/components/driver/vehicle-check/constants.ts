
import { Car, CheckCircle, FileText } from 'lucide-react';
import { ConditionOption, CheckStep } from './types';

export const conditionOptions: ConditionOption[] = [
  { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-800' },
  { value: 'good', label: 'Good', color: 'bg-blue-100 text-blue-800' },
  { value: 'fair', label: 'Fair', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'poor', label: 'Poor', color: 'bg-red-100 text-red-800' },
  { value: 'not_present', label: 'Not Present', color: 'bg-gray-100 text-gray-800' },
];

export const commonIssues = [
  'Engine noise', 'Oil leak', 'Coolant leak', 'Brake issues', 'Tire wear',
  'Light malfunction', 'Battery issues', 'Electrical problems', 'Body damage',
  'Interior damage', 'Missing equipment', 'Documentation issues', 'AC/Heating issues'
];

export const checkSteps: CheckStep[] = [
  { title: 'Vehicle Selection', icon: Car },
  { title: 'Vehicle Information', icon: FileText },
  { title: 'Basic Info', icon: FileText },
  { title: 'Engine & Fluids', icon: Car },
  { title: 'Brakes & Tires', icon: Car },
  { title: 'Lights & Electrical', icon: Car },
  { title: 'Safety & Interior', icon: Car },
  { title: 'Exterior & Docs', icon: Car },
  { title: 'Issues & Review', icon: CheckCircle },
];
