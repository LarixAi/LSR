import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Zap
} from 'lucide-react';
import { useVehicleInspections } from '@/hooks/useVehicleInspections';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import SmartInspectionForm from '@/components/inspections/SmartInspectionForm';
import { ErrorBoundary } from '@/components/ui/error-boundary';

// Type guard for vehicle data
const hasVehicleData = (vehicles: any): vehicles is { vehicle_number?: string; make?: string; model?: string; license_plate?: string } => {
  return vehicles && typeof vehicles === 'object' && !Array.isArray(vehicles);
};

const VehicleInspectionsPage = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);
  const [showSmartInspectionForm, setShowSmartInspectionForm] = useState(false);

  // Determine if this is a driver viewing their own inspections
  const isDriver = profile?.role === 'driver';
  const driverId = isDriver ? profile?.id : undefined;

  const { data: inspections = [], isLoading, error } = useVehicleInspections(driverId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
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

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = !searchTerm || (
      hasVehicleData(inspection.vehicles) && (
        inspection.vehicles.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.vehicles.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.vehicles.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.vehicles.license_plate?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    
    const matchesStatus = statusFilter === 'all' || inspection.overall_status === statusFilter;
    const matchesType = typeFilter === 'all' || inspection.inspection_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <p className="text-destructive">Error loading inspections</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">
            {isDriver ? 'My Vehicle Inspections' : 'Vehicle Inspections'}
          </h1>
          <p className="text-muted-foreground">
            {isDriver ? 'View your inspection history and results' : 'Monitor and manage vehicle inspections'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowSmartInspectionForm(true)}
            className="bg-gradient-primary text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            Smart Inspection
          </Button>
          
          {!isDriver && (
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/driver/walk-around'}
            >
              <FileText className="w-4 h-4 mr-2" />
              Manual Inspection
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by vehicle number, make, model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="initial">Initial</SelectItem>
                <SelectItem value="recheck">Recheck</SelectItem>
                <SelectItem value="breakdown">Breakdown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inspections List */}
      <div className="grid gap-4">
        {filteredInspections.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No inspections found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'No vehicle inspections have been recorded yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInspections.map((inspection) => (
            <Card key={inspection.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Car className="w-6 h-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {hasVehicleData(inspection.vehicles) 
                            ? `${inspection.vehicles.vehicle_number || 'Unknown Vehicle'} - ${inspection.vehicles.make || ''} ${inspection.vehicles.model || ''}`
                            : 'Unknown Vehicle'
                          }
                        </h3>
                        <Badge className={getStatusBadge(inspection.overall_status)}>
                          {getStatusIcon(inspection.overall_status)}
                          <span className="ml-1 capitalize">{inspection.overall_status}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(inspection.inspection_date), 'PPP')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {format(new Date(inspection.start_time), 'HH:mm')}
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="text-xs">
                            {inspection.inspection_type}
                          </Badge>
                        </div>
                      </div>
                      
                      {inspection.defects_found && (
                        <div className="mt-2">
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Defects Found
                          </Badge>
                        </div>
                      )}
                      
                      {inspection.notes && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {inspection.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInspection(inspection.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredInspections.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">
                {filteredInspections.filter(i => i.overall_status === 'passed').length}
              </div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">
                {filteredInspections.filter(i => i.overall_status === 'failed').length}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">
                {filteredInspections.filter(i => i.overall_status === 'flagged').length}
              </div>
              <div className="text-sm text-muted-foreground">Flagged</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {filteredInspections.filter(i => i.defects_found).length}
              </div>
              <div className="text-sm text-muted-foreground">With Defects</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Smart Inspection Form */}
      <SmartInspectionForm 
        open={showSmartInspectionForm}
        onOpenChange={setShowSmartInspectionForm}
        onComplete={() => {
          // Refresh inspections list when a new inspection is submitted
          window.location.reload();
        }}
      />
      </div>
    </ErrorBoundary>
  );
};

export default VehicleInspectionsPage;