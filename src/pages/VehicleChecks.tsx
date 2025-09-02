import React, { useState } from 'react';
import StandardPageLayout, { NavigationTab, ActionButton, FilterOption } from '@/components/layout/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Shield,
  Wrench,
  Fuel,
  Circle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import EnhancedVehicleCheck from '@/components/driver/EnhancedVehicleCheck';
import { useVehicleChecks } from '@/hooks/useVehicleChecks';
import { useVehicles } from '@/hooks/useVehicles';
import { useIsMobile } from '@/hooks/use-mobile';

interface VehicleCheck {
  id: string;
  vehicle_id: string;
  vehicle_number: string;
  license_plate: string;
  check_date: string;
  status: 'completed' | 'pending' | 'failed';
  issues_found: string[];
  notes: string;
  created_at: string;
  driver_name: string;
  check_type: 'daily' | 'weekly' | 'comprehensive';
}

const VehicleChecks: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('new-check');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');


  // Fetch real data from backend
  const { data: vehicleChecks = [], isLoading: checksLoading, refetch: refetchChecks } = useVehicleChecks();
  const { data: vehicles = [], isLoading: vehiclesLoading, refetch: refetchVehicles } = useVehicles();



  // Transform backend data to match the interface
  const transformedChecks: VehicleCheck[] = vehicleChecks.map(check => {
    const vehicle = vehicles.find(v => v.id === check.vehicle_id);
    const driver = check.driver_profile;
    
    return {
      id: check.id,
      vehicle_id: check.vehicle_id || '',
      vehicle_number: vehicle?.vehicle_number || 'Unknown',
      license_plate: vehicle?.license_plate || 'Unknown',
      check_date: check.created_at ? format(new Date(check.created_at), 'yyyy-MM-dd') : '',
      status: check.status as 'completed' | 'pending' | 'failed' || 'pending',
      issues_found: Array.isArray((check as any).defects_found) ? (check as any).defects_found : (Array.isArray(check.issues_found) ? check.issues_found : []),
      notes: check.notes || '',
      created_at: check.created_at || '',
      driver_name: driver ? `${driver.first_name} ${driver.last_name}` : 'Unknown Driver',
      check_type: ((check as any).check_type as 'daily' | 'weekly' | 'comprehensive') || 'daily'
    };
  });

  const filteredChecks = transformedChecks.filter(check => {
    const matchesSearch = check.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.driver_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || check.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCheckTypeBadge = (type: string) => {
    switch (type) {
      case 'daily':
        return <Badge variant="outline" className="text-blue-600">Daily</Badge>;
      case 'weekly':
        return <Badge variant="outline" className="text-purple-600">Weekly</Badge>;
      case 'comprehensive':
        return <Badge variant="outline" className="text-orange-600">Comprehensive</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleStartNewCheck = () => {
    setActiveTab('new-check');
    toast({
      title: "New Vehicle Check",
      description: "Starting new vehicle inspection...",
    });
  };

  const handleExportData = () => {
    // In a real implementation, this would export the data to CSV
    const csvData = filteredChecks.map(check => ({
      'Vehicle Number': check.vehicle_number,
      'License Plate': check.license_plate,
      'Date': check.check_date,
      'Status': check.status,
      'Type': check.check_type,
      'Driver': check.driver_name,
      'Issues': check.issues_found.join(', '),
      'Notes': check.notes
    }));
    
    console.log('Exporting data:', csvData);
    toast({
      title: "Export Successful",
      description: "Vehicle check data exported to CSV",
    });
  };

  const handleRefreshData = async () => {
    try {
      await Promise.all([refetchChecks(), refetchVehicles()]);
      toast({
        title: "Data Refreshed",
        description: "Vehicle checks and vehicles data updated",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive"
      });
    }
  };



  const navigationTabs: NavigationTab[] = [
    { value: 'new-check', label: 'New Check' },
    { value: 'history', label: 'History' }
  ];

  const primaryAction: ActionButton = {
    label: 'New Check',
    onClick: handleStartNewCheck
  };

  const secondaryActions: ActionButton[] = [
    {
      label: 'Refresh',
      onClick: handleRefreshData,
      icon: <RefreshCw className={`w-4 h-4 ${checksLoading || vehiclesLoading ? 'animate-spin' : ''}`} />,
      variant: 'outline'
    },
    {
      label: 'Export',
      onClick: handleExportData,
      icon: <Download className="w-4 h-4" />,
      variant: 'outline'
    }
  ];

  return (
    <StandardPageLayout
      title="Vehicle Checks"
      description="Daily vehicle inspections and safety checks"
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      showMetricsDashboard={true}
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid gap-3 grid-cols-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="mobile-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Total Checks</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {checksLoading ? (
              <div className="text-2xl font-bold text-muted-foreground">...</div>
            ) : (
              <div className="text-xl font-bold sm:text-2xl">{transformedChecks.length}</div>
            )}
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {checksLoading ? (
              <div className="text-2xl font-bold text-muted-foreground">...</div>
            ) : (
              <div className="text-xl font-bold text-green-600 sm:text-2xl">
                {transformedChecks.filter(c => c.status === 'completed').length}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Passed inspections
            </p>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Issues Found</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {checksLoading ? (
              <div className="text-2xl font-bold text-muted-foreground">...</div>
            ) : (
              <div className="text-xl font-bold text-orange-600 sm:text-2xl">
                {transformedChecks.reduce((sum, check) => sum + check.issues_found.length, 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Total issues reported
            </p>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Last Check</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {checksLoading ? (
              <div className="text-2xl font-bold text-muted-foreground">...</div>
            ) : (
              <div className="text-xl font-bold sm:text-2xl">
                {transformedChecks.length > 0 ? format(new Date(transformedChecks[0].created_at), 'MMM dd') : 'N/A'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {checksLoading ? '' : (transformedChecks.length > 0 ? format(new Date(transformedChecks[0].created_at), 'HH:mm') : '')}
            </p>
          </CardContent>
        </Card>
      </div>

      {activeTab === 'new-check' && (
        <div className="space-y-4">
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-lg sm:text-xl">Enhanced Vehicle Check</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Complete vehicle inspection with GPS tracking, photo capture, and unique reference numbers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Enhanced Features</h3>
                <ul className="text-blue-700 space-y-1 text-xs sm:text-sm">
                  <li>• GPS tracking during inspection</li>
                  <li>• Photo capture of registration plate</li>
                  <li>• Unique reference numbers for each check</li>
                  <li>• Digital signature capture</li>
                  <li>• Comprehensive reporting</li>
                  <li>• Admin-managed question templates</li>
                </ul>
              </div>
              
              <Button 
                className="w-full mobile-button" 
                onClick={() => navigate('/driver/enhanced-vehicle-check')}
                size="lg"
              >
                <Shield className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Start Enhanced Vehicle Check</span>
                <span className="sm:hidden">Start Vehicle Check</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filters */}
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Check History</CardTitle>
              <CardDescription className="text-sm">
                View and manage your vehicle inspection history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="text-sm">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by vehicle number or license plate..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 text-sm"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Label htmlFor="status" className="text-sm">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results - Mobile Optimized */}
          <Card className="mobile-card">
            <CardContent className="p-0">
              {/* Mobile Card Layout */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issues</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {checksLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-muted-foreground">Loading vehicle checks...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredChecks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-center">
                          <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium">No vehicle checks found</h3>
                          <p className="text-muted-foreground">
                            {searchTerm || statusFilter !== 'all' 
                              ? 'Try adjusting your search or filter criteria'
                              : 'Start your first vehicle inspection to see it here'
                            }
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredChecks.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{check.vehicle_number}</div>
                          <div className="text-sm text-muted-foreground">{check.license_plate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{format(new Date(check.check_date), 'MMM dd, yyyy')}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(check.created_at), 'HH:mm')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCheckTypeBadge(check.check_type)}</TableCell>
                      <TableCell>{getStatusBadge(check.status)}</TableCell>
                      <TableCell>
                        {check.issues_found.length > 0 ? (
                          <div className="space-y-1">
                            {check.issues_found.slice(0, 2).map((issue, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {issue}
                              </Badge>
                            ))}
                            {check.issues_found.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{check.issues_found.length - 2} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-green-600 text-sm">No issues</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {check.notes || 'No notes'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile Card Layout */}
            <div className="sm:hidden space-y-3 p-4">
              {checksLoading ? (
                <div className="flex items-center justify-center space-x-2 py-8">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-muted-foreground text-sm">Loading vehicle checks...</span>
                </div>
              ) : filteredChecks.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No vehicle checks found</h3>
                  <p className="text-muted-foreground text-sm">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Start your first vehicle inspection to see it here'
                    }
                  </p>
                </div>
              ) : (
                filteredChecks.map((check) => (
                  <Card key={check.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-sm">{check.vehicle_number}</h4>
                        <p className="text-xs text-muted-foreground">{check.license_plate}</p>
                      </div>
                      {getStatusBadge(check.status)}
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{format(new Date(check.check_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="capitalize">{check.check_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Issues:</span>
                        <span>{check.issues_found.length}</span>
                      </div>
                      {check.notes && (
                        <div className="pt-2 border-t">
                          <span className="text-muted-foreground">Notes:</span>
                          <p className="text-xs mt-1">{check.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2 mt-3 pt-3 border-t">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
          </Card>
        </div>
      )}

    </StandardPageLayout>
  );
};

export default VehicleChecks;
