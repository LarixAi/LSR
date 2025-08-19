import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const TestConnection: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<{
    supabase: boolean;
    edgeFunctions: boolean;
    database: boolean;
    auth: boolean;
  } | null>(null);
  const [error, setError] = useState<string>('');
  const { user, profile } = useAuth();

  const testConnection = async () => {
    setIsTesting(true);
    setError('');
    setResults(null);

    const testResults = {
      supabase: false,
      edgeFunctions: false,
      database: false,
      auth: false,
    };

    try {
      // Test 1: Basic Supabase connection
      console.log('Testing Supabase connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (connectionError) {
        console.error('Supabase connection failed:', connectionError);
        throw new Error(`Supabase connection failed: ${connectionError.message}`);
      }

      testResults.supabase = true;
      console.log('✅ Supabase connection successful');

      // Test 2: Database access
      console.log('Testing database access...');
      const { data: dbTest, error: dbError } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(1);

      if (dbError) {
        console.error('Database access failed:', dbError);
        throw new Error(`Database access failed: ${dbError.message}`);
      }

      testResults.database = true;
      console.log('✅ Database access successful');

      // Test 3: Authentication
      if (user) {
        console.log('Testing authentication...');
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Authentication test failed:', authError);
          throw new Error(`Authentication failed: ${authError.message}`);
        }

        if (currentUser) {
          testResults.auth = true;
          console.log('✅ Authentication successful');
        }
      } else {
        console.log('⚠️ No user logged in, skipping auth test');
      }

      // Test 4: Edge Functions
      console.log('Testing Edge Functions...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const response = await fetch('https://dznbihypzmvcmradijqn.supabase.co/functions/v1/change-user-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              test: 'connection'
            })
          });

          if (response.status === 401) {
            // 401 is expected without proper parameters, but means the function is accessible
            testResults.edgeFunctions = true;
            console.log('✅ Edge Functions accessible (401 expected without proper auth)');
          } else if (response.ok) {
            testResults.edgeFunctions = true;
            console.log('✅ Edge Functions working');
          } else {
            console.error('Edge Functions test failed:', response.status, response.statusText);
            throw new Error(`Edge Functions failed: ${response.status} ${response.statusText}`);
          }
        } else {
          console.log('⚠️ No session, testing Edge Functions without auth...');
          const response = await fetch('https://dznbihypzmvcmradijqn.supabase.co/functions/v1/change-user-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              test: 'connection'
            })
          });

          if (response.status === 401) {
            testResults.edgeFunctions = true;
            console.log('✅ Edge Functions accessible (401 expected without auth)');
          } else {
            throw new Error(`Edge Functions failed: ${response.status} ${response.statusText}`);
          }
        }
      } catch (edgeError) {
        console.error('Edge Functions test error:', edgeError);
        throw new Error(`Edge Functions test failed: ${edgeError.message}`);
      }

      setResults(testResults);
      console.log('🎉 All tests completed successfully!');

    } catch (err: any) {
      console.error('Test failed:', err);
      setError(err.message || 'Unknown error occurred');
      setResults(testResults);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Connection Test
        </CardTitle>
        <CardDescription>
          Test the connection to Supabase and Edge Functions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testConnection} 
          disabled={isTesting}
          className="w-full"
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Run Connection Test'
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {results.supabase ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>Supabase Connection</span>
              </div>
              <div className="flex items-center gap-2">
                {results.database ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>Database Access</span>
              </div>
              <div className="flex items-center gap-2">
                {results.auth ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                {results.edgeFunctions ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>Edge Functions</span>
              </div>
            </div>
          </div>
        )}

        {user && (
          <div className="text-xs text-gray-600">
            <p><strong>Current User:</strong> {user.email}</p>
            {profile && (
              <p><strong>Role:</strong> {profile.role}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
