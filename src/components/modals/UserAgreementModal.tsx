import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useUserAgreements, UserAgreement } from '@/hooks/useUserAgreements';
import { cn } from '@/lib/utils';

interface UserAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgreementsAccepted?: () => void;
}

const UserAgreementModal: React.FC<UserAgreementModalProps> = ({
  isOpen,
  onClose,
  onAgreementsAccepted
}) => {
  const {
    agreementStatus,
    agreements,
    isLoadingStatus,
    isLoadingAgreements,
    isAccepting,
    acceptTermsOfService,
    acceptPrivacyPolicy,
    getAgreementByType
  } = useUserAgreements();

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [activeTab, setActiveTab] = useState('terms');

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setAcceptedTerms(false);
      setAcceptedPrivacy(false);
      setActiveTab('terms');
    }
  }, [isOpen]);

  const termsAgreement = getAgreementByType('terms_of_service');
  const privacyAgreement = getAgreementByType('privacy_policy');

  const needsTerms = agreementStatus?.needs_terms_acceptance;
  const needsPrivacy = agreementStatus?.needs_privacy_acceptance;

  const canAcceptAll = (needsTerms ? acceptedTerms : true) && (needsPrivacy ? acceptedPrivacy : true);

  const handleAcceptAll = async () => {
    try {
      if (needsTerms && acceptedTerms) {
        await acceptTermsOfService();
      }
      if (needsPrivacy && acceptedPrivacy) {
        await acceptPrivacyPolicy();
      }
      
      onAgreementsAccepted?.();
      onClose();
    } catch (error) {
      console.error('Failed to accept agreements:', error);
    }
  };

  const renderAgreementContent = (agreement: UserAgreement | undefined) => {
    if (!agreement) {
      return (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mr-2" />
          Agreement not found
        </div>
      );
    }

    // Convert markdown-like content to HTML (simple conversion)
    const content = agreement.content
      .replace(/## (.*)/g, '<h2 class="text-xl font-semibold mb-4">$1</h2>')
      .replace(/### (.*)/g, '<h3 class="text-lg font-medium mb-3">$1</h3>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*)\*/g, '<em>$1</em>')
      .replace(/- (.*)/g, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/^/, '<p class="mb-3">')
      .replace(/$/, '</p>');

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{agreement.title}</h2>
            <p className="text-sm text-muted-foreground">
              Version {agreement.version} • Effective {new Date(agreement.effective_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <ScrollArea className="h-96 w-full border rounded-md p-4">
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </ScrollArea>
      </div>
    );
  };

  if (isLoadingStatus || isLoadingAgreements) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Loading Agreements...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            User Agreements
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Alert for required agreements */}
          {(needsTerms || needsPrivacy) && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please review and accept the following agreements to continue using the application.
              </AlertDescription>
            </Alert>
          )}

          {/* Agreement Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="terms" 
                className={cn(
                  "flex items-center gap-2",
                  needsTerms && "data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800"
                )}
              >
                <FileText className="h-4 w-4" />
                Terms of Service
                {needsTerms && <AlertTriangle className="h-3 w-3 text-orange-600" />}
              </TabsTrigger>
              <TabsTrigger 
                value="privacy"
                className={cn(
                  "flex items-center gap-2",
                  needsPrivacy && "data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800"
                )}
              >
                <Shield className="h-4 w-4" />
                Privacy Policy
                {needsPrivacy && <AlertTriangle className="h-3 w-3 text-orange-600" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="terms" className="mt-4">
              {renderAgreementContent(termsAgreement)}
              
              {needsTerms && (
                <div className="flex items-center space-x-2 mt-4 p-4 border rounded-lg bg-orange-50">
                  <Checkbox
                    id="accept-terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <Label htmlFor="accept-terms" className="text-sm font-medium">
                    I have read and agree to the Terms of Service
                  </Label>
                </div>
              )}
            </TabsContent>

            <TabsContent value="privacy" className="mt-4">
              {renderAgreementContent(privacyAgreement)}
              
              {needsPrivacy && (
                <div className="flex items-center space-x-2 mt-4 p-4 border rounded-lg bg-orange-50">
                  <Checkbox
                    id="accept-privacy"
                    checked={acceptedPrivacy}
                    onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                  />
                  <Label htmlFor="accept-privacy" className="text-sm font-medium">
                    I have read and agree to the Privacy Policy
                  </Label>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isAccepting}>
              Cancel
            </Button>
            <Button 
              onClick={handleAcceptAll}
              disabled={!canAcceptAll || isAccepting}
              className="flex items-center gap-2"
            >
              {isAccepting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Accept All
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserAgreementModal;
