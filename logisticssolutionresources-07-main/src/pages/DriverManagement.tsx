import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, UserCheck, UserX, Clock, Shield } from 'lucide-react';
import { useDrivers } from '@/hooks/useDrivers';
import DriversList from '@/components/drivers/DriversList';
import AddDriverForm from '@/components/drivers/AddDriverForm';
import PasswordManagement from '@/components/drivers/PasswordManagement';
import { AdminGuard } from '@/components/auth/AuthGuard';


export default function DriverManagement() {
  const [addDriverOpen, setAddDriverOpen] = useState(false);
  
  const { data: drivers = [], isLoading, error, refetch } = useDrivers();

  const handleDriverAdded = () => {
    setAddDriverOpen(false);
    refetch();
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
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Driver Management</h1>
          <Button onClick={() => setAddDriverOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Driver
          </Button>
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="drivers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="drivers">Drivers List</TabsTrigger>
          <TabsTrigger value="passwords">
            <Shield className="h-4 w-4 mr-2" />
            Password Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drivers">
          <DriversList drivers={drivers} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="passwords">
          <PasswordManagement />
        </TabsContent>
      </Tabs>

        {/* Add Driver Dialog */}
        <AddDriverForm
          open={addDriverOpen}
          onOpenChange={setAddDriverOpen}
          onDriverAdded={handleDriverAdded}
        />
      </div>
    </AdminGuard>
  );
}