import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

export const AdminPasswordResetTool = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('reset_user_password_admin', {
        target_email: email
      });

      if (error) throw error;

      const result = data?.[0];
      if (result?.success) {
        toast({
          title: "Password Reset Initiated",
          description: `${result.message}. User will be prompted to change password on next login.`,
        });
        
        // Also send a password reset email
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
        
        if (!resetError) {
          toast({
            title: "Reset Email Sent",
            description: "Password reset email has been sent to the user.",
          });
        }
      } else {
        throw new Error(result?.message || 'Unknown error');
      }
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="mt-4 border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-sm text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Admin Password Reset Tool (Dev Only)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <Label htmlFor="resetEmail">User Email</Label>
            <Input
              id="resetEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            variant="destructive"
            size="sm"
          >
            {loading ? "Resetting..." : "Reset User Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};