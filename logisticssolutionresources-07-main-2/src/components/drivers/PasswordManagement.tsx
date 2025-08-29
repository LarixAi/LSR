import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminUserManagement } from '@/hooks/useAdminUserManagement';
import { RefreshCw, Key, Users, Shield, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
interface Driver {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  must_change_password: boolean;
}

const PasswordManagement = () => {
  const { toast } = useToast();
  const { resetPassword, resetPasswordState } = useAdminUserManagement();
  const { profile } = useAuth();
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [resetType, setResetType] = useState<'admin_reset' | 'force_change'>('admin_reset');
  const [notes, setNotes] = useState('');
  const [resetResults, setResetResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

// Fetch drivers (scoped to admin's organization)
const { data: drivers, isLoading: driversLoading, refetch } = useQuery({
  queryKey: ['drivers-for-password-management', profile?.organization_id],
  queryFn: async () => {
    if (!profile?.organization_id) return [] as Driver[];
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, is_active, must_change_password, organization_id')
      .eq('role', 'driver')
      .eq('organization_id', profile.organization_id)
      .order('first_name');

    if (error) throw error;
    return (data || []) as Driver[];
  },
  enabled: !!profile?.organization_id
});

// Handle single password reset
const handleSingleReset = async (driverId: string) => {
  const driver = drivers?.find(d => d.id === driverId);
  const result: any = await resetPassword({
    targetUserId: driverId,
    targetEmail: driver?.email,
    forceMustChange: resetType === 'force_change'
  });
  
  if (result && typeof result === 'object' && result.success) {
    setResetResults([{
      name: `${driver?.first_name ?? ''} ${driver?.last_name ?? ''}`.trim(),
      email: driver?.email,
      success: true,
      temporaryPassword: result.temporaryPassword
    }]);
    setShowResults(true);
    refetch();
  } else {
    setResetResults([{
      name: `${driver?.first_name ?? ''} ${driver?.last_name ?? ''}`.trim(),
      email: driver?.email,
      success: false,
      error: result?.error || resetPasswordState.error || 'Failed to reset password'
    }]);
    setShowResults(true);
  }
};

// Handle bulk password reset
const handleBulkReset = async () => {
  if (selectedDrivers.length === 0) {
    toast({ title: "Error", description: "Please select at least one driver", variant: "destructive" });
    return;
  }

  const results: any[] = [];
  for (const driverId of selectedDrivers) {
    const driver = drivers?.find(d => d.id === driverId);
    const result: any = await resetPassword({
      targetUserId: driverId,
      targetEmail: driver?.email,
      forceMustChange: resetType === 'force_change'
    });

    results.push({
      name: `${driver?.first_name ?? ''} ${driver?.last_name ?? ''}`.trim(),
      email: driver?.email,
      success: !!(result && typeof result === 'object' && result.success),
      temporaryPassword: result && typeof result === 'object' ? result.temporaryPassword : undefined,
      error: result && typeof result === 'object' && !result.success ? (result.error || resetPasswordState.error) : undefined
    });
  }
  
  setResetResults(results);
  setShowResults(true);
  setSelectedDrivers([]);
  refetch();
};


  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDrivers(drivers?.map(d => d.id) || []);
    } else {
      setSelectedDrivers([]);
    }
  };

  const handleDriverSelect = (driverId: string, checked: boolean) => {
    if (checked) {
      setSelectedDrivers([...selectedDrivers, driverId]);
    } else {
      setSelectedDrivers(selectedDrivers.filter(id => id !== driverId));
    }
  };

if (driversLoading) {
  return (
    <div className="flex items-center justify-center p-8">
      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
      Loading drivers...
    </div>
  );
}

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Driver Password Management
          </CardTitle>
          <CardDescription>
            Reset driver passwords and manage security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reset Type Selection */}
          <div className="space-y-3">
            <Label>Reset Type</Label>
            <RadioGroup value={resetType} onValueChange={(value: any) => setResetType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin_reset" id="admin_reset" />
                <Label htmlFor="admin_reset">Standard Reset - New temporary password</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="force_change" id="force_change" />
                <Label htmlFor="force_change">Force Change - Require password change on next login</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Reason for password reset..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-4">
              <Checkbox
                id="select-all"
                checked={selectedDrivers.length === drivers?.length}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="font-medium">
                Select All ({selectedDrivers.length}/{drivers?.length || 0} selected)
              </Label>
            </div>
            <Button
              onClick={handleBulkReset}
              disabled={selectedDrivers.length === 0 || resetPasswordState.loading}
              variant="outline"
            >
              {resetPasswordState.loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Resetting...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Reset ({selectedDrivers.length})
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Drivers List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Drivers</CardTitle>
          <CardDescription>
            Select drivers for bulk operations or reset individual passwords
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {drivers?.map((driver) => (
              <div key={driver.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedDrivers.includes(driver.id)}
                    onCheckedChange={(checked) => handleDriverSelect(driver.id, checked as boolean)}
                  />
                  <div>
                    <div className="font-medium">
                      {driver.first_name} {driver.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {driver.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
{driver.must_change_password && (
  <Badge variant="outline" className="text-orange-600 border-orange-600">
    <AlertTriangle className="h-3 w-3 mr-1" />
    Must Change Password
  </Badge>
)}
                  {!driver.is_active && (
                    <Badge variant="secondary">
                      Inactive
                    </Badge>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Key className="h-4 w-4 mr-2" />
                        Reset Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                          Reset password for {driver.first_name} {driver.last_name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
<Alert>
  <AlertTriangle className="h-4 w-4" />
  <AlertDescription>
    This will generate a new temporary password and invalidate the current one.
    If the driver account doesn't exist yet, it will be created automatically.
  </AlertDescription>
</Alert>
<Button
  onClick={() => handleSingleReset(driver.id)}
  disabled={resetPasswordState.loading}
  className="w-full"
>
  {resetPasswordState.loading ? (
    <>
      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
      Resetting...
    </>
  ) : (
    'Confirm Reset'
  )}
</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Password Reset Results
            </DialogTitle>
<DialogDescription>
  Password reset operation completed. Review results below.
</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {resetResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">{result.email}</div>
                  </div>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "Success" : "Failed"}
                  </Badge>
                </div>
{result.success && result.temporaryPassword && (
  <div className="bg-muted p-3 rounded-lg">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium">Temporary Password:</span>
      <div className="flex items-center gap-2">
        <code className="bg-background px-2 py-1 rounded text-sm font-mono">
          {result.temporaryPassword}
        </code>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            navigator.clipboard.writeText(result.temporaryPassword);
            toast({
              title: "Success",
              description: "Password copied to clipboard",
            });
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
)}
{!result.success && result.error && (
  <div className="text-sm text-red-600 mt-2">
    Error: {result.error}
  </div>
)}
              </div>
            ))}
          </div>
          <Button onClick={() => setShowResults(false)} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PasswordManagement;