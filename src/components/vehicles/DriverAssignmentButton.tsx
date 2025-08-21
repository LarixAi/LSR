// @ts-nocheck
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, UserX, UserPlus } from 'lucide-react';
import { useDrivers } from '@/hooks/useDrivers';
import { useCreateDriverAssignment, useUpdateDriverAssignment } from '@/hooks/useDriverAssignments';
import { Badge } from '@/components/ui/badge';

interface DriverAssignmentButtonProps {
  vehicle: any;
  currentAssignment?: any;
  variant?: 'button' | 'card';
}

const DriverAssignmentButton = ({ vehicle, currentAssignment, variant = 'button' }: DriverAssignmentButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  
  const { data: drivers = [], isLoading } = useDrivers();
  const createAssignment = useCreateDriverAssignment();
  const updateAssignment = useUpdateDriverAssignment();

  // Filter to get only active drivers who are signed up users
  const activeDrivers = drivers.filter(driver => {
    console.log('Filtering driver:', driver.first_name, driver.last_name, {
      employment_status: driver.employment_status,
      email: driver.email,
      role: driver.role,
      is_active: driver.is_active
    });
    
    return driver.role === 'driver' && 
           driver.is_active !== false && // Allow null or true
           (driver.employment_status === 'active' || driver.employment_status === 'applicant'); // More flexible filtering
  });

  console.log('Total drivers from hook:', drivers.length);
  console.log('Active drivers after filtering:', activeDrivers.length);
  console.log('Active drivers:', activeDrivers.map(d => `${d.first_name} ${d.last_name} (${d.email})`));

  const handleAssignDriver = async () => {
    if (!selectedDriverId) return;

    try {
      // If there's a current assignment, deactivate it first
      if (currentAssignment) {
        await updateAssignment.mutateAsync({
          id: currentAssignment.id,
          is_active: false
        });
      }

      // Create new assignment
      await createAssignment.mutateAsync({
        driverId: selectedDriverId,
        vehicleId: vehicle.id
      });

      setIsOpen(false);
      setSelectedDriverId('');
    } catch (error) {
      console.error('Failed to assign driver:', error);
    }
  };

  const handleUnassignDriver = async () => {
    if (!currentAssignment) return;

    try {
      await updateAssignment.mutateAsync({
        id: currentAssignment.id,
        is_active: false
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to unassign driver:', error);
    }
  };

  const isProcessing = createAssignment.isPending || updateAssignment.isPending;

  if (variant === 'card') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Assigned Driver</span>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                {currentAssignment ? <UserX className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentAssignment ? 'Manage Driver Assignment' : 'Assign Driver'}
                </DialogTitle>
                <DialogDescription>
                  Vehicle: {vehicle.vehicle_number} ({vehicle.license_plate})
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {currentAssignment && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Currently Assigned:</p>
                    <p className="text-sm text-muted-foreground">
                      {currentAssignment.profiles?.first_name} {currentAssignment.profiles?.last_name}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {currentAssignment ? 'Reassign to different driver:' : 'Select driver to assign:'}
                  </label>
                  <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoading ? (
                        <SelectItem value="loading" disabled>Loading drivers...</SelectItem>
                      ) : (
                        activeDrivers
                          .filter(driver => driver.id !== currentAssignment?.driver_id)
                          .map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.first_name} {driver.last_name} - {driver.employee_id || 'No ID'}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                {currentAssignment && (
                  <Button
                    variant="destructive"
                    onClick={handleUnassignDriver}
                    disabled={isProcessing}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Unassign Driver
                  </Button>
                )}
                <Button
                  onClick={handleAssignDriver}
                  disabled={!selectedDriverId || isProcessing}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {currentAssignment ? 'Reassign' : 'Assign'} Driver
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {currentAssignment ? (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-foreground" />
            <div className="text-sm">
              <p className="font-medium">
                {currentAssignment.profiles?.first_name} {currentAssignment.profiles?.last_name}
              </p>
              <p className="text-xs text-muted-foreground">
                ID: {currentAssignment.profiles?.employee_id || 'N/A'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <UserX className="w-4 h-4" />
            <span className="text-sm">No driver assigned</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {currentAssignment ? (
            <>
              <User className="w-4 h-4 mr-1" />
              Reassign
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-1" />
              Assign Driver
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentAssignment ? 'Manage Driver Assignment' : 'Assign Driver'}
          </DialogTitle>
          <DialogDescription>
            Vehicle: {vehicle.vehicle_number} ({vehicle.license_plate})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentAssignment && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Currently Assigned:</p>
              <p className="text-sm text-muted-foreground">
                {currentAssignment.profiles?.first_name} {currentAssignment.profiles?.last_name}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {currentAssignment ? 'Reassign to different driver:' : 'Select driver to assign:'}
            </label>
            <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading drivers...</SelectItem>
                ) : (
                  activeDrivers
                    .filter(driver => driver.id !== currentAssignment?.driver_id)
                    .map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name} - {driver.employee_id || 'No ID'}
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {currentAssignment && (
            <Button
              variant="destructive"
              onClick={handleUnassignDriver}
              disabled={isProcessing}
            >
              <UserX className="w-4 h-4 mr-2" />
              Unassign Driver
            </Button>
          )}
          <Button
            onClick={handleAssignDriver}
            disabled={!selectedDriverId || isProcessing}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {currentAssignment ? 'Reassign' : 'Assign'} Driver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DriverAssignmentButton;