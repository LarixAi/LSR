
// Helper functions to extract payment info from description
export const extractPaymentType = (description: string): 'daily' | 'hourly' | 'set_price' | undefined => {
  const match = description.match(/Payment: £[\d.]+ \(([^)]+)\)/);
  if (!match) return undefined;
  
  const type = match[1].replace(' ', '_');
  if (type === 'daily' || type === 'hourly' || type === 'set_price') {
    return type as 'daily' | 'hourly' | 'set_price';
  }
  return undefined;
};

export const extractPaymentAmount = (description: string): number | undefined => {
  const match = description.match(/Payment: £([\d.]+)/);
  return match ? parseFloat(match[1]) : undefined;
};

export const createPaymentDescription = (
  description: string, 
  paymentType?: 'daily' | 'hourly' | 'set_price', 
  paymentAmount?: number
): string => {
  if (!paymentType || !paymentAmount) {
    return description || '';
  }
  
  const baseDescription = description || '';
  return `${baseDescription}\n\nPayment: £${paymentAmount} (${paymentType.replace('_', ' ')})`;
};
