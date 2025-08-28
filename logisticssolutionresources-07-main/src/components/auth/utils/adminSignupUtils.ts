
// Helper function to convert Json features to string array
export const convertFeaturesToStringArray = (features: unknown): string[] => {
  if (Array.isArray(features)) {
    return features.map(f => String(f));
  }
  if (typeof features === 'string') {
    return [features];
  }
  if (features && typeof features === 'object') {
    return Object.values(features).map(f => String(f));
  }
  return [];
};

interface AdminFormData {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phone?: string;
  message?: string;
}

interface SelectedPlan {
  id: string;
  name: string;
  price?: number;
}

export const simulateAdminRequestSubmission = async (formData: AdminFormData, selectedPlan: SelectedPlan) => {
  // For now, just simulate success since we removed the approval system
  // In a real implementation, this would send an email or create a lead in your CRM
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Admin signup request:', {
    ...formData,
    selectedPlan: selectedPlan.name
  });
};
