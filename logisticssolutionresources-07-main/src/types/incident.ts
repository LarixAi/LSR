
export enum IncidentType {
  transportation = 'transportation',
  school = 'school',
  wedding = 'wedding',
  airport = 'airport',
  privateJob = 'privateJob',
}

export interface IncidentFormData {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date?: Date;
  time?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  peopleInvolved: string[];
  witnesses: string[];
  vehicleId?: string;
  driverId?: string;
  attachments: File[];
  [key: string]: any; // For type-specific fields
}

export interface IncidentReport {
  id: string;
  type: IncidentType;
  data: IncidentFormData;
  status: 'draft' | 'submitted' | 'under_review' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  reportedBy: string;
}
