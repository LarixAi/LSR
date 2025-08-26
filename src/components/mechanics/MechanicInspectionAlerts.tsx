import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Wrench, 
  Clock, 
  MapPin, 
  Car, 
  User, 
  Bell,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface FailedInspection {
  id: string;
  vehicle_id: string;
  driver_id: string;
  inspection_date: string;
  inspection_category: string;
  overall_status: string;
  defects_found: boolean;
  defects_details?: any;
  created_at: string;
  vehicle?: {
    vehicle_number: string;
    make: string;
    model: string;
    license_plate: string;
  };
  driver?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const MechanicInspectionAlerts = () => {
  const { profile } = useAuth();
  const { selectedOrganizationId } = useOrganization();
  const [selectedInspection, setSelectedInspection] = useState<FailedInspection | null>(null);

  // Fetch failed inspections
  const { data: failedInspections = [], isLoading } = useQuery({
    queryKey: ['failed-inspections', selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) return [];

      try {
        const { data, error } = await supabase
          .from('vehicle_inspections')
          .select(`
            *,
            vehicle:vehicles(vehicle_number, make, model, license_plate),
            driver:profiles(first_name, last_name, email)
          `)
          .eq('organization_id', selectedOrganizationId)
          .eq('overall_status', 'failed')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching failed inspections:', error);
          return [];
        }

        return data as FailedInspection[];
      } catch (error) {
        console.error('Error in failed inspections query:', error);
        return [];
      }
    },
    enabled: !!selectedOrganizationId
  });

  // Fetch recent failed inspections (last 7 days)
  const { data: recentFailedInspections = [] } = useQuery({
    queryKey: ['recent-failed-inspections', selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) return [];

      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data, error } = await supabase
          .from('vehicle_inspections')
          .select(`
            *,
            vehicle:vehicles(vehicle_number, make, model, license_plate),
            driver:profiles(first_name, last_name, email)
          `)
          .eq('organization_id', selectedOrganizationId)
          .eq('overall_status', 'failed')
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching recent failed inspections:', error);
          return [];
        }

        return data as FailedInspection[];
      } catch (error) {
        console.error('Error in recent failed inspections query:', error);
        return [];
      }
    },
    enabled: !!selectedOrganizationId
  });

  // Fetch inspection statistics
  const { data: inspectionStats } = useQuery({
    queryKey: ['inspection-stats', selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) return null;

      try {
        const [totalInspections, failedInspections, todayInspections] = await Promise.all([
          supabase
            .from('vehicle_inspections')
            .select('id', { count: 'exact' })
            .eq('organization_id', selectedOrganizationId),
          supabase
            .from('vehicle_inspections')
            .select('id', { count: 'exact' })
            .eq('organization_id', selectedOrganizationId)
            .eq('overall_status', 'failed'),
          supabase
            .from('vehicle_inspections')
            .select('id', { count: 'exact' })
            .eq('organization_id', selectedOrganizationId)
            .gte('created_at', new Date().toISOString().split('T')[0])
        ]);

        return {
          total: totalInspections.count || 0,
          failed: failedInspections.count || 0,
          today: todayInspections.count || 0,
          failureRate: totalInspections.count ? Math.round((failedInspections.count || 0) / totalInspections.count * 100) : 0
        };
      } catch (error) {
        console.error('Error fetching inspection stats:', error);
        return null;
      }
    },
    enabled: !!selectedOrganizationId
  });

  const handleCreateWorkOrder = async (inspection: FailedInspection) => {
    try {
      // Create work order logic here
      toast.success(`Work order created for vehicle ${inspection.vehicle?.vehicle_number}`);
    } catch (error) {
      toast.error('Failed to create work order');
    }
  };

  const handleMarkAsReviewed = async (inspection: FailedInspection) => {
    try {
      // Mark inspection as reviewed logic here
      toast.success('Inspection marked as reviewed');
    } catch (error) {
      toast.error('Failed to mark inspection as reviewed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading failed inspections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mechanic Inspection Alerts</h1>
          <p className="text-gray-600 mt-2">Failed inspections requiring immediate attention</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="destructive" className="text-sm">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {failedInspections.length} Failed Inspections
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      {inspectionStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inspectionStats.total}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Inspections</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{inspectionStats.failed}</div>
              <p className="text-xs text-muted-foreground">
                {inspectionStats.failureRate}% failure rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Inspections</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inspectionStats.today}</div>
              <p className="text-xs text-muted-foreground">
                Inspections today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Failures</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{recentFailedInspections.length}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Failed Inspections List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            Failed Inspections Requiring Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          {failedInspections.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Failed Inspections</h3>
              <p className="text-gray-600">All inspections are passing. Great work!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {failedInspections.map((inspection) => (
                <Card key={inspection.id} className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <Car className="w-5 h-5 text-red-600" />
                            <h3 className="font-semibold text-red-900">
                              {inspection.vehicle?.vehicle_number} - {inspection.vehicle?.make} {inspection.vehicle?.model}
                            </h3>
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            FAILED
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">License Plate:</span>
                            <p className="text-gray-600">{inspection.vehicle?.license_plate}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Driver:</span>
                            <p className="text-gray-600">{inspection.driver?.first_name} {inspection.driver?.last_name}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Inspection Type:</span>
                            <p className="text-gray-600">{inspection.inspection_category.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Date:</span>
                            <p className="text-gray-600">{format(new Date(inspection.inspection_date), 'MMM dd, yyyy')}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Time:</span>
                            <p className="text-gray-600">{format(new Date(inspection.created_at), 'HH:mm:ss')}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Defects:</span>
                            <p className="text-red-600 font-medium">
                              {inspection.defects_found ? 'Yes' : 'No'}
                            </p>
                          </div>
                        </div>

                        {inspection.defects_details?.description && (
                          <div className="mt-3 p-3 bg-red-100 rounded">
                            <p className="text-sm text-red-800 font-medium">Defects Found:</p>
                            <p className="text-sm text-red-700">{inspection.defects_details.description}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCreateWorkOrder(inspection)}
                        >
                          <Wrench className="w-4 h-4 mr-2" />
                          Create Work Order
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInspection(inspection)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsReviewed(inspection)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Reviewed
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentFailedInspections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-600" />
              Recent Failed Inspections (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentFailedInspections.slice(0, 5).map((inspection) => (
                <div key={inspection.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">
                        {inspection.vehicle?.vehicle_number} - {inspection.vehicle?.license_plate}
                      </p>
                      <p className="text-sm text-gray-600">
                        {inspection.driver?.first_name} {inspection.driver?.last_name} • {inspection.inspection_category.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(inspection.created_at), 'MMM dd, HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Wrench className="h-6 w-6 text-blue-600" />
              <div className="text-center">
                <div className="font-semibold">Create Work Order</div>
                <div className="text-xs text-gray-600">Generate work order for failed inspection</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <FileText className="h-6 w-6 text-green-600" />
              <div className="text-center">
                <div className="font-semibold">Inspection Reports</div>
                <div className="text-xs text-gray-600">View detailed inspection reports</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Bell className="h-6 w-6 text-orange-600" />
              <div className="text-center">
                <div className="font-semibold">Alert Settings</div>
                <div className="text-xs text-gray-600">Configure inspection alerts</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MechanicInspectionAlerts;


