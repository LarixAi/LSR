import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import NotificationTest from '@/components/notifications/NotificationTest';

const NotificationCenterPage = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading notification center...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile.organization_id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Organization Required</h2>
          <p className="text-gray-600">You must be assigned to an organization to access notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NotificationCenter />
      <div className="max-w-4xl mx-auto p-6">
        <NotificationTest />
      </div>
    </div>
  );
};

export default NotificationCenterPage;