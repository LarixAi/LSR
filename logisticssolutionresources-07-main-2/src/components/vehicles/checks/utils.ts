
export const getConditionColor = (condition: string) => {
  switch (condition) {
    case 'excellent':
      return 'bg-green-100 text-green-800';
    case 'good':
      return 'bg-blue-100 text-blue-800';
    case 'fair':
      return 'bg-yellow-100 text-yellow-800';
    case 'poor':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'urgent':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getOverallCondition = (check: any) => {
  const conditions = [
    check.engine_condition,
    check.brakes_condition,
    check.tires_condition,
    check.lights_condition,
    check.interior_condition,
    check.exterior_condition,
  ];

  if (conditions.some(c => c === 'poor')) return 'poor';
  if (conditions.some(c => c === 'fair')) return 'fair';
  if (conditions.every(c => c === 'excellent')) return 'excellent';
  return 'good';
};
