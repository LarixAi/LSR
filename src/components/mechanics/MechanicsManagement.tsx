
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MechanicsList from './MechanicsList';
import MaintenanceRequestsList from './MaintenanceRequestsList';
import CreateMaintenanceRequestDialog from './CreateMaintenanceRequestDialog';

const MechanicsManagement = () => {
  const [showCreateRequest, setShowCreateRequest] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mechanics & Maintenance Management</CardTitle>
          <CardDescription>
            Manage mechanics, vehicle assignments, and maintenance requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mechanics" className="space-y-4">
            <TabsList>
              <TabsTrigger value="mechanics">Mechanics</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="mechanics">
              <MechanicsList />
            </TabsContent>

            <TabsContent value="maintenance">
              <MaintenanceRequestsList onCreateRequest={() => setShowCreateRequest(true)} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CreateMaintenanceRequestDialog 
        open={showCreateRequest} 
        onOpenChange={setShowCreateRequest} 
      />
    </div>
  );
};

export default MechanicsManagement;
