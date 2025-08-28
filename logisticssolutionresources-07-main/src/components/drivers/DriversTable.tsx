
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Eye, UserX, Calendar, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { OnboardingStatusBadge, EmploymentStatusBadge } from './DriverStatusBadges';
import DocumentStatusIcons from './DocumentStatusIcons';

interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  employment_status?: string;
  onboarding_status?: string;
  onboarding_progress?: number;
  completed_tasks?: number;
  total_tasks?: number;
  hire_date?: string;
  missing_documents?: string[];
  completed_documents?: string[];
}

interface DriversTableProps {
  drivers?: Driver[];
  onViewOnboarding: (driverId: string) => void;
}

const DriversTable = ({ drivers, onViewOnboarding }: DriversTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Employment Status</TableHead>
            <TableHead>Onboarding Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead>Hire Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers?.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell className="font-medium">
                {driver.first_name} {driver.last_name}
              </TableCell>
              <TableCell>{driver.email}</TableCell>
              <TableCell>
                <EmploymentStatusBadge status={driver.employment_status || 'applicant'} />
              </TableCell>
              <TableCell>
                <OnboardingStatusBadge status={driver.onboarding_status || 'pending'} />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={driver.onboarding_progress || 0} 
                    className="w-20" 
                  />
                  <span className="text-sm text-gray-600">
                    {driver.completed_tasks || 0}/{driver.total_tasks || 0}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <DocumentStatusIcons 
                  missingDocuments={driver.missing_documents}
                  completedDocuments={driver.completed_documents}
                />
              </TableCell>
              <TableCell>
                {driver.hire_date ? (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(driver.hire_date), 'MMM dd, yyyy')}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">Not hired</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewOnboarding(driver.id)}
                  className="flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Onboarding</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {(!drivers || drivers.length === 0) && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <UserX className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-500">No drivers found</span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DriversTable;
