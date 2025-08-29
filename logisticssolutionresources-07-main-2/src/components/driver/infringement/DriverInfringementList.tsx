import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Eye, Scale, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface DriverInfringementListProps {
  infringements: any[];
  loading: boolean;
}

const DriverInfringementList = ({ infringements, loading }: DriverInfringementListProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'under_review':
        return <Badge variant="outline">Under Review</Badge>;
      case 'confirmed':
        return <Badge variant="destructive">Confirmed</Badge>;
      case 'dismissed':
        return <Badge variant="default">Dismissed</Badge>;
      case 'appealed':
        return <Badge variant="secondary">Appealed</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700">High</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p>Loading your infringements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Infringement #</TableHead>
                  <TableHead>Violation Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Fine</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {infringements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No infringements found</p>
                        <p className="text-sm text-muted-foreground">
                          You have a clean driving record!
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  infringements.map((infringement) => (
                    <TableRow key={infringement.id}>
                      <TableCell>
                        <div className="font-mono font-medium">
                          {infringement.infringement_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {infringement.infringement_types?.name}
                          </div>
                          {infringement.location && (
                            <div className="text-sm text-muted-foreground">
                              {infringement.location}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(infringement.incident_date), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(infringement.severity)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {infringement.penalty_points}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            £{(infringement.fine_amount || 0).toFixed(2)}
                          </div>
                          {infringement.paid_date && (
                            <div className="text-xs text-green-600">
                              Paid {format(new Date(infringement.paid_date), 'dd/MM/yy')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(infringement.status)}
                      </TableCell>
                      <TableCell>
                        {infringement.due_date ? (
                          <div className="text-sm">
                            {format(new Date(infringement.due_date), 'dd/MM/yyyy')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          {['pending', 'confirmed'].includes(infringement.status) && (
                            <Button variant="outline" size="sm" className="text-blue-600">
                              <Scale className="h-3 w-3" />
                              Appeal
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800">Penalty Points Information</h4>
              <p className="text-sm text-blue-700 mt-1">
                Under UK law, drivers who accumulate 12 or more penalty points within a 3-year period 
                may face license disqualification. If you believe an infringement was issued in error, 
                you have the right to appeal within 28 days of the notice.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverInfringementList;