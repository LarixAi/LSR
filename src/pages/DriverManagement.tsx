import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Plus, Users, UserCheck, UserX, Clock } from 'lucide-react';
import { useDrivers } from '@/hooks/useDrivers';
import DriversList from '@/components/drivers/DriversList';
import AddDriverForm from '@/components/drivers/AddDriverForm';
import { PasswordChangeDialog } from '@/components/admin/PasswordChangeDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function DriverManagement() {
  const { profile } = useAuth();
  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<{
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    organization_id?: string;
  } | null>(null);
  const { data: drivers = [], isLoading, error, refetch } = useDrivers();

  // Test Supabase connection
  const [connectionStatus, setConnectionStatus] = React.useState<'testing' | 'connected' | 'error'>('testing');
  
  React.useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        setConnectionStatus('testing');
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        if (error) {
          console.error('Supabase connection test failed:', error);
          setConnectionStatus('error');
        } else {
          console.log('Supabase connection test successful:', data);
          setConnectionStatus('connected');
          
          // Test organization-specific query
          if (profile?.organization_id) {
            console.log('Testing organization query for org:', profile.organization_id);
            const { data: orgProfiles, error: orgError } = await supabase
              .from('profiles')
              .select('id, email, first_name, last_name, role, organization_id')
              .eq('organization_id', profile.organization_id);
            
            if (orgError) {
              console.error('Organization query failed:', orgError);
            } else {
              console.log('Organization profiles found:', orgProfiles);
              console.log('Drivers in organization:', orgProfiles?.filter(p => p.role === 'driver'));
            }
          }
        }
      } catch (err) {
        console.error('Supabase connection test error:', err);
        setConnectionStatus('error');
      }
    };

    testConnection();
  }, [profile?.organization_id]);

  const handleDriverAdded = () => {
    setAddDriverOpen(false);
    refetch();
  };

  const handlePasswordChange = (driver: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    organization_id?: string;
  }) => {
    setSelectedDriver(driver);
    setPasswordDialogOpen(true);
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    setSelectedDriver(null);
  };

  // Calculate driver stats
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(driver => driver.is_active).length;
  const inactiveDrivers = drivers.filter(driver => !driver.is_active).length;
  const newDrivers = drivers.filter(driver => {
    const hireDate = driver.hire_date ? new Date(driver.hire_date) : null;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return hireDate && hireDate > thirtyDaysAgo;
  }).length;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Driver Management</h1>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-destructive">Error loading drivers: {error.message}</p>
              <div className="mt-4 p-4 bg-gray-100 rounded text-left">
                <p><strong>Debug Info:</strong></p>
                <p>Organization ID: {selectedDriver?.organization_id || 'Not available'}</p>
                <p>Error details: {JSON.stringify(error, null, 2)}</p>
              </div>
              <Button onClick={() => refetch()} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Driver Management</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-600">Connection Status:</span>
            {connectionStatus === 'testing' && (
              <span className="text-sm text-yellow-600">Testing...</span>
            )}
            {connectionStatus === 'connected' && (
              <span className="text-sm text-green-600">Connected</span>
            )}
            {connectionStatus === 'error' && (
              <span className="text-sm text-red-600">Connection Error</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                // Add sample drivers
                const { data: sampleDrivers, error } = await supabase
                  .from('profiles')
                  .insert([
                    {
                      email: 'john.driver@test.com',
                      first_name: 'John',
                      last_name: 'Driver',
                      role: 'driver',
                      phone: '555-0123',
                      organization_id: profile?.organization_id,
                      is_active: true,
                      employment_status: 'active',
                      onboarding_status: 'completed'
                    },
                    {
                      email: 'sarah.wilson@test.com',
                      first_name: 'Sarah',
                      last_name: 'Wilson',
                      role: 'driver',
                      phone: '555-0456',
                      organization_id: profile?.organization_id,
                      is_active: true,
                      employment_status: 'active',
                      onboarding_status: 'completed'
                    }
                  ])
                  .select();

                if (error) {
                  console.error('Error adding sample drivers:', error);
                  alert('Error adding sample drivers: ' + error.message);
                } else {
                  console.log('Sample drivers added:', sampleDrivers);
                  refetch();
                  alert('Sample drivers added successfully!');
                }
              } catch (err) {
                console.error('Error:', err);
                alert('Error adding sample drivers');
              }
            }}
          >
            Add Sample Drivers
          </Button>
          <Button onClick={() => setAddDriverOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Driver
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDrivers}</div>
            {totalDrivers === 0 && !isLoading && (
              <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                No drivers found. Check console for debug info.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDrivers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Drivers</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveDrivers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newDrivers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Drivers List */}
      <DriversList 
        drivers={drivers} 
        isLoading={isLoading} 
        onPasswordChange={handlePasswordChange}
      />

      {/* Add Driver Dialog */}
      <AddDriverForm
        open={addDriverOpen}
        onOpenChange={setAddDriverOpen}
        onDriverAdded={handleDriverAdded}
      />

      {/* Password Change Dialog */}
      <PasswordChangeDialog
        isOpen={passwordDialogOpen}
        onClose={handlePasswordDialogClose}
        driver={selectedDriver}
      />
    </div>
  );
}