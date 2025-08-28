import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Shield, Copy } from 'lucide-react';

export const EmergencyRecovery = () => {
  const [email, setEmail] = useState('transport@nationalbusgroup.co.uk');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleEmergencyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('emergency-reset', {
        body: {
          email,
          adminSecret: secret
        }
      });

      if (error) throw error;

      if (data?.success) {
        setResult(data);
        toast({
          title: "Emergency Reset Complete",
          description: "A new temporary password has been generated and copied to clipboard",
        });
        
        // Securely copy password to clipboard
        navigator.clipboard.writeText(data.temporaryPassword);
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (error: any) {
      toast({
        title: "Emergency Reset Failed",
        description: error.message || 'Failed to reset password',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4 border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-sm text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Emergency Account Recovery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmergencyReset} className="space-y-4">
          <div>
            <Label htmlFor="email">Account Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="secret">Admin Secret</Label>
            <Input
              id="secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter admin secret"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            <Shield className="w-4 h-4 mr-2" />
            {loading ? "Resetting..." : "Emergency Reset"}
          </Button>
        </form>

        {result && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
            <div className="text-sm space-y-1">
              <div><strong>✅ Password Reset Complete!</strong></div>
              <div><strong>Email:</strong> {result.email}</div>
              <div><strong>New Password:</strong> 
                <code className="bg-white px-2 py-1 rounded font-mono">
                  {"•".repeat(result.temporaryPassword?.length || 8)}
                </code>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="ml-2" 
                  onClick={() => {
                    navigator.clipboard.writeText(result.temporaryPassword);
                    toast({ title: "Password copied to clipboard" });
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-green-700 text-xs mt-2">
                You can now login with this password. You'll be prompted to change it.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};