import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PasswordChangeDialog from './PasswordChangeDialog';

interface PasswordChangeWrapperProps {
  children: React.ReactNode;
}

const PasswordChangeWrapper = ({ children }: PasswordChangeWrapperProps) => {
  const { profile, refreshProfile } = useAuth();
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    // Check if user needs to change password
    if (profile?.must_change_password === true) {
      setShowPasswordChange(true);
    } else {
      setShowPasswordChange(false);
    }
  }, [profile?.must_change_password]);

  const handlePasswordChangeSuccess = async () => {
    setShowPasswordChange(false);
    // Refresh the profile to get updated must_change_password status
    await refreshProfile();
  };

  return (
    <>
      {children}
      <PasswordChangeDialog 
        open={showPasswordChange} 
        onSuccess={handlePasswordChangeSuccess} 
      />
    </>
  );
};

export default PasswordChangeWrapper;