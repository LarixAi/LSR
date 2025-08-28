
import { useState } from 'react';
import type { AddRouteFormData, Stop } from '../types';

const initialFormData: AddRouteFormData = {
  routeName: '',
  schoolName: '',
  schoolAddress: '',
  selectedVehicleId: '',
  selectedDriverId: '',
  driverName: '',
  driverContact: '',
  stops: [],
  startTime: '',
  endTime: '',
  days: [true, true, true, true, true, false, false],
  maxCapacity: '',
  assignedStudents: '',
  dangerZones: '',
  maxWalkingDistance: '',
  estDuration: '',
  estDistance: '',
  notes: '',
  transportCompany: '',
  routeNumber: '',
  morningPayment: '',
  afternoonPayment: '',
  afternoonIsReverse: true,
};

export const useRouteForm = () => {
  const [formData, setFormData] = useState<AddRouteFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof AddRouteFormData, value: string | boolean | Stop[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateDays = (days: boolean[]) => {
    setFormData(prev => ({ ...prev, days }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  return {
    formData,
    errors,
    setErrors,
    updateField,
    updateDays,
    resetForm,
  };
};
