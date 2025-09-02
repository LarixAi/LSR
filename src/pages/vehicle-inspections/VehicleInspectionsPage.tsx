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
  Wrench
} from 'lucide-react';
import { useVehicleInspections, VehicleInspection } from '@/hooks/useVehicleInspections';
import { format } from 'date-fns';
import SmartInspectionForm from '@/components/inspections/SmartInspectionForm';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const VehicleInspectionsPage = () => {
  const { profile } = useAuth();
  const { selectedOrganizationId } = useOrganization();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [driverFilter, setDriverFilter] = useState<string>('all');
  const [selectedInspection, setSelectedInspection] = useState<VehicleInspection | null>(null);
  const [showSmartInspectionForm, setShowSmartInspectionForm] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Determine if this is a driver viewing their own inspections
  const isDriver = profile?.role === 'driver';
  const driverId = isDriver ? profile?.id : undefined;

  const { 
    inspections, 
    isLoading, 
    error, 
    inspectionStats 
  } = useVehicleInspections(selectedOrganizationId, driverId);

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

  const getTypeBadge = (type: string) => {
    const variants = {
      daily_check: 'bg-blue-100 text-blue-800 border-blue-200',
      pre_trip: 'bg-purple-100 text-purple-800 border-purple-200',
      post_trip: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      weekly: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      monthly: 'bg-teal-100 text-teal-800 border-teal-200',
      initial: 'bg-orange-100 text-orange-800 border-orange-200',
      recheck: 'bg-pink-100 text-pink-800 border-pink-200',
      breakdown: 'bg-red-100 text-red-800 border-red-200'
    };
    return variants[type as keyof typeof variants] || 'bg-gray-100 text-gray-800 border-gray-200';
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
    const matchesType = typeFilter === 'all' || inspection.inspection_type === typeFilter;
    const matchesDriver = driverFilter === 'all' || inspection.driver_id === driverFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesDriver;
  });

  // Get unique drivers for filter dropdown
  const uniqueDrivers = Array.from(new Set(inspections.map(i => i.driver_id)))
    .map(id => inspections.find(i => i.driver_id === id)?.driver)
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
      default:
        return filteredInspections;
    }
  };

  const openViewDialog = (inspection: VehicleInspection) => {
    setSelectedInspection(inspection);
    setShowViewDialog(true);
  };

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
            {isDriver ? 'Your vehicle inspection history' : 'All vehicle inspections by drivers'}
          </p>
        </div>
        {!isDriver && (
          <Button onClick={() => setShowSmartInspectionForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Inspection
          </Button>
        )}
      </div>

      {/* Stats Cards */}
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
              <CardTitle className="text-sm font-medium">Passed Inspections</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{inspectionStats.byStatus.passed}</div>
              <p className="text-xs text-muted-foreground">
                {inspectionStats.total > 0 ? Math.round((inspectionStats.byStatus.passed / inspectionStats.total) * 100) : 0}% pass rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Defects Found</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{inspectionStats.defectsFound}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Inspections</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{inspectionStats.byStatus.failed}</div>
              <p className="text-xs text-muted-foreground">
                Critical issues
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search inspections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="daily_check">Daily Check</SelectItem>
                  <SelectItem value="pre_trip">Pre-Trip</SelectItem>
                  <SelectItem value="post_trip">Post-Trip</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="initial">Initial</SelectItem>
                  <SelectItem value="recheck">Recheck</SelectItem>
                  <SelectItem value="breakdown">Breakdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!isDriver && (
              <div>
                <label className="text-sm font-medium">Driver</label>
                <Select value={driverFilter} onValueChange={setDriverFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All drivers" />
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inspections Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({filteredInspections.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({inspectionStats?.byStatus.pending || 0})</TabsTrigger>
          <TabsTrigger value="passed">Passed ({inspectionStats?.byStatus.passed || 0})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged ({inspectionStats?.byStatus.flagged || 0})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({inspectionStats?.byStatus.failed || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {getTabInspections(activeTab).length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Inspections Found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || driverFilter !== 'all'
                  ? 'No inspections match your current filters'
                  : 'No vehicle inspections found. Start by conducting your first inspection.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {getTabInspections(activeTab).map((inspection) => (
                <Card key={inspection.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {inspection.vehicle?.vehicle_number} - {inspection.vehicle?.make} {inspection.vehicle?.model}
                          </h3>
                                          <Badge className={getStatusBadge(inspection.overall_status)}>
                  {getStatusIcon(inspection.overall_status)}
                  {inspection.overall_status}
                </Badge>
                          <Badge className={getTypeBadge(inspection.inspection_type)}>
                            {inspection.inspection_type.replace('_', ' ')}
                          </Badge>
                          {inspection.defects_found && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Defects Found
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Driver:</span> {inspection.driver?.first_name} {inspection.driver?.last_name}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {inspection.inspection_date ? format(new Date(inspection.inspection_date), 'MMM dd, yyyy') : 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Time:</span> {inspection.start_time ? format(new Date(inspection.start_time), 'HH:mm') : 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">License Plate:</span> {inspection.vehicle?.license_plate}
                          </div>
                        </div>

                        {inspection.notes && (
                          <p className="text-gray-700 mb-4">{inspection.notes}</p>
                        )}

                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              {inspection.created_at ? format(new Date(inspection.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
                            </span>
                          </div>
                          {inspection.end_time && inspection.start_time && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                Duration: {Math.round((new Date(inspection.end_time).getTime() - new Date(inspection.start_time).getTime()) / 60000)} min
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewDialog(inspection)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Inspection Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="inspection-details-desc">
          <DialogHeader>
            <DialogTitle>Inspection Details</DialogTitle>
            <DialogDescription id="inspection-details-desc">
              View complete inspection information
            </DialogDescription>
          </DialogHeader>
          {selectedInspection && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Vehicle</label>
                  <p className="text-lg font-medium">
                    {selectedInspection.vehicle?.vehicle_number} - {selectedInspection.vehicle?.make} {selectedInspection.vehicle?.model}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">License Plate</label>
                  <p className="text-lg font-medium">{selectedInspection.vehicle?.license_plate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Driver</label>
                  <p className="text-lg font-medium">
                    {selectedInspection.driver?.first_name} {selectedInspection.driver?.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                                  <Badge className={getStatusBadge(selectedInspection.overall_status)}>
                  {getStatusIcon(selectedInspection.overall_status)}
                  {selectedInspection.overall_status}
                </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <Badge className={getTypeBadge(selectedInspection.inspection_type)}>
                    {selectedInspection.inspection_type.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-lg font-medium">
                    {selectedInspection.inspection_date ? format(new Date(selectedInspection.inspection_date), 'MMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Time</label>
                  <p className="text-lg font-medium">
                    {selectedInspection.start_time ? format(new Date(selectedInspection.start_time), 'HH:mm') : 'N/A'}
                  </p>
                </div>
                {selectedInspection.end_time && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">End Time</label>
                                      <p className="text-lg font-medium">
                    {selectedInspection.end_time ? format(new Date(selectedInspection.end_time), 'HH:mm') : 'N/A'}
                  </p>
                  </div>
                )}
              </div>
              
              {selectedInspection.defects_found && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-800">Defects Found</span>
                  </div>
                  <p className="text-red-700 mt-2">
                    This inspection identified defects that require attention.
                  </p>
                </div>
              )}
              
              {selectedInspection.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-700 mt-1">{selectedInspection.notes}</p>
                </div>
              )}

              {selectedInspection.walkaround_data && Object.keys(selectedInspection.walkaround_data).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Walkaround Data</label>
                  <pre className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded border overflow-auto">
                    {JSON.stringify(selectedInspection.walkaround_data, null, 2)}
                  </pre>
                </div>
              )}

              {selectedInspection.location_data && Object.keys(selectedInspection.location_data).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Location Data</label>
                  <pre className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded border overflow-auto">
                    {JSON.stringify(selectedInspection.location_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Smart Inspection Form */}
      {showSmartInspectionForm && (
        <ErrorBoundary>
          <SmartInspectionForm
            onClose={() => setShowSmartInspectionForm(false)}
            onSuccess={() => {
              setShowSmartInspectionForm(false);
            }}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};

export default VehicleInspectionsPage;