import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Eye,
  Car,
  Calendar,
  FileText,
  Download,
  AlertCircle,
  Plus,
  Zap,
  User,
  TrendingUp,
  Shield,
  Wrench,
  CalendarDays,
  AlertOctagon,
  CheckSquare,
  Settings
} from 'lucide-react';
import { useEnhancedVehicleInspections, VehicleInspection, InspectionSchedule } from '@/hooks/useEnhancedVehicleInspections';
import { format } from 'date-fns';
import EnhancedInspectionDetails from '@/components/inspections/EnhancedInspectionDetails';

const EnhancedVehicleInspectionsPage = () => {
  const { profile } = useAuth();
  const { selectedOrganizationId } = useOrganization();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [driverFilter, setDriverFilter] = useState<string>('all');
  const [selectedInspection, setSelectedInspection] = useState<VehicleInspection | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<InspectionSchedule | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Determine if this is a driver viewing their own inspections
  const isDriver = profile?.role === 'driver';
  const driverId = isDriver ? profile?.id : undefined;

  const { 
    inspections, 
    schedules,
    templates,
    inspectionStats, 
    isLoading, 
    error 
  } = useEnhancedVehicleInspections(selectedOrganizationId, driverId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'flagged':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      passed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      flagged: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getCategoryBadge = (category: string) => {
    const variants = {
      daily: 'bg-blue-100 text-blue-800 border-blue-200',
      weekly: 'bg-purple-100 text-purple-800 border-purple-200',
      '4_weekly': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      '6_weekly': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      pre_trip: 'bg-orange-100 text-orange-800 border-orange-200',
      post_trip: 'bg-pink-100 text-pink-800 border-pink-200',
      breakdown: 'bg-red-100 text-red-800 border-red-200'
    };
    return variants[category as keyof typeof variants] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getScheduleStatusBadge = (status: string) => {
    const variants = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return variants[status as keyof typeof variants] || variants.scheduled;
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = !searchTerm || (
      inspection.vehicle?.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.vehicle?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.vehicle?.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.driver?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.driver?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = statusFilter === 'all' || inspection.overall_status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || inspection.inspection_category === categoryFilter;
    const matchesDriver = driverFilter === 'all' || inspection.driver_id === driverFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDriver;
  });

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = !searchTerm || (
      schedule.vehicle?.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.vehicle?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.vehicle?.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.driver?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.driver?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    const matchesDriver = driverFilter === 'all' || schedule.assigned_driver_id === driverFilter;
    
    return matchesSearch && matchesStatus && matchesDriver;
  });

  // Get unique drivers for filter dropdown
  const uniqueDrivers = Array.from(new Set([
    ...inspections.map(i => i.driver_id),
    ...schedules.map(s => s.assigned_driver_id)
  ]))
    .map(id => inspections.find(i => i.driver_id === id)?.driver || schedules.find(s => s.assigned_driver_id === id)?.driver)
    .filter(Boolean);

  // Filter by tab
  const getTabInspections = (tab: string) => {
    switch (tab) {
      case 'pending':
        return filteredInspections.filter(vi => vi.overall_status === 'pending');
      case 'passed':
        return filteredInspections.filter(vi => vi.overall_status === 'passed');
      case 'flagged':
        return filteredInspections.filter(vi => vi.overall_status === 'flagged');
      case 'failed':
        return filteredInspections.filter(vi => vi.overall_status === 'failed');
      case 'scheduled':
        return filteredSchedules;
      default:
        return filteredInspections;
    }
  };

  const openViewDialog = (inspection: VehicleInspection) => {
    setSelectedInspection(inspection);
    setShowViewDialog(true);
  };

  const openScheduleDialog = (schedule: InspectionSchedule) => {
    setSelectedSchedule(schedule);
    setShowScheduleDialog(true);
  };

  // Show setup message if database tables don't exist
  if (error && (error.message?.includes('inspection_schedules') || error.message?.includes('inspection_templates'))) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Enhanced Vehicle Inspections System</h1>
          <p className="text-lg text-gray-600 mb-8">
            The enhanced vehicle inspections system needs to be set up in your database.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Setup Required</h2>
            <ol className="text-left text-blue-800 space-y-2">
              <li>1. Go to your Supabase Dashboard</li>
              <li>2. Open SQL Editor</li>
              <li>3. Run the script: <code className="bg-blue-100 px-2 py-1 rounded">sql/fixes/enhanced_vehicle_inspections_system.sql</code></li>
              <li>4. Refresh this page</li>
            </ol>
            <div className="mt-6">
              <Button 
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Open Supabase Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading inspections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900">Error Loading Inspections</h3>
          <p className="text-gray-600">Failed to load vehicle inspections. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Inspections</h1>
          <p className="text-gray-600 mt-2">
            {isDriver ? 'Your vehicle inspection history' : 'All vehicle inspections and schedules'}
          </p>
        </div>
        {!isDriver && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => window.location.href = '/vehicle-management-settings'}>
              <Settings className="h-4 w-4 mr-2" />
              Inspection Settings
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Inspection
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Stats Cards */}
      {inspectionStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inspectionStats.total}</div>
              <p className="text-xs text-muted-foreground">
                {inspectionStats.recentInspections} in last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Schedules</CardTitle>
              <CalendarDays className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inspectionStats.upcomingSchedules}</div>
              <p className="text-xs text-muted-foreground">
                Next 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Schedules</CardTitle>
              <AlertOctagon className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inspectionStats.overdueSchedules}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Defects Found</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inspectionStats.defectsFound}</div>
              <p className="text-xs text-muted-foreground">
                Total issues detected
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Breakdown */}
      {inspectionStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Daily Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{inspectionStats.byCategory.daily}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">4-Weekly</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{inspectionStats.byCategory['4_weekly']}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">6-Weekly</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{inspectionStats.byCategory['6_weekly']}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pre/Post Trip</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{inspectionStats.byCategory.pre_trip + inspectionStats.byCategory.post_trip}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search vehicles, drivers, or license plates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="4_weekly">4-Weekly</SelectItem>
            <SelectItem value="6_weekly">6-Weekly</SelectItem>
            <SelectItem value="pre_trip">Pre-Trip</SelectItem>
            <SelectItem value="post_trip">Post-Trip</SelectItem>
            <SelectItem value="breakdown">Breakdown</SelectItem>
          </SelectContent>
        </Select>
        <Select value={driverFilter} onValueChange={setDriverFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Drivers</SelectItem>
            {uniqueDrivers.map((driver) => (
              <SelectItem key={driver?.id} value={driver?.id || ''}>
                {driver?.first_name} {driver?.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="passed">Passed</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {activeTab === 'scheduled' ? (
            // Scheduled Inspections
            <div className="space-y-4">
              {filteredSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Inspections</h3>
                  <p className="text-gray-600">No inspection schedules found for the selected filters.</p>
                </div>
              ) : (
                filteredSchedules.map((schedule) => (
                  <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <Car className="h-8 w-8 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">
                              {schedule.vehicle?.vehicle_number} - {schedule.vehicle?.make} {schedule.vehicle?.model}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {schedule.vehicle?.license_plate} • {schedule.template?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Assigned to: {schedule.driver?.first_name} {schedule.driver?.last_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {format(new Date(schedule.scheduled_date), 'MMM dd, yyyy')}
                            </p>
                            <Badge className={getScheduleStatusBadge(schedule.status)}>
                              {schedule.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openScheduleDialog(schedule)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            // Completed Inspections
            <div className="space-y-4">
              {filteredInspections.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Inspections Found</h3>
                  <p className="text-gray-600">No inspections found for the selected filters.</p>
                </div>
              ) : (
                filteredInspections.map((inspection) => (
                  <Card key={inspection.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <CheckSquare className="h-8 w-8 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">
                              {inspection.vehicle?.vehicle_number} - {inspection.vehicle?.make} {inspection.vehicle?.model}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusBadge(inspection.overall_status)}>
                                {getStatusIcon(inspection.overall_status)}
                                {inspection.overall_status}
                              </Badge>
                              {inspection.inspection_category && (
                                <Badge className={getCategoryBadge(inspection.inspection_category)}>
                                  {inspection.inspection_category.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {inspection.vehicle?.license_plate} • {inspection.driver?.first_name} {inspection.driver?.last_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(inspection.inspection_date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {inspection.defects_found && (
                            <Badge variant="destructive" className="text-xs">
                              Defects Found
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewDialog(inspection)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Inspection Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="inspection-details-description">
          <DialogHeader>
            <DialogTitle>Inspection Details</DialogTitle>
            <DialogDescription id="inspection-details-description">
              View comprehensive inspection information including GPS coordinates, detailed questions, and inspection results.
            </DialogDescription>
          </DialogHeader>
          {selectedInspection && (
            <EnhancedInspectionDetails 
              inspection={selectedInspection}
              onClose={() => setShowViewDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="schedule-details-description">
          <DialogHeader>
            <DialogTitle>Scheduled Inspection Details</DialogTitle>
            <DialogDescription id="schedule-details-description">
              View details of scheduled vehicle inspections including vehicle, driver, and inspection type information.
            </DialogDescription>
          </DialogHeader>
          {selectedSchedule && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Vehicle</label>
                  <p className="text-sm">{selectedSchedule.vehicle?.vehicle_number} - {selectedSchedule.vehicle?.make} {selectedSchedule.vehicle?.model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">License Plate</label>
                  <p className="text-sm">{selectedSchedule.vehicle?.license_plate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned Driver</label>
                  <p className="text-sm">{selectedSchedule.driver?.first_name} {selectedSchedule.driver?.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Scheduled Date</label>
                  <p className="text-sm">{format(new Date(selectedSchedule.scheduled_date), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Inspection Type</label>
                  <p className="text-sm">{selectedSchedule.template?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge className={getScheduleStatusBadge(selectedSchedule.status)}>
                    {selectedSchedule.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              {selectedSchedule.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-sm mt-1">{selectedSchedule.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedVehicleInspectionsPage;
