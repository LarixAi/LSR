import React, { createContext, useContext, ReactNode } from 'react';
import { useMobileAuth } from '@/hooks/useMobileAuth';
import { User, Session } from '@supabase/supabase-js';

interface MobileAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  verifyDevice: () => Promise<boolean>;
  createMobileSession: () => Promise<void>;
}

const MobileAuthContext = createContext<MobileAuthContextType | undefined>(undefined);

interface MobileAuthProviderProps {
  children: ReactNode;
}

export const MobileAuthProvider: React.FC<MobileAuthProviderProps> = ({ children }) => {
  const mobileAuth = useMobileAuth();

  return (
    <MobileAuthContext.Provider value={mobileAuth}>
      {children}
    </MobileAuthContext.Provider>
  );
};

export const useMobileAuthContext = () => {
  const context = useContext(MobileAuthContext);
  if (context === undefined) {
    throw new Error('useMobileAuthContext must be used within a MobileAuthProvider');
  }
  return context;
};