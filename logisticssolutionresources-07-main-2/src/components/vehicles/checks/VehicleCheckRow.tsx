
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, User, Car } from 'lucide-react';
import { format } from 'date-fns';

interface VehicleCheckRowProps {
  check: any;
  showDriverInfo?: boolean;
  showVehicleInfo?: boolean;
}

const VehicleCheckRow: React.FC<VehicleCheckRowProps> = ({
  check,
  showDriverInfo = true,
  showVehicleInfo = true
}) => {
  const getOverallConditionColor = () => {
    const conditions = [
      check.engine_condition,
      check.brakes_condition,
      check.tires_condition,
      check.lights_condition,
      check.interior_condition,
      check.exterior_condition
    ];
    
    if (conditions.some(c => c === 'poor')) return 'bg-red-100 text-red-800';
    if (conditions.some(c => c === 'fair')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenancePriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div>
            <div className="font-medium">
              {format(new Date(check.check_date), 'MMM dd, yyyy')}
            </div>
            <div className="text-sm text-gray-500">
              {check.check_time}
            </div>
          </div>
        </div>
      </TableCell>

      {showDriverInfo && (
        <TableCell>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <span>
              {check.driver_profile 
                ? `${check.driver_profile.first_name} ${check.driver_profile.last_name}`
                : 'Unknown Driver'
              }
            </span>
          </div>
        </TableCell>
      )}

      {showVehicleInfo && (
        <TableCell>
          <div className="flex items-center space-x-2">
            <Car className="w-4 h-4 text-gray-500" />
            <div>
              <div className="font-medium">
                {check.vehicles?.vehicle_number || 'Unknown Vehicle'}
              </div>
              <div className="text-sm text-gray-500">
                {check.vehicles?.license_plate}
              </div>
            </div>
          </div>
        </TableCell>
      )}

      <TableCell>
        <div className="space-y-2">
          <Badge className={getOverallConditionColor()}>
            Overall: Good
          </Badge>
          {check.compliance_status && (
            <Badge className={getComplianceStatusColor(check.compliance_status)}>
              {check.compliance_status.replace('_', ' ').toUpperCase()}
            </Badge>
          )}
          {check.compliance_score && (
            <div className="text-sm text-gray-600">
              Score: {check.compliance_score}/100
            </div>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="space-y-1">
          {check.issues_reported && check.issues_reported.length > 0 ? (
            <div>
              <Badge variant="destructive" className="text-xs">
                {check.issues_reported.length} issue(s)
              </Badge>
              <div className="text-xs text-gray-600 mt-1">
                {check.issues_reported.slice(0, 2).join(', ')}
                {check.issues_reported.length > 2 && '...'}
              </div>
            </div>
          ) : (
            <Badge variant="outline" className="text-xs">No issues</Badge>
          )}
        </div>
      </TableCell>

      <TableCell>
        {check.requires_maintenance ? (
          <div className="space-y-1">
            <Badge className={getMaintenancePriorityColor(check.maintenance_priority)}>
              {check.maintenance_priority} Priority
            </Badge>
            {check.next_inspection_due && (
              <div className="text-xs text-gray-600">
                Next: {format(new Date(check.next_inspection_due), 'MMM dd')}
              </div>
            )}
          </div>
        ) : (
          <Badge variant="outline" className="text-xs">Not Required</Badge>
        )}
      </TableCell>

      <TableCell>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default VehicleCheckRow;
