import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database,
  Settings,
  RefreshCw,
  Info
} from 'lucide-react';

interface SystemCheck {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string;
}

export default function SystemDiagnostic() {
  const { profile } = useAuth();
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const newChecks: SystemCheck[] = [];

    // Check 1: Authentication
    newChecks.push({
      name: 'Authentication',
      status: profile ? 'success' : 'error',
      message: profile ? 'User is authenticated' : 'User is not authenticated',
      details: profile ? `User ID: ${profile.id}` : 'No profile found'
    });

    // Check 2: Organization ID
    newChecks.push({
      name: 'Organization ID',
      status: profile?.organization_id ? 'success' : 'warning',
      message: profile?.organization_id ? 'Organization ID is set' : 'Organization ID is not set',
      details: profile?.organization_id || 'No organization ID found'
    });

    // Check 3: User Role
    newChecks.push({
      name: 'User Role',
      status: profile?.role ? 'success' : 'warning',
      message: profile?.role ? 'User role is set' : 'User role is not set',
      details: profile?.role || 'No role found'
    });

    // Check 4: Development Server
    try {
      const response = await fetch('/');
      newChecks.push({
        name: 'Development Server',
        status: response.ok ? 'success' : 'error',
        message: response.ok ? 'Development server is running' : 'Development server is not responding',
        details: `Status: ${response.status}`
      });
    } catch (error) {
      newChecks.push({
        name: 'Development Server',
        status: 'error',
        message: 'Cannot connect to development server',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check 5: Supabase Connection (simulated)
    newChecks.push({
      name: 'Supabase Connection',
      status: 'warning',
      message: 'Supabase connection check disabled in diagnostic mode',
      details: 'This would check if Supabase client is properly configured'
    });

    // Check 6: Trial Management Hooks
    newChecks.push({
      name: 'Trial Management Hooks',
      status: 'warning',
      message: 'Trial management hooks are disabled in test mode',
      details: 'Hooks are available but not loaded to prevent errors'
    });

    setChecks(newChecks);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: SystemCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'loading':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: SystemCheck['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'loading':
        return <Badge variant="outline">Loading</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Diagnostic</h1>
          <p className="text-muted-foreground">Check system status and identify issues</p>
        </div>
        <Button onClick={runDiagnostics} disabled={isRunning}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Running...' : 'Run Diagnostics'}
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <div className="font-medium">Diagnostic Mode</div>
        <AlertDescription>
          This page helps identify what might be causing the "something unexpected happened" error.
          Run diagnostics to check system components.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {checks.map((check, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  <span>{check.name}</span>
                </div>
                {getStatusBadge(check.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{check.message}</p>
              {check.details && (
                <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                  {check.details}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">User ID</label>
              <p className="text-sm text-muted-foreground">{profile?.id || 'Not available'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Organization ID</label>
              <p className="text-sm text-muted-foreground">{profile?.organization_id || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">User Role</label>
              <p className="text-sm text-muted-foreground">{profile?.role || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{profile?.email || 'Not available'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">If you see errors:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Check if you're logged in properly</li>
                <li>• Verify your user has an organization_id set</li>
                <li>• Ensure the development server is running</li>
                <li>• Check browser console for JavaScript errors</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">If everything looks good:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Try accessing the trial test page again</li>
                <li>• Run the database migration in Supabase</li>
                <li>• Check if the error persists</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
