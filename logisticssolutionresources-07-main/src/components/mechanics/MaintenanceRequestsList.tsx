
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Calendar, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { useMaintenanceRequests } from '@/hooks/useMaintenanceRequests';
import { format } from 'date-fns';

interface MaintenanceRequestsListProps {
  onCreateRequest: () => void;
}

const MaintenanceRequestsList = ({ onCreateRequest }: MaintenanceRequestsListProps) => {
  const { data: requests = [], isLoading, error } = useMaintenanceRequests();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-500">Loading maintenance requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading maintenance requests: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Maintenance Requests</h3>
          <p className="text-sm text-gray-600">Track vehicle maintenance and repairs</p>
        </div>
        <Button onClick={onCreateRequest}>
          <Plus className="w-4 h-4 mr-2" />
          Create Request
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No maintenance requests found</p>
            <Button onClick={onCreateRequest} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create First Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mechanic</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.vehicles?.vehicle_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.vehicles?.license_plate}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.title}</div>
                        {request.description && (
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {request.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(request.priority || 'medium')}>
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status || 'pending')}>
                        {request.status?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.mechanics?.profiles ? (
                        <div className="text-sm">
                          {request.mechanics.profiles.first_name} {request.mechanics.profiles.last_name}
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {request.scheduled_date ? (
                        <div className="flex items-center text-sm">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(request.scheduled_date), 'MMM dd, yyyy')}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {request.estimated_cost && (
                          <div className="flex items-center text-sm">
                            <DollarSign className="w-3 h-3 mr-1" />
                            Est: ${request.estimated_cost}
                          </div>
                        )}
                        {request.actual_cost && (
                          <div className="flex items-center text-sm font-medium">
                            <DollarSign className="w-3 h-3 mr-1" />
                            Actual: ${request.actual_cost}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MaintenanceRequestsList;
