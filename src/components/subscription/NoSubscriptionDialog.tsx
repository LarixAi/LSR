import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard, ArrowUpRight, Shield, Zap, CheckCircle } from 'lucide-react';

interface NoSubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const NoSubscriptionDialog: React.FC<NoSubscriptionDialogProps> = ({
  isOpen,
  onClose,
  onUpgrade
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg animate-in fade-in-0 zoom-in-95 duration-200" aria-describedby="subscription-required-desc">
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl flex items-center justify-center mb-4 shadow-md">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">Subscription Required</DialogTitle>
          <DialogDescription id="subscription-required-desc" className="text-base text-gray-600 mt-2">
            Access payment settings and manage your billing with an active subscription
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Feature Cards */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:border-gray-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Management</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Securely manage payment methods, view billing history, and handle subscription changes 
                    with our comprehensive payment dashboard.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:border-gray-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Security & Compliance</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    We verify subscription status to ensure secure access to sensitive payment 
                    information and maintain compliance standards.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-gray-600" />
              What you'll get with a subscription:
            </h4>
                      <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-700">Start with our 30-day free trial (Starter plan)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-700">Full payment method management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-700">Detailed billing history and invoices</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-700">Upgrade to Professional or Enterprise anytime</span>
            </div>
          </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Maybe Later
          </Button>
          <Button onClick={onUpgrade} className="flex-1 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Choose a Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
