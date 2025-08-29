import React from 'react';

interface SecurityProviderProps {
  children: React.ReactNode;
}

// Simplified SecurityProvider that just passes through children
export function SecurityProvider({ children }: SecurityProviderProps) {
  return <>{children}</>;
}