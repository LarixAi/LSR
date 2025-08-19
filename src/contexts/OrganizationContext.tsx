import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface OrganizationContextType {
  selectedOrganizationId: string | null;
  setSelectedOrganizationId: (orgId: string | null) => void;
  isOrganizationSelectorVisible: boolean;
  setIsOrganizationSelectorVisible: (visible: boolean) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [isOrganizationSelectorVisible, setIsOrganizationSelectorVisible] = useState(false);

  // Reset organization selection when user changes
  useEffect(() => {
    if (profile?.role !== 'mechanic') {
      setSelectedOrganizationId(null);
      setIsOrganizationSelectorVisible(false);
    }
  }, [profile?.id, profile?.role]);

  // For non-mechanics, use their direct organization_id
  useEffect(() => {
    if (profile?.role !== 'mechanic' && profile?.organization_id) {
      setSelectedOrganizationId(profile.organization_id);
    }
  }, [profile?.organization_id, profile?.role]);

  const value = {
    selectedOrganizationId,
    setSelectedOrganizationId,
    isOrganizationSelectorVisible,
    setIsOrganizationSelectorVisible,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
