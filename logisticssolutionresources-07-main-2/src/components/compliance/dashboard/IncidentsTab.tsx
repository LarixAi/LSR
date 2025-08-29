
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  incident_date: string;
  incident_type?: string;
  driver_id?: string;
  vehicle_id?: string;
  driver?: {
    first_name: string;
    last_name: string;
  };
  vehicles?: {
    vehicle_number: string;
  };
}

interface IncidentsTabProps {
  incidents: Incident[];
}

const getSeverityBadgeColor = (severity: string) => {
  switch (severity) {
    case 'minor': return 'bg-blue-100 text-blue-800';
    case 'major': return 'bg-yellow-100 text-yellow-800';
    case 'severe': return 'bg-orange-100 text-orange-800';
    case 'critical': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const IncidentsTab: React.FC<IncidentsTabProps> = ({ incidents }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Incidents</CardTitle>
        <CardDescription>
          Monitor incident reports and their resolution status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {incidents?.map((incident) => (
            <div key={incident.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">{incident.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                </div>
                <Badge className={getSeverityBadgeColor(incident.severity)}>
                  {incident.severity}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-3">
                <div>
                  <span className="font-medium">Date:</span> {format(new Date(incident.incident_date), 'MMM dd, yyyy')}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {incident.incident_type}
                </div>
                <div>
                  <span className="font-medium">Driver:</span> 
                  {incident.driver ? ` ${incident.driver.first_name} ${incident.driver.last_name}` : ' Unknown'}
                </div>
                <div>
                  <span className="font-medium">Vehicle:</span> 
                  {incident.vehicles ? ` ${incident.vehicles.vehicle_number}` : ' Unknown'}
                </div>
              </div>
            </div>
          ))}
          {(!incidents || incidents.length === 0) && (
            <p className="text-gray-500 text-center py-8">No recent incidents</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IncidentsTab;
