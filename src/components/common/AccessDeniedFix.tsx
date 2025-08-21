import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { fixAccessDenied, checkAdminAccess } from '@/utils/fixAccessDenied';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AccessDeniedFixProps {
  userEmail?: string;
  onFixComplete?: () => void;
}

const AccessDeniedFix: React.FC<AccessDeniedFixProps> = ({ 
  userEmail, 
  onFixComplete 
}) => {
  const { user, refreshProfile } = useAuth();
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const targetEmail = userEmail || user?.email || '';

  const handleFixAccess = async () => {
    if (!targetEmail) {
      toast.error('No user email available');
      return;
    }

    setIsFixing(true);
    setFixResult(null);

    try {
      const result = await fixAccessDenied(targetEmail);
      
      setFixResult({
        success: result.success,
        message: result.message
      });

      if (result.success) {
        toast.success('Access fixed successfully!');
        
        // Refresh the profile data
        await refreshProfile();
        
        // Call the completion callback
        if (onFixComplete) {
          onFixComplete();
        }
        
        // Reload the page after a short delay to ensure changes take effect
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(`Failed to fix access: ${result.error || result.message}`);
      }
    } catch (error) {
      console.error('Error fixing access:', error);
      setFixResult({
        success: false,
        message: 'An unexpected error occurred'
      });
      toast.error('An unexpected error occurred while fixing access');
    } finally {
      setIsFixing(false);
    }
  };

  const checkCurrentAccess = async () => {
    const hasAccess = await checkAdminAccess();
    if (hasAccess) {
      toast.success('You already have admin access!');
    } else {
      toast.info('You do not have admin access. Click "Fix Access" to resolve this.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Access Denied</CardTitle>
        <CardDescription>
          You don't have permission to access this page. This can be fixed by ensuring you have the proper role.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fixResult && (
          <div className={`p-3 rounded-lg ${
            fixResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {fixResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              )}
              <span className={`text-sm ${
                fixResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {fixResult.message}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={handleFixAccess}
            disabled={isFixing}
            className="w-full"
            variant="default"
          >
            {isFixing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fixing Access...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Fix Access
              </>
            )}
          </Button>

          <Button 
            onClick={checkCurrentAccess}
            disabled={isFixing}
            variant="outline"
            className="w-full"
          >
            Check Current Access
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>Target Email: {targetEmail}</p>
          <p>This will update your role to admin if needed.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessDeniedFix;


