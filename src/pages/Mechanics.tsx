import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Users, ClipboardList, TrendingUp } from 'lucide-react';
import { useMechanicStats } from '@/hooks/useMechanics';
import MechanicsManagement from '@/components/mechanics/MechanicsManagement';

const Mechanics = () => {
  const mechanicStats = useMechanicStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mechanics Dashboard</h1>
          <p className="text-muted-foreground">
            Manage mechanics, assignments, and maintenance requests
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Mechanics</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mechanicStats.active_mechanics}</div>
            <p className="text-xs text-muted-foreground">
              {mechanicStats.total_mechanics} total mechanics
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mechanicStats.pending_requests}</div>
            <p className="text-xs text-muted-foreground">
              {mechanicStats.total_requests} total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mechanicStats.in_progress_requests}</div>
            <p className="text-xs text-muted-foreground">
              Actively being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mechanicStats.completed_requests}</div>
            <p className="text-xs text-muted-foreground">
              Successfully resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Management Component */}
      <MechanicsManagement />
    </div>
  );
};

export default Mechanics;