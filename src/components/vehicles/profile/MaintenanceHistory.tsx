
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench } from 'lucide-react';

interface MaintenanceHistoryProps {
  vehicleSpecificChecks: any[];
}

const MaintenanceHistory = ({ vehicleSpecificChecks }: MaintenanceHistoryProps) => {
  const maintenanceRequiredChecks = vehicleSpecificChecks.filter(check => check.requires_maintenance);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance History</CardTitle>
      </CardHeader>
      <CardContent>
        {maintenanceRequiredChecks.length > 0 ? (
          <div className="space-y-4">
            {maintenanceRequiredChecks.map((check) => (
              <div key={check.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">
                      Inspection from {new Date(check.check_date).toLocaleDateString()}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Priority: {check.maintenance_priority}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-orange-600">
                    Maintenance Required
                  </Badge>
                </div>
                {check.issues_reported && check.issues_reported.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-1">Issues Reported:</h5>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {check.issues_reported.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {check.notes && (
                  <div className="mt-2">
                    <h5 className="text-sm font-medium mb-1">Notes:</h5>
                    <p className="text-sm text-gray-600">{check.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No maintenance required</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenanceHistory;
