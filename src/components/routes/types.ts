
export interface Stop {
  address: string;
  time: string;
  role: 'PA' | 'Student';
  passengerName: string;
  pickupOrder: number;
}

export interface AddRouteFormData {
  routeName: string;
  schoolName: string;
  schoolAddress: string;
  selectedVehicleId: string;
  selectedDriverId: string; // Add this field
  driverName: string;
  driverContact: string;
  stops: Stop[];
  startTime: string;
  endTime: string;
  days: boolean[];
  maxCapacity: string;
  assignedStudents: string;
  dangerZones: string;
  maxWalkingDistance: string;
  estDuration: string;
  estDistance: string;
  notes: string;
  transportCompany?: string;
  routeNumber?: string;
  morningPayment?: string;
  afternoonPayment?: string;
  afternoonIsReverse?: boolean;
}

export interface AddRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
