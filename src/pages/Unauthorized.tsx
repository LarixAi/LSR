
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AccessDeniedFix from '@/components/common/AccessDeniedFix';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Check if this is an admin user who might need role fixing
  // Only show admin fix for actual admin accounts, not driver accounts
  const isAdminUser = user?.email?.includes('admin') || 
                     user?.email?.includes('transport') || 
                     (user?.email?.includes('laronelaing') && user?.user_metadata?.role === 'admin');

  // Determine the appropriate dashboard based on user role
  const getDashboardPath = () => {
    if (profile?.role === 'driver') {
      return '/driver-dashboard';
    } else if (profile?.role === 'parent') {
      return '/parent/dashboard';
    } else if (profile?.role === 'mechanic') {
      return '/mechanic-dashboard';
    } else {
      return '/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {isAdminUser ? (
        <AccessDeniedFix 
          userEmail={user?.email}
          onFixComplete={() => {
            navigate('/dashboard');
          }}
        />
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page. 
              {profile?.role === 'driver' && ' This page is for administrators only.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate(getDashboardPath())}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {profile?.role === 'driver' ? 'Driver' : ''} Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Unauthorized;
