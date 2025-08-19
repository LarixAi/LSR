import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, User, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { useAuth } from '@/contexts/AuthContext';

// Supabase configuration
const SUPABASE_URL = "https://dznbihypzmvcmradijqn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQ1NzQsImV4cCI6MjA3MDUzMDU3NH0.dS4mQBL0q_JhsZQF14KKB0nL2f3H--2hPoxXzitPOgo";

interface PasswordChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  driver: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    organization_id?: string;
  } | null;
}

export const PasswordChangeDialog: React.FC<PasswordChangeDialogProps> = ({
  isOpen,
  onClose,
  driver
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  const { canManagePasswords, organizationId } = useAdminPermissions();
  const { user } = useAuth();

  const handlePasswordChange = async () => {
    if (!driver || !canManagePasswords) return;

    // Check if driver belongs to the same organization
    if (driver.organization_id && driver.organization_id !== organizationId) {
      setError('You can only change passwords for drivers in your organization.');
      return;
    }

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmPasswordChange = async () => {
    if (!driver || !user) return;

    setIsLoading(true);
    setError('');

    try {
      // Validate that the driver exists and is accessible
      if (!driver.id) {
        throw new Error('Invalid driver selected. Please refresh the page and try again.');
      }

      // Double-check organization access before updating password
      if (driver.organization_id && driver.organization_id !== organizationId) {
        throw new Error('Access denied: You can only change passwords for drivers in your organization.');
      }

      console.log('Calling Edge Function with parameters:', {
        targetUserId: driver.id,
        adminUserId: user.id,
        hasNewPassword: !!newPassword
      });

      // Get the user's session for proper authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found. Please log in again.');
      }

      // First, try the Supabase client approach with proper authentication
      const { data, error } = await supabase.functions.invoke('change-user-password', {
        body: {
          targetUserId: driver.id,
          newPassword: newPassword,
          adminUserId: user.id
        }
      });

      console.log('Edge Function response:', { data, error });

      if (error) {
        console.error('Edge Function error:', error);
        
        // If we get a generic HTTP error, try a direct fetch to get the actual error
        if (error.message && error.message.includes('non-2xx status code')) {
          console.log('Attempting direct fetch to get detailed error...');
          
          try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/change-user-password`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                targetUserId: driver.id,
                newPassword: newPassword,
                adminUserId: user.id
              })
            });

            const responseText = await response.text();
            console.log('Direct fetch response:', {
              status: response.status,
              statusText: response.statusText,
              body: responseText
            });

            if (!response.ok) {
              const errorData = JSON.parse(responseText);
              
              // Handle specific error cases
              if (errorData.error && errorData.error.includes('Target user not found')) {
                throw new Error('The selected driver no longer exists. Please refresh the page and try again.');
              }
              
              if (errorData.error && errorData.error.includes('User not found in authentication system')) {
                console.log('User not found in Auth, attempting to create Auth user...');
                
                const createResponse = await fetch(`${SUPABASE_URL}/functions/v1/create-missing-auth-user`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify({
                    profileId: driver.id,
                    adminUserId: user.id
                  })
                });

                const createResponseText = await createResponse.text();
                console.log('Create Auth user response:', {
                  status: createResponse.status,
                  body: createResponseText
                });

                if (createResponse.ok) {
                  console.log('Auth user created successfully, now trying password change again...');
                  
                  // Try the password change again
                  const retryResponse = await fetch(`${SUPABASE_URL}/functions/v1/change-user-password`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                      targetUserId: driver.id,
                      newPassword: newPassword,
                      adminUserId: user.id
                    })
                  });

                  const retryResponseText = await retryResponse.text();
                  console.log('Retry password change response:', {
                    status: retryResponse.status,
                    body: retryResponseText
                  });

                  if (!retryResponse.ok) {
                    throw new Error(`Password change failed after creating Auth user: ${retryResponse.status} ${retryResponse.statusText} - ${retryResponseText}`);
                  }

                  // Success!
                  toast({
                    title: 'Password Updated',
                    description: `Password for ${driver.email} has been successfully updated.`,
                  });

                  // Reset form
                  setNewPassword('');
                  setConfirmPassword('');
                  setShowConfirmation(false);
                  onClose();
                  return;
                } else {
                  throw new Error(`Failed to create Auth user: ${createResponse.status} ${createResponse.statusText} - ${createResponseText}`);
                }
              } else {
                throw new Error(`Password change failed: ${response.status} ${response.statusText} - ${responseText}`);
              }
            }
          } catch (fetchError) {
            console.error('Direct fetch also failed:', fetchError);
            throw new Error('Password change failed. Please check the Edge Function logs for details.');
          }
        } else {
          throw error;
        }
      }

      if (data?.error) {
        console.error('Edge Function data error:', data.error);
        throw new Error(data.error);
      }

      toast({
        title: 'Password Updated',
        description: `Password for ${driver.email} has been successfully updated.`,
      });

      // Reset form
      setNewPassword('');
      setConfirmPassword('');
      setShowConfirmation(false);
      onClose();
    } catch (error) {
      console.error('Error updating password:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        data: error.data
      });
      
      // If the error suggests the driver list might be stale, suggest refreshing
      if (error.message && (
        error.message.includes('no longer exists') || 
        error.message.includes('Invalid driver selected') ||
        error.message.includes('Target user not found')
      )) {
        setError(`${error.message} The driver list may be outdated. Please refresh the page.`);
      } else {
        setError(error.message || 'Failed to update password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowConfirmation(false);
    onClose();
  };

  if (!driver || !canManagePasswords) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Driver Password
          </DialogTitle>
          <DialogDescription>
            Update the password for{' '}
            <span className="font-medium">
              {driver.first_name} {driver.last_name}
            </span>{' '}
            ({driver.email})
          </DialogDescription>
        </DialogHeader>

        {!showConfirmation ? (
          <>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>• Password must be at least 6 characters long</p>
                <p>• The driver will need to use this password to log in</p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                onClick={handlePasswordChange} 
                disabled={isLoading || !newPassword || !confirmPassword}
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Are you sure you want to change the password for{' '}
                  <span className="font-medium">
                    {driver.first_name} {driver.last_name}
                  </span>?
                  <br />
                  <br />
                  This action will immediately update their login credentials.
                  They will need to use the new password to access their account.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setShowConfirmation(false)} disabled={isLoading}>
                Back
              </Button>
              <Button 
                onClick={confirmPasswordChange} 
                disabled={isLoading}
                variant="destructive"
              >
                {isLoading ? 'Updating...' : 'Confirm Password Change'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
