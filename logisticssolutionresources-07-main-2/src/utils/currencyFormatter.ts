// Currency formatting utilities for UK operations

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCurrencyCompact = (amount: number): string => {
  if (amount >= 1000000) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      notation: 'compact',
      compactDisplay: 'short',
    }).format(amount);
  }
  
  return formatCurrency(amount);
};

export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbol and convert to number
  const cleaned = currencyString.replace(/[£,\s]/g, '');
  return parseFloat(cleaned) || 0;
};