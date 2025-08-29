import React from 'react';
import { useAdminUserManagement } from '@/hooks/useAdminUserManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const AdminDiagnostics: React.FC = () => {
  const { getDiagnosticInfo, auditUserSync, getOperationLogs } = useAdminUserManagement();
  const { toast } = useToast();
  const [auditResults, setAuditResults] = React.useState<any[] | null>(null);
  const [operationLogs, setOperationLogs] = React.useState<any[] | null>(null);
  const [loading, setLoading] = React.useState(false);

  const diagnostics = getDiagnosticInfo();

  const runAudit = async () => {
    setLoading(true);
    try {
      const results = await auditUserSync();
      setAuditResults(results);
      
      if (results?.length === 0) {
        toast({
          title: "Audit Complete",
          description: "No auth/profile sync issues found.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadOperationLogs = async () => {
    setLoading(true);
    try {
      const logs = await getOperationLogs(20);
      setOperationLogs(logs);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (value: boolean | string | null | undefined, type: 'boolean' | 'string' = 'boolean') => {
    if (type === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'destructive'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    }
    
    return (
      <Badge variant={value ? 'default' : 'secondary'}>
        {value || 'None'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Admin Backend Diagnostics</h2>
        <p className="text-muted-foreground">
          Diagnostic information for troubleshooting admin authentication and user management issues.
        </p>
      </div>

      {/* Admin Access Status */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Access Status</CardTitle>
          <CardDescription>Current authentication and permission status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-1">Has User</span>
              {getStatusBadge(diagnostics.adminAccess.hasUser)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-1">Has Profile</span>
              {getStatusBadge(diagnostics.adminAccess.hasProfile)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-1">Is Admin</span>
              {getStatusBadge(diagnostics.adminAccess.isUserAdmin)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-1">Loading</span>
              {getStatusBadge(diagnostics.adminAccess.loading)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-1">User Role</span>
              {getStatusBadge(diagnostics.adminAccess.userRole, 'string')}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-1">Organization ID</span>
              {getStatusBadge(diagnostics.adminAccess.organizationId ? 'Set' : null, 'string')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Status */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Status</CardTitle>
          <CardDescription>Current user management permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-1">Can Create Users</span>
              {getStatusBadge(diagnostics.canCreateUsers)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-1">Can Reset Passwords</span>
              {getStatusBadge(diagnostics.canResetPasswords)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-1">Can Audit Users</span>
              {getStatusBadge(diagnostics.canAuditUsers)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operation States */}
      <Card>
        <CardHeader>
          <CardTitle>Operation States</CardTitle>
          <CardDescription>Current status of user management operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">Create User State</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>Loading: {getStatusBadge(diagnostics.createUserState.loading)}</div>
                <div>Success: {getStatusBadge(diagnostics.createUserState.success)}</div>
                <div>Error: {diagnostics.createUserState.error ? 
                  <Badge variant="destructive">{diagnostics.createUserState.error}</Badge> : 
                  getStatusBadge(null, 'string')
                }</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Reset Password State</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>Loading: {getStatusBadge(diagnostics.resetPasswordState.loading)}</div>
                <div>Success: {getStatusBadge(diagnostics.resetPasswordState.success)}</div>
                <div>Error: {diagnostics.resetPasswordState.error ? 
                  <Badge variant="destructive">{diagnostics.resetPasswordState.error}</Badge> : 
                  getStatusBadge(null, 'string')
                }</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Actions</CardTitle>
          <CardDescription>Tools to diagnose and fix authentication issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runAudit} disabled={loading || !diagnostics.canAuditUsers}>
              {loading ? 'Running...' : 'Run User Sync Audit'}
            </Button>
            <Button onClick={loadOperationLogs} disabled={loading || !diagnostics.canAuditUsers} variant="outline">
              {loading ? 'Loading...' : 'Load Recent Operations'}
            </Button>
          </div>

          {auditResults && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Audit Results ({auditResults.length} users checked)</h4>
              <div className="max-h-60 overflow-y-auto border rounded p-4">
                {auditResults.length === 0 ? (
                  <p className="text-muted-foreground">No issues found</p>
                ) : (
                  auditResults.map((result, index) => (
                    <div key={index} className="mb-2 p-2 border-l-4 border-l-yellow-500 bg-yellow-50">
                      <div className="font-medium">{result.profile_email}</div>
                      <div className="text-sm text-muted-foreground">
                        Action: {result.recommended_action} | Status: {result.sync_status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {operationLogs && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Recent Operations ({operationLogs.length} logs)</h4>
              <div className="max-h-60 overflow-y-auto border rounded p-4">
                {operationLogs.map((log, index) => (
                  <div key={index} className="mb-2 p-2 border rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{log.operation_type}</div>
                        <div className="text-sm text-muted-foreground">
                          {log.target_email} - {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant={log.success ? 'default' : 'destructive'}>
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    {log.error_details && (
                      <div className="text-sm text-red-600 mt-1">{log.error_details}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};