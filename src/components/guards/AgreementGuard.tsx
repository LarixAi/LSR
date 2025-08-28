import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserAgreements } from '@/hooks/useUserAgreements';
import UserAgreementModal from '@/components/modals/UserAgreementModal';

interface AgreementGuardProps {
  children: React.ReactNode;
  showOnFirstLogin?: boolean;
}

const AgreementGuard: React.FC<AgreementGuardProps> = ({ 
  children, 
  showOnFirstLogin = true 
}) => {
  const { user, profile } = useAuth();
  const { 
    agreementStatus, 
    needsAgreementAcceptance, 
    isLoadingStatus,
    refetchStatus 
  } = useUserAgreements();
  
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [hasCheckedAgreements, setHasCheckedAgreements] = useState(false);

  // TEMPORARY: Bypass agreement check for testing
  const bypassAgreements = true; // Set to false to re-enable agreement checks

  // Check if user needs to accept agreements
  useEffect(() => {
    if (bypassAgreements) {
      setHasCheckedAgreements(true);
      return;
    }

    if (!user || isLoadingStatus) return;

    // If user has no profile yet, wait for it to load
    if (!profile) return;

    // Check if this is the first login (no terms accepted yet)
    const isFirstLogin = !profile.terms_accepted && !profile.privacy_policy_accepted;
    
    // Show modal if:
    // 1. User needs to accept agreements AND
    // 2. Either it's their first login OR showOnFirstLogin is false (show always)
    if (needsAgreementAcceptance && (isFirstLogin || !showOnFirstLogin)) {
      setShowAgreementModal(true);
    }
    
    setHasCheckedAgreements(true);
  }, [user, profile, needsAgreementAcceptance, isLoadingStatus, showOnFirstLogin, bypassAgreements]);

  const handleAgreementsAccepted = () => {
    setShowAgreementModal(false);
    // Refetch status to update the state
    refetchStatus();
  };

  const handleModalClose = () => {
    // Only allow closing if user doesn't need to accept agreements
    if (!needsAgreementAcceptance) {
      setShowAgreementModal(false);
    }
  };

  // Show loading while checking agreements
  if (!hasCheckedAgreements || (isLoadingStatus && !bypassAgreements)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Checking agreements...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <UserAgreementModal
        isOpen={showAgreementModal}
        onClose={handleModalClose}
        onAgreementsAccepted={handleAgreementsAccepted}
      />
    </>
  );
};

export default AgreementGuard;
