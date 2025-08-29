// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Eye, User, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Tables } from '@/integrations/supabase/types';
import EditVehicleForm from './EditVehicleForm';
import DriverAssignmentButton from './DriverAssignmentButton';

interface VehicleTableProps {
  vehicles: Tables<'vehicles'>[];
  isLoading: boolean;
  searchTerm: string;
}

const VehicleTable = ({ vehicles, isLoading, searchTerm }: VehicleTableProps) => {
  const [editingVehicle, setEditingVehicle] = useState<Tables<'vehicles'> | null>(null);
  const navigate = useNavigate();
  const { organizationId } = useRoleBasedAccess();
  const { user } = useAuth();

  // Fetch driver assignments with strict organization filtering
  const { data: driverAssignments = [] } = useQuery({
    queryKey: ['driver-assignments', organizationId],
    queryFn: async () => {
      if (!organizationId || !user?.id) return [];
      
      // First verify user's organization
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !userProfile || userProfile.organization_id !== organizationId) {
        console.error('Organization verification failed for driver assignments');
        return [];
      }
      
      const { data, error } = await supabase
        .from('driver_assignments')
        .select(`
          vehicle_id,
          is_active,
          organization_id,
          profiles!driver_id (
            id,
            first_name,
            last_name,
            employee_id,
            organization_id
          )
        `)
        .eq('is_active', true)
        .eq('organization_id', organizationId)
        .not('organization_id', 'is', null);

      if (error) {
        console.error('Error fetching driver assignments:', error);
        return [];
      }
      
      // Additional filtering to ensure data integrity
      const filteredData = (data || []).filter(assignment => {
        const isValidAssignment = assignment.organization_id === organizationId &&
                                assignment.profiles?.organization_id === organizationId;
        
        if (!isValidAssignment) {
          console.warn('Filtered out invalid driver assignment:', {
            assignmentOrgId: assignment.organization_id,
            profileOrgId: assignment.profiles?.organization_id,
            expectedOrgId: organizationId
          });
        }
        
        return isValidAssignment;
      });
      
      console.log('Driver assignments filtered:', { 
        total: data?.length, 
        filtered: filteredData.length, 
        organizationId 
      });
      
      return filteredData;
    },
    enabled: !!organizationId && !!user?.id
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getAssignedDriver = (vehicleId: string) => {
    const assignment = driverAssignments.find(da => da.vehicle_id === vehicleId);
    return assignment?.profiles;
  };

  // Filter vehicles by search term with enhanced organization verification
  const filteredVehicles = vehicles.filter(vehicle => {
    // Critical security check - ensure vehicle belongs to current organization
    if (!vehicle.organization_id || vehicle.organization_id !== organizationId) {
      console.warn('Vehicle organization mismatch - filtering out:', { 
        vehicleId: vehicle.id, 
        vehicleOrgId: vehicle.organization_id, 
        currentOrgId: organizationId 
      });
      return false;
    }
    
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    return (
      vehicle.vehicle_number?.toLowerCase().includes(searchLower) ||
      vehicle.license_plate?.toLowerCase().includes(searchLower) ||
      (vehicle.model && vehicle.model.toLowerCase().includes(searchLower))
    );
  });

  // Log filtered results for debugging
  console.log('Vehicle filtering results:', {
    totalVehicles: vehicles.length,
    filteredByOrg: vehicles.filter(v => v.organization_id === organizationId).length,
    finalFiltered: filteredVehicles.length,
    organizationId,
    searchTerm
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Fleet</CardTitle>
          <CardDescription>
            Manage your transport vehicles, their details, and driver assignments
            {organizationId && (
              <span className="block text-xs text-gray-500 mt-1">
                Org: {organizationId.slice(0, 8)}... | Vehicles: {filteredVehicles.length}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-gray-500">Loading vehicles...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {vehicles.length === 0 
                  ? 'No vehicles found for your organization.' 
                  : searchTerm 
                    ? 'No vehicles found matching your search.'
                    : 'No vehicles found for your organization after filtering.'}
              </p>
              {organizationId && (
                <p className="text-xs text-gray-400 mt-2">
                  Organization ID: {organizationId}
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle ID</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Assigned Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => {
                  const assignedDriver = getAssignedDriver(vehicle.id);
                  return (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div className="font-medium">{vehicle.vehicle_number}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{vehicle.model || 'No model specified'}</div>
                        {vehicle.year && (
                          <div className="text-sm text-gray-500">Year: {vehicle.year}</div>
                        )}
                      </TableCell>
                      <TableCell>{vehicle.capacity} seats</TableCell>
                      <TableCell>{vehicle.license_plate}</TableCell>
                      <TableCell>
                        {assignedDriver ? (
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="font-medium text-sm">
                                {assignedDriver.first_name} {assignedDriver.last_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {assignedDriver.employee_id || 'N/A'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No driver assigned</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(vehicle.is_active || false)}>
                          {vehicle.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                            onClick={(e) => {
                              console.log('=== DETAILS BUTTON CLICKED ===');
                              console.log('Vehicle ID:', vehicle.id);
                              console.log('License Plate:', vehicle.license_plate);
                              console.log('Navigating to:', `/vehicle-details/${vehicle.id}`);
                              e.preventDefault();
                              e.stopPropagation();
                              navigate(`/vehicle-details/${vehicle.id}`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                            onClick={(e) => {
                              console.log('=== SERVICE BUTTON CLICKED ===');
                              console.log('Vehicle ID:', vehicle.id);
                              console.log('License Plate:', vehicle.license_plate);
                              console.log('Navigating to:', `/vehicle-service/${vehicle.id}`);
                              e.preventDefault();
                              e.stopPropagation();
                              navigate(`/vehicle-service/${vehicle.id}`);
                            }}
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Service
                          </Button>
                          <DriverAssignmentButton 
                            vehicle={vehicle}
                            currentAssignment={assignedDriver ? driverAssignments.find(da => da.vehicle_id === vehicle.id) : undefined}
                            variant="button"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Edit clicked for vehicle:', vehicle.id);
                              setEditingVehicle(vehicle);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingVehicle && (
        <EditVehicleForm
          open={!!editingVehicle}
          onOpenChange={(open) => !open && setEditingVehicle(null)}
          vehicle={editingVehicle}
        />
      )}
    </>
  );
};

export default VehicleTable;
