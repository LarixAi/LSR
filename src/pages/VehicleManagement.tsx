import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Car, Plus, Wrench, AlertTriangle, CheckCircle, Database, Settings, Shield, Scale, Clock, FileText, Users, TrendingUp } from 'lucide-react';
import { useVehicles, useDeleteVehicle, useVehicleStats, type Vehicle } from '@/hooks/useVehicles';
import VehiclesList from '@/components/vehicles/VehiclesList';
import EditVehicleDialog from '@/components/vehicles/EditVehicleDialog';
import VehicleCreationWithInspections from '@/components/vehicles/VehicleCreationWithInspections';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';

export default function VehicleManagement() {
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  
  // Use new React Query hooks
  const { data: vehicles = [], isLoading: loading, error } = useVehicles();
  const vehicleStats = useVehicleStats();
  const deleteVehicle = useDeleteVehicle();

  const handleAddVehicle = () => {
    setShowAddForm(true);
  };

  const handleVehicleAdded = () => {
    setShowAddForm(false);
    // React Query will automatically refetch
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle.mutateAsync(vehicleId);
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const handleClearAllVehicles = async () => {
    if (!confirm('Are you sure you want to delete ALL vehicles? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete all vehicles one by one
      for (const vehicle of vehicles) {
        await deleteVehicle.mutateAsync(vehicle.id);
      }
      toast({
        title: "Success!",
        description: "All vehicles have been removed from your fleet.",
      });
    } catch (error) {
      console.error('Error clearing vehicles:', error);
      toast({
        title: "Error",
        description: "Failed to clear all vehicles. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpenSettings = () => {
    navigate('/vehicle-settings');
  };

  // Use stats from the hook
  const totalVehicles = vehicleStats.total;
  const activeVehicles = vehicleStats.active;
  const maintenanceVehicles = vehicleStats.maintenance;
  const outOfServiceVehicles = vehicleStats.out_of_service;

  // Calculate ORV and BOR compliance metrics
  const orvComplianceRate = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;
  const borComplianceRate = totalVehicles > 0 ? Math.round(((totalVehicles - outOfServiceVehicles) / totalVehicles) * 100) : 0;
  const vehiclesOffRoad = maintenanceVehicles + outOfServiceVehicles;
  const vehiclesReturningSoon = Math.floor(vehiclesOffRoad * 0.3); // Estimate 30% returning soon

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Vehicle Management</h1>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-destructive">Error loading vehicles: {error.message}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show the enhanced vehicle creation form
  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Vehicle Management</h1>
            <p className="text-gray-600 mt-1">Fleet management with ORV & BOR roadworthiness compliance</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowAddForm(false)}
          >
            Back to Vehicle List
          </Button>
        </div>
        <VehicleCreationWithInspections />
      </div>
    );
  }

  return (
    <PageLayout
      title="Vehicle Management"
      description="Fleet management with ORV & BOR roadworthiness compliance"
      actionButton={{
        label: "Add Vehicle",
        onClick: handleAddVehicle,
        icon: <Plus className="h-4 w-4 mr-2" />
      }}
      summaryCards={[
        {
          title: "Total Vehicles",
          value: totalVehicles,
          subtitle: "Fleet size",
          icon: <Car className="h-4 w-4" />
        },
        {
          title: "Active",
          value: activeVehicles,
          subtitle: `${totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0}% of fleet`,
          icon: <CheckCircle className="h-4 w-4" />,
          color: "text-green-600"
        },
        {
          title: "In Maintenance",
          value: maintenanceVehicles,
          subtitle: "ORV: Planned/Unplanned",
          icon: <Wrench className="h-4 w-4" />,
          color: "text-yellow-600"
        },
        {
          title: "Out of Service",
          value: outOfServiceVehicles,
          subtitle: "ORV: Regulatory/Operational",
          icon: <AlertTriangle className="h-4 w-4" />,
          color: "text-red-600"
        }
      ]}
      searchValue=""
      onSearchChange={() => {}}
      tabs={[
        { value: "overview", label: "Overview" },
        { value: "compliance", label: "Compliance" },
        { value: "maintenance", label: "Maintenance" }
      ]}
      activeTab="overview"
      onTabChange={() => {}}
      isLoading={loading}
    >

      {/* Compliance Quick Actions */}
      {vehicles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <div className="text-center">
                  <div className="font-semibold">ORV Documentation</div>
                  <div className="text-xs text-gray-600">Manage off-road declarations</div>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Clock className="h-6 w-6 text-orange-600" />
                <div className="text-center">
                  <div className="font-semibold">BOR Return Process</div>
                  <div className="text-xs text-gray-600">Vehicle return to service</div>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <div className="text-center">
                  <div className="font-semibold">Compliance Reports</div>
                  <div className="text-xs text-gray-600">View compliance analytics</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State or Vehicles List */}
      {!loading && vehicles.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Vehicles Found</h3>
              <p className="text-gray-600 mb-6">
                You haven't added any vehicles to your fleet yet. Start by adding your first vehicle with mandatory inspection schedules to get started with vehicle management and ORV/BOR compliance tracking.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleAddVehicle} className="inline-flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Vehicle
                </Button>
                <Button onClick={handleOpenSettings} variant="outline" className="inline-flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Fleet Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <VehiclesList />
      )}

      {/* Edit Vehicle Dialog */}
      <EditVehicleDialog
        vehicle={editVehicle}
        open={!!editVehicle}
        onOpenChange={(open) => !open && setEditVehicle(null)}
        onSuccess={() => {
          setEditVehicle(null);
          // React Query will automatically refetch
        }}
      />
    </PageLayout>
  );
}