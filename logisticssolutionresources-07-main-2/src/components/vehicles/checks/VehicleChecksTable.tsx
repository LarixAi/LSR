
import React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import VehicleCheckRow from './VehicleCheckRow';

interface VehicleChecksTableProps {
  vehicleChecks: any[];
  showDriverInfo?: boolean;
  showVehicleInfo?: boolean;
}

const VehicleChecksTable: React.FC<VehicleChecksTableProps> = ({
  vehicleChecks,
  showDriverInfo = true,
  showVehicleInfo = true
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date & Time</TableHead>
          {showDriverInfo && <TableHead>Driver</TableHead>}
          {showVehicleInfo && <TableHead>Vehicle</TableHead>}
          <TableHead>Overall Condition</TableHead>
          <TableHead>Issues</TableHead>
          <TableHead>Maintenance</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicleChecks.map((check) => (
          <VehicleCheckRow
            key={check.id}
            check={check}
            showDriverInfo={showDriverInfo}
            showVehicleInfo={showVehicleInfo}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default VehicleChecksTable;
