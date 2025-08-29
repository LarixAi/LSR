
import type { AddRouteFormData } from '../types';

export const validateStep = (step: number, formData: AddRouteFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  switch (step) {
    case 0:
      if (!formData.routeName) errors.routeName = 'Route name is required';
      if (!formData.schoolName) errors.schoolName = 'School name is required';
      if (!formData.schoolAddress) errors.schoolAddress = 'School address is required';
      if (!formData.selectedVehicleId) errors.selectedVehicleId = 'Vehicle selection is required';
      if (!formData.driverName) errors.driverName = 'Driver name is required';
      if (!formData.driverContact) errors.driverContact = 'Driver contact is required';
      break;
    case 1:
      // Validate stops and PA-first ordering
      if (formData.stops.length === 0) {
        errors.stops = 'At least one passenger pickup is required';
      } else {
        const hasPA = formData.stops.some(stop => stop.role === 'PA');
        const firstIsPA = formData.stops[0]?.role === 'PA';
        
        if (!hasPA) {
          errors.stops = 'Please assign a PA as the first pickup before adding students';
        } else if (!firstIsPA) {
          errors.stops = 'The first pickup must be a Personal Assistant (PA)';
        }
        
        // Only validate that at least one stop has all required fields
        const hasCompleteStop = formData.stops.some(stop => 
          stop.passengerName && stop.address && stop.time
        );
        
        if (!hasCompleteStop) {
          errors.stops = 'Please complete at least one passenger pickup with name, address, and time';
        }
      }
      break;
    case 2:
      if (!formData.startTime) errors.startTime = 'Start time is required';
      if (!formData.endTime) errors.endTime = 'End time is required';
      break;
    case 4:
      if (!formData.maxCapacity) errors.maxCapacity = 'Max capacity is required';
      if (!formData.assignedStudents) errors.assignedStudents = 'Assigned students is required';
      if (!formData.maxWalkingDistance) errors.maxWalkingDistance = 'Max walking distance is required';
      if (!formData.estDuration) errors.estDuration = 'Estimated duration is required';
      if (!formData.estDistance) errors.estDistance = 'Estimated distance is required';
      break;
  }

  return errors;
};
