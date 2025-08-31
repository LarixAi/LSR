import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useVehicles, useDeleteVehicle } from '@/hooks/useVehicles';
import EditVehicleDialog from './EditVehicleDialog';
import { Plus, Edit, Trash2, Car, Shield, Scale, AlertTriangle, CheckCircle, Wrench, Clock } from 'lucide-react';

import { toast } from 'sonner';

const VehiclesList = () => {
  const navigate = useNavigate();
  const { data: vehicles = [], isLoading, error } = useVehicles();
  const deleteVehicle = useDeleteVehicle();
  const [editingVehicle, setEditingVehicle] = React.useState<any>(null);
  const [deletingVehicle, setDeletingVehicle] = React.useState<any>(null);


  const handleDeleteVehicle = async (vehicle: any) => {
    try {
      await deleteVehicle.mutateAsync(vehicle.id);
      toast.success('Vehicle deleted successfully');
      setDeletingVehicle(null);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  const getStatusBadge = (vehicle: any) => {
    const status = vehicle.status || 'active';
    
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
            <Wrench className="w-3 h-3 mr-1" />
            ORV: Maintenance
          </Badge>
        );
      case 'out_of_service':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            ORV: Off Road
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Car className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const getComplianceIcon = (vehicle: any) => {
    const status = vehicle.status || 'active';
    
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-yellow-600" />;
      case 'out_of_service':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Car className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehicles</CardTitle>
          <CardDescription>Loading vehicles...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehicles</CardTitle>
          <CardDescription>Error loading vehicles: {error.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Fleet</CardTitle>
          <CardDescription>Manage your vehicle fleet with ORV & BOR roadworthiness compliance tracking</CardDescription>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <div className="text-center py-8">
              <Car className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No vehicles</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first vehicle to the fleet.
              </p>
              <div className="mt-6">
                <Button onClick={() => navigate('/add-vehicle')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vehicle
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">
                    ORV: Off-Road Vehicle | BOR: Back On Road
                  </span>
                </div>
                <Button onClick={() => navigate('/add-vehicle')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vehicle
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle) => (
                      <TableRow 
                        key={vehicle.id} 
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div>
                            <div className="font-medium hover:text-blue-600 transition-colors">{vehicle.vehicle_number}</div>
                            <div className="text-sm text-gray-500">{vehicle.license_plate}</div>
                            <div className="text-xs text-gray-400">
                              {vehicle.make} {vehicle.model} ({vehicle.year})
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {vehicle.type || 'bus'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(vehicle)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{vehicle.capacity || 0}</span>
                            <span className="text-xs text-gray-500">seats</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingVehicle(vehicle)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingVehicle(vehicle)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="text-xs text-gray-500 text-center">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span>Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-yellow-600" />
                    <span>ORV: Maintenance</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                    <span>ORV: Off Road</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Edit Vehicle Dialog */}
      <EditVehicleDialog
        vehicle={editingVehicle}
        open={!!editingVehicle}
        onOpenChange={(open) => {
          if (!open) setEditingVehicle(null);
        }}
        onSuccess={() => {
          setEditingVehicle(null);
        }}
      />

      {/* Delete Confirmation */}
      {deletingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Vehicle</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {deletingVehicle.vehicle_number}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeletingVehicle(null)}
                disabled={deleteVehicle.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteVehicle(deletingVehicle)}
                disabled={deleteVehicle.isPending}
              >
                {deleteVehicle.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VehiclesList;