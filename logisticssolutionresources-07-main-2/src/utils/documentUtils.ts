
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'valid': return 'bg-green-100 text-green-800';
    case 'expiring_soon': return 'bg-yellow-100 text-yellow-800';
    case 'expired': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getCategoryColor = (category: string) => {
  switch (category.split(' - ')[0]) {
    case 'Driver Documents': return 'bg-blue-100 text-blue-800';
    case 'Vehicle Documents': return 'bg-purple-100 text-purple-800';
    case 'Compliance': return 'bg-orange-100 text-orange-800';
    case 'Route Documents': return 'bg-green-100 text-green-800';
    case 'Safety Documents': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const formatUploaderName = (profile: any) => {
  if (!profile) return 'Unknown';
  return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User';
};
