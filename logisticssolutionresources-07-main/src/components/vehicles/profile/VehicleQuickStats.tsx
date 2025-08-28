
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Wrench, Calendar } from 'lucide-react';

interface VehicleQuickStatsProps {
  vehicleSpecificChecks: any[];
  checksLoading: boolean;
}

const VehicleQuickStats = ({ vehicleSpecificChecks, checksLoading }: VehicleQuickStatsProps) => {
  const maintenanceRequiredChecks = vehicleSpecificChecks.filter(check => check.requires_maintenance);
  const recentChecks = vehicleSpecificChecks.slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {checksLoading ? '-' : vehicleSpecificChecks.length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Maintenance Required</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {checksLoading ? '-' : maintenanceRequiredChecks.length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Inspection</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {checksLoading ? '-' : recentChecks.length > 0 
              ? new Date(recentChecks[0].check_date).toLocaleDateString()
              : 'Never'
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleQuickStats;
