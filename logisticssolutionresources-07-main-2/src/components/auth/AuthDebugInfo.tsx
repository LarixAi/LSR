import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { testNetworkConnectivity } from '@/utils/networkTest';

export const AuthDebugInfo = () => {
  const { user, profile, session } = useAuth();
  const [networkStatus, setNetworkStatus] = useState<any[]>([]);
  const [testingNetwork, setTestingNetwork] = useState(false);

  const runNetworkTest = async () => {
    setTestingNetwork(true);
    const results = await testNetworkConnectivity();
    setNetworkStatus(results);
    setTestingNetwork(false);
  };

  useEffect(() => {
    // Auto-run network test if we detect issues
    if (process.env.NODE_ENV === 'development') {
      setTimeout(runNetworkTest, 1000);
    }
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="mt-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800">Auth Debug Info (Dev Only)</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>User:</strong> {user ? `${user.email} (ID: ${user.id})` : 'None'}
        </div>
        <div>
          <strong>Session:</strong> {session ? 'Active' : 'None'}
        </div>
        <div>
          <strong>Profile:</strong> {profile ? `${profile.first_name} ${profile.last_name} (${profile.role})` : 'None'}
        </div>
        <div>
          <strong>Must Change Password:</strong> {profile?.must_change_password ? 'Yes' : 'No'}
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <strong>Network Status:</strong>
            <Button 
              onClick={runNetworkTest} 
              disabled={testingNetwork}
              size="sm"
              variant="outline"
            >
              {testingNetwork ? 'Testing...' : 'Test Network'}
            </Button>
          </div>
          {networkStatus.length > 0 && (
            <div className="space-y-1 text-xs">
              {networkStatus.map((result, index) => (
                <div key={index} className="flex justify-between">
                  <span>{result.name}:</span>
                  <span className={result.status === 'OK' ? 'text-green-600' : 'text-red-600'}>
                    {result.status} {result.error && `(${result.error})`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};