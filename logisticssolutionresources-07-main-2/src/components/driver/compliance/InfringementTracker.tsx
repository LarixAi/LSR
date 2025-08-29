
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileText, Calendar, DollarSign, Scale, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface InfringementTrackerProps {
  driverId: string;
}

const InfringementTracker: React.FC<InfringementTrackerProps> = ({ driverId }) => {
  const [selectedInfringement, setSelectedInfringement] = useState<string | null>(null);

  // Mock infringement data
  const infringements = [
    {
      id: '1',
      type: 'Speed Violation',
      description: 'Exceeding speed limit by 15 km/h',
      date: '2024-05-15',
      location: 'Highway A1, Mile 45',
      fineAmount: 150,
      points: 3,
      status: 'paid',
      dueDate: '2024-06-15',
      referenceNumber: 'SPD-2024-001',
      severity: 'moderate'
    },
    {
      id: '2',
      type: 'Documentation',
      description: 'Vehicle inspection certificate expired',
      date: '2024-04-20',
      location: 'Checkpoint B',
      fineAmount: 200,
      points: 2,
      status: 'resolved',
      dueDate: '2024-05-20',
      referenceNumber: 'DOC-2024-002',
      severity: 'minor'
    }
  ];

  const currentPoints = infringements.reduce((total, inf) => total + inf.points, 0);
  const totalFines = infringements.reduce((total, inf) => total + inf.fineAmount, 0);
  const activeInfringements = infringements.filter(inf => inf.status !== 'resolved').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case 'resolved':
        return <Badge className="bg-blue-100 text-blue-800">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'text-yellow-600';
      case 'moderate': return 'text-orange-600';
      case 'major': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Infringements</p>
                <p className="text-2xl font-bold text-red-600">{activeInfringements}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-orange-600">{currentPoints}</p>
                <p className="text-xs text-gray-500">Out of 12 limit</p>
              </div>
              <Scale className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fines</p>
                <p className="text-2xl font-bold text-blue-600">${totalFines}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Record Status</p>
                <Badge className="bg-green-100 text-green-800">Good Standing</Badge>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Infringements List */}
      <Card>
        <CardHeader>
          <CardTitle>Infringement History</CardTitle>
          <CardDescription>
            Track all traffic violations and compliance issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          {infringements.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Clean Record</h3>
              <p className="text-gray-600">No infringements on record. Keep up the great work!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {infringements.map((infringement) => (
                <div key={infringement.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{infringement.type}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getSeverityColor(infringement.severity)}`}
                        >
                          {infringement.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{infringement.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(infringement.date), 'MMM dd, yyyy')}
                        </span>
                        <span>Ref: {infringement.referenceNumber}</span>
                        <span>{infringement.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(infringement.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center text-red-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ${infringement.fineAmount}
                      </div>
                      <div className="flex items-center text-orange-600">
                        <Scale className="w-4 h-4 mr-1" />
                        {infringement.points} points
                      </div>
                      {infringement.status === 'pending' && (
                        <div className="text-gray-600">
                          Due: {format(new Date(infringement.dueDate), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Points System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Points System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Current Points</span>
              <span className="font-semibold">{currentPoints}/12</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  currentPoints <= 3 ? 'bg-green-500' :
                  currentPoints <= 6 ? 'bg-yellow-500' :
                  currentPoints <= 9 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${(currentPoints / 12) * 100}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800">0-3 Points</p>
                <p className="text-green-600">Good Standing</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="font-medium text-yellow-800">4-9 Points</p>
                <p className="text-yellow-600">Warning Level</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="font-medium text-red-800">10+ Points</p>
                <p className="text-red-600">License Suspension Risk</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfringementTracker;
