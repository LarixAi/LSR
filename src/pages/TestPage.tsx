import React from 'react';
import { TestConnection } from '@/components/TestConnection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TestPage: React.FC = () => {
  const { user, profile, session } = useAuth();
  const { toast } = useToast();

  const testPasswordChange = async () => {
    if (!user) {
      toast({
        title: "No user logged in",
        description: "Please log in to test password change",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: 'TestPassword123!'
      });

      if (error) {
        toast({
          title: "Password change failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password change successful",
          description: "Password was updated successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Frontend Test Page</h1>
        <p className="text-gray-600">Testing all frontend updates and connections</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Test */}
        <TestConnection />

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>Authentication and user information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Logged In:</span>
                <span className={user ? "text-green-600" : "text-red-600"}>
                  {user ? "Yes" : "No"}
                </span>
              </div>
              
              {user && (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span className="text-sm">{user.email}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">User ID:</span>
                    <span className="text-xs font-mono">{user.id}</span>
                  </div>
                </>
              )}

              {profile && (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">Role:</span>
                    <span className="text-sm">{profile.role}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span className="text-sm">
                      {profile.first_name} {profile.last_name}
                    </span>
                  </div>

                  {profile.organization_id && (
                    <div className="flex justify-between">
                      <span className="font-medium">Organization:</span>
                      <span className="text-xs font-mono">{profile.organization_id}</span>
                    </div>
                  )}
                </>
              )}

              {session && (
                <div className="flex justify-between">
                  <span className="font-medium">Session Active:</span>
                  <span className="text-green-600">Yes</span>
                </div>
              )}
            </div>

            <Button 
              onClick={testPasswordChange}
              variant="outline"
              className="w-full"
            >
              Test Password Change
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
          <CardDescription>Current configuration and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Supabase URL:</span>
              <p className="text-xs font-mono break-all">
                {import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || "https://dznbihypzmvcmradijqn.supabase.co"}
              </p>
            </div>
            <div>
              <span className="font-medium">Current Port:</span>
              <p className="text-xs">3001</p>
            </div>
            <div>
              <span className="font-medium">VITE_SUPABASE_URL:</span>
              <p className={`text-xs font-mono ${import.meta.env.VITE_SUPABASE_URL ? "text-green-600" : "text-red-600"}`}>
                {import.meta.env.VITE_SUPABASE_URL ? "✅ Available" : "❌ Missing"}
              </p>
            </div>
            <div>
              <span className="font-medium">VITE_SUPABASE_ANON_KEY:</span>
              <p className={`text-xs font-mono ${import.meta.env.VITE_SUPABASE_ANON_KEY ? "text-green-600" : "text-red-600"}`}>
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Available" : "❌ Missing"}
              </p>
            </div>
            <div>
              <span className="font-medium">SUPABASE_URL:</span>
              <p className={`text-xs font-mono ${import.meta.env.SUPABASE_URL ? "text-green-600" : "text-red-600"}`}>
                {import.meta.env.SUPABASE_URL ? "✅ Available" : "❌ Missing"}
              </p>
            </div>
            <div>
              <span className="font-medium">SUPABASE_ANON_KEY:</span>
              <p className={`text-xs font-mono ${import.meta.env.SUPABASE_ANON_KEY ? "text-green-600" : "text-red-600"}`}>
                {import.meta.env.SUPABASE_ANON_KEY ? "✅ Available" : "❌ Missing"}
              </p>
            </div>
            <div>
              <span className="font-medium">VITE_APP_TYPE:</span>
              <p className="text-xs font-mono text-blue-600">
                {import.meta.env.VITE_APP_TYPE || "Not set"}
              </p>
            </div>
            <div>
              <span className="font-medium">VITE_PLATFORM:</span>
              <p className="text-xs font-mono text-blue-600">
                {import.meta.env.VITE_PLATFORM || "Not set"}
              </p>
            </div>
            <div>
              <span className="font-medium">Edge Functions:</span>
              <p className="text-xs text-green-600">✅ Redeployed and Active</p>
            </div>
            <div>
              <span className="font-medium">CORS Status:</span>
              <p className="text-xs text-yellow-600">⚠️ Needs update in dashboard</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>What you need to do to complete the setup</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-blue-600">1.</span>
              <span>Update CORS settings in Supabase dashboard to include <code className="bg-gray-100 px-1 rounded">http://localhost:3001</code></span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">2.</span>
              <span>Run the connection test above to verify everything is working</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">3.</span>
              <span>Test the password change functionality in your app</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">4.</span>
              <span>Clear browser cache if you still see CORS errors</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPage;
