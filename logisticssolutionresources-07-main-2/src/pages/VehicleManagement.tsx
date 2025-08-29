import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Car, Plus, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { useVehicles, useDeleteVehicle, type Vehicle } from '@/hooks/useVehicles';
import VehiclesList from '@/components/vehicles/VehiclesList';
import EditVehicleDialog from '@/components/vehicles/EditVehicleDialog';
import AddVehicleDialog from '@/components/vehicles/AddVehicleDialog';
import { toast } from '@/hooks/use-toast';

export default function VehicleManagement() {
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { vehicles, loading, error, fetchVehicles } = useVehicles();
  const deleteVehicle = useDeleteVehicle();

  const handleAddVehicle = () => {
    setShowAddDialog(true);
  };

  const handleVehicleAdded = () => {
    fetchVehicles();
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle.mutateAsync(vehicleId);
        fetchVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  // Calculate vehicle stats
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const outOfServiceVehicles = vehicles.filter(v => v.status === 'out_of_service').length;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Vehicle Management</h1>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-destructive">Error loading vehicles: {error}</p>
              <Button onClick={() => fetchVehicles()} className="mt-4">
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
        <h1 className="text-3xl font-bold">Vehicle Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceVehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Service</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfServiceVehicles}</div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles List */}
      <VehiclesList 
        vehicles={vehicles}
        isLoading={loading}
        onAddVehicle={handleAddVehicle}
        onEditVehicle={handleEditVehicle}
        onDeleteVehicle={handleDeleteVehicle}
      />

      {/* Add Vehicle Dialog */}
      <AddVehicleDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleVehicleAdded}
      />

      {/* Edit Vehicle Dialog */}
      <EditVehicleDialog
        vehicle={editVehicle}
        open={!!editVehicle}
        onOpenChange={(open) => !open && setEditVehicle(null)}
        onSuccess={() => {
          setEditVehicle(null);
          fetchVehicles();
        }}
      />
    </div>
  );
}