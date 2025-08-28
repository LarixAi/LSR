
import type { ComplianceStandard } from '@/hooks/useCompliance';

export interface VehicleCheckCompliance {
  complianceScore: number;
  complianceStatus: 'compliant' | 'non_compliant' | 'warning' | 'critical';
  regulatoryNotes: string[];
  nextInspectionDue: string;
}

export const calculateComplianceScore = (
  vehicleCheckData: any,
  complianceStandards: ComplianceStandard[]
): VehicleCheckCompliance => {
  let totalScore = 100;
  const regulatoryNotes: string[] = [];
  const issuesFound: string[] = [];

  // Check each vehicle condition against standards
  const conditions = [
    { condition: vehicleCheckData.engine_condition, category: 'Vehicle Safety', type: 'Engine' },
    { condition: vehicleCheckData.brakes_condition, category: 'Vehicle Safety', type: 'Brakes' },
    { condition: vehicleCheckData.tires_condition, category: 'Vehicle Safety', type: 'Tires' },
    { condition: vehicleCheckData.lights_condition, category: 'Vehicle Safety', type: 'Lights' },
    { condition: vehicleCheckData.interior_condition, category: 'Vehicle Safety', type: 'Interior' },
    { condition: vehicleCheckData.exterior_condition, category: 'Vehicle Safety', type: 'Exterior' },
  ];

  conditions.forEach(({ condition, category, type }) => {
    if (condition === 'poor') {
      const standard = complianceStandards.find(s => 
        s.category === category && s.requirement_name.toLowerCase().includes(type.toLowerCase())
      );
      if (standard) {
        totalScore -= standard.points_deduction;
        regulatoryNotes.push(`${type} condition is poor - ${standard.regulation_reference || 'Compliance violation'}`);
        issuesFound.push(type);
      } else {
        totalScore -= 15; // Default deduction
        regulatoryNotes.push(`${type} condition is poor - requires immediate attention`);
        issuesFound.push(type);
      }
    } else if (condition === 'fair') {
      totalScore -= 5; // Minor deduction for fair condition
      regulatoryNotes.push(`${type} condition is fair - monitor closely`);
    }
  });

  // Check for reported issues
  if (vehicleCheckData.issues_reported && vehicleCheckData.issues_reported.length > 0) {
    vehicleCheckData.issues_reported.forEach((issue: string) => {
      totalScore -= 10; // Deduction per reported issue
      regulatoryNotes.push(`Reported issue: ${issue}`);
    });
  }

  // Determine compliance status
  let complianceStatus: 'compliant' | 'non_compliant' | 'warning' | 'critical';
  if (totalScore >= 90) {
    complianceStatus = 'compliant';
  } else if (totalScore >= 70) {
    complianceStatus = 'warning';
  } else if (totalScore >= 50) {
    complianceStatus = 'non_compliant';
  } else {
    complianceStatus = 'critical';
  }

  // Calculate next inspection due date
  const today = new Date();
  const nextInspectionDue = new Date(today);
  
  if (complianceStatus === 'critical') {
    nextInspectionDue.setDate(today.getDate() + 1); // Next day for critical
  } else if (complianceStatus === 'non_compliant') {
    nextInspectionDue.setDate(today.getDate() + 3); // 3 days for non-compliant
  } else if (complianceStatus === 'warning') {
    nextInspectionDue.setDate(today.getDate() + 7); // 1 week for warning
  } else {
    nextInspectionDue.setDate(today.getDate() + 30); // 30 days for compliant
  }

  return {
    complianceScore: Math.max(0, totalScore),
    complianceStatus,
    regulatoryNotes,
    nextInspectionDue: nextInspectionDue.toISOString().split('T')[0],
  };
};

export const getRiskLevelFromScore = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (score >= 90) return 'low';
  if (score >= 70) return 'medium';
  if (score >= 50) return 'high';
  return 'critical';
};

export const getComplianceStatusColor = (status: string): string => {
  switch (status) {
    case 'compliant':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'non_compliant':
      return 'bg-orange-100 text-orange-800';
    case 'critical':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
