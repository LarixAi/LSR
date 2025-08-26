import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserAgreements } from '@/hooks/useUserAgreements';
import { useAuth } from '@/contexts/AuthContext';
import UserAgreementModal from '@/components/modals/UserAgreementModal';

const UserAgreementTest: React.FC = () => {
  const { user, profile } = useAuth();
  const {
    agreementStatus,
    needsAgreementAcceptance,
    isLoadingStatus,
    isLoadingAgreements,
    acceptTermsOfService,
    acceptPrivacyPolicy,
    refetchStatus
  } = useUserAgreements();

  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleAgreementsAccepted = () => {
    setShowModal(false);
    refetchStatus();
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Agreement Test Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">User Information</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>ID:</strong> {user?.id}</p>
                <p><strong>Role:</strong> {profile?.role}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Profile Agreement Status</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Terms Accepted:</strong> 
                  <Badge variant={profile?.terms_accepted ? "default" : "destructive"} className="ml-2">
                    {profile?.terms_accepted ? "Yes" : "No"}
                  </Badge>
                </p>
                <p>
                  <strong>Privacy Accepted:</strong> 
                  <Badge variant={profile?.privacy_policy_accepted ? "default" : "destructive"} className="ml-2">
                    {profile?.privacy_policy_accepted ? "Yes" : "No"}
                  </Badge>
                </p>
                <p><strong>Terms Version:</strong> {profile?.terms_version || "None"}</p>
                <p><strong>Privacy Version:</strong> {profile?.privacy_policy_version || "None"}</p>
              </div>
            </div>
          </div>

          {/* Agreement Status */}
          <div>
            <h3 className="font-semibold mb-2">Current Agreement Status</h3>
            <div className="space-y-2">
              {isLoadingStatus ? (
                <p className="text-muted-foreground">Loading agreement status...</p>
              ) : agreementStatus ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p>
                      <strong>Needs Terms:</strong> 
                      <Badge variant={agreementStatus.needs_terms_acceptance ? "destructive" : "default"} className="ml-2">
                        {agreementStatus.needs_terms_acceptance ? "Yes" : "No"}
                      </Badge>
                    </p>
                    <p><strong>Latest Terms Version:</strong> {agreementStatus.latest_terms_version || "None"}</p>
                  </div>
                  <div>
                    <p>
                      <strong>Needs Privacy:</strong> 
                      <Badge variant={agreementStatus.needs_privacy_acceptance ? "destructive" : "default"} className="ml-2">
                        {agreementStatus.needs_privacy_acceptance ? "Yes" : "No"}
                      </Badge>
                    </p>
                    <p><strong>Latest Privacy Version:</strong> {agreementStatus.latest_privacy_version || "None"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No agreement status available</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <h3 className="font-semibold">Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleShowModal} variant="default">
                Show Agreement Modal
              </Button>
              <Button onClick={refetchStatus} variant="outline">
                Refresh Status
              </Button>
              <Button 
                onClick={acceptTermsOfService} 
                variant="outline"
                disabled={!agreementStatus?.needs_terms_acceptance}
              >
                Accept Terms Only
              </Button>
              <Button 
                onClick={acceptPrivacyPolicy} 
                variant="outline"
                disabled={!agreementStatus?.needs_privacy_acceptance}
              >
                Accept Privacy Only
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Summary</h3>
            <p>
              <strong>Needs Agreement Acceptance:</strong> 
              <Badge variant={needsAgreementAcceptance ? "destructive" : "default"} className="ml-2">
                {needsAgreementAcceptance ? "Yes" : "No"}
              </Badge>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This test panel allows you to manually trigger and test the user agreement functionality.
              Use the "Show Agreement Modal" button to test the full agreement flow.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Agreement Modal */}
      <UserAgreementModal
        isOpen={showModal}
        onClose={handleModalClose}
        onAgreementsAccepted={handleAgreementsAccepted}
      />
    </div>
  );
};

export default UserAgreementTest;
