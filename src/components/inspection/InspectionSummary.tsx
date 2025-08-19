import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Car,
  FileText,
  Eye
} from 'lucide-react';
import { useVehicleInspections } from '@/hooks/useVehicleInspections';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const InspectionSummary = () => {
  const { profile } = useAuth();
  const isDriver = profile?.role === 'driver';
  const driverId = isDriver ? profile?.id : undefined;

  const { data: inspections = [], isLoading } = useVehicleInspections(driverId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'flagged':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      passed: 'bg-success/10 text-success border-success/20',
      failed: 'bg-destructive/10 text-destructive border-destructive/20',
      flagged: 'bg-warning/10 text-warning border-warning/20',
      pending: 'bg-muted text-muted-foreground'
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  // Get recent inspections (last 3)
  const recentInspections = inspections.slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5" />
          {isDriver ? 'My Recent Inspections' : 'Recent Inspections'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentInspections.length === 0 ? (
          <div className="text-center py-6">
            <Car className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No inspections recorded yet</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.href = '/driver/walk-around'}
            >
              Start Inspection
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {recentInspections.map((inspection) => (
                <div key={inspection.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Car className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {(() => {
                          const hasVehicleData = (vehicles: any): vehicles is { vehicle_number?: string; make?: string; model?: string } => {
                            return vehicles && typeof vehicles === 'object' && !Array.isArray(vehicles);
                          };
                          return hasVehicleData(inspection.vehicles) 
                            ? `${inspection.vehicles.vehicle_number || 'Unknown'}`
                            : 'Unknown Vehicle';
                        })()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(inspection.inspection_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusBadge(inspection.overall_status)}>
                      {getStatusIcon(inspection.overall_status)}
                      <span className="ml-1 text-xs capitalize">{inspection.overall_status}</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/vehicle-inspections'}
              >
                <Eye className="w-4 h-4 mr-1" />
                View All
              </Button>
              
              <Button 
                size="sm"
                onClick={() => window.location.href = '/driver/walk-around'}
              >
                <FileText className="w-4 h-4 mr-1" />
                New Inspection
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InspectionSummary;