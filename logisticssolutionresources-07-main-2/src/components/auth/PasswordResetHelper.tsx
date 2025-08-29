import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Mail } from 'lucide-react';

export const PasswordResetHelper = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        'transport@nationalbusgroup.co.uk',
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      );

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
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

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Password Reset Helper
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-blue-700">
          Having trouble logging in? Try these temporary credentials or reset your password:
        </div>
        
        <div className="bg-white rounded p-3 border border-blue-200">
          <div className="text-xs font-mono space-y-1">
            <div><strong>Email:</strong> transport@nationalbusgroup.co.uk</div>
            <div><strong>Try Password:</strong> TempPass123!</div>
            <div><strong>Or Password:</strong> admin123</div>
            <div><strong>Or Password:</strong> password123</div>
          </div>
        </div>

        <Button 
          onClick={handlePasswordReset}
          disabled={loading}
          size="sm"
          className="w-full"
        >
          {loading ? "Sending..." : "Send Password Reset Email"}
        </Button>
        
        <div className="text-xs text-blue-600">
          💡 If none of these work, use the password reset email option above.
        </div>
      </CardContent>
    </Card>
  );
};