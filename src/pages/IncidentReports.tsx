
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import IncidentTypeSelectorDialog from '@/components/incidents/IncidentTypeSelectorDialog';
import IncidentForm from '@/components/incidents/IncidentForm';
import { IncidentType, IncidentFormData } from '@/types/incident';
import { getIncidentTypeLabel } from '@/utils/incidentUtils';
import { 
  Plus, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  Search,
  Filter,
  MapPin,
  Car,
  Users,
  Eye,
  Calendar,
  RefreshCw,
  TrendingUp,
  Shield,
  MessageSquare,
  User,
  Phone,
  Mail,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useIncidents, useCreateIncident, useUpdateIncident } from '@/hooks/useIncidents';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileIncidentReports from '@/components/driver/MobileIncidentReports';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const IncidentReports = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  
  const { data: incidents = [], isLoading, error, refetch } = useIncidents();
  const createIncidentMutation = useCreateIncident();
  const updateIncidentMutation = useUpdateIncident();

  // Mock data for parent incidents (in a real app, this would come from the database)
  const parentIncidents = [
    {
      id: 'parent-1',
      source: 'parent',
      title: 'Child pickup delay',
      description: 'My child was not picked up at the scheduled time',
      severity: 'medium',
      status: 'open',
      reported_by: 'parent-1',
      reported_by_name: 'Sarah Johnson',
      child_name: 'Emma Johnson',
      incident_date: new Date().toISOString(),
      contact_info: {
        phone: '+1234567890',
        email: 'sarah.johnson@email.com'
      },
      created_at: new Date().toISOString()
    },
    {
      id: 'parent-2',
      source: 'parent',
      title: 'Safety concern on route',
      description: 'Concerned about the route safety near the construction zone',
      severity: 'high',
      status: 'investigating',
      reported_by: 'parent-2',
      reported_by_name: 'Michael Chen',
      child_name: 'Alex Chen',
      incident_date: new Date().toISOString(),
      contact_info: {
        phone: '+1234567891',
        email: 'michael.chen@email.com'
      },
      created_at: new Date().toISOString()
    }
  ];

  // Combine driver and parent incidents
  const allIncidents = [
    ...incidents.map(incident => ({ ...incident, source: 'driver' })),
    ...parentIncidents
  ];

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading incident reports...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // SECURITY CHECK: Verify user has access to incidents
  if (!['driver', 'admin', 'council', 'mechanic'].includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Use mobile-optimized component on mobile devices for drivers
  if (isMobile && profile.role === 'driver') {
    return <MobileIncidentReports />;
  }

  const handleTypeSelect = (type: IncidentType) => {
    setSelectedType(type);
  };

  const handleFormSubmit = async (data: IncidentFormData) => {
    try {
      await createIncidentMutation.mutateAsync({
        ...data,
        incident_type: selectedType!,
        reported_by: user.id,
      });
      setSelectedType(null);
    } catch (error) {
      console.error('Error creating incident:', error);
    }
  };

  const handleFormCancel = () => {
    setSelectedType(null);
  };

  const handleResolveIncident = async () => {
    if (!selectedIncident || !newStatus) return;

    try {
      if (selectedIncident.source === 'driver') {
        // Update driver incident
        await updateIncidentMutation.mutateAsync({
          id: selectedIncident.id,
          status: newStatus,
        });
      } else {
        // For parent incidents, you would update the parent_communications table
        // This is a mock implementation
        toast({
          title: "Parent incident updated",
          description: "Parent incident status has been updated.",
        });
      }

      setIsResolveDialogOpen(false);
      setSelectedIncident(null);
      setResolutionNotes('');
      setNewStatus('');
      refetch();
    } catch (error) {
      console.error('Error resolving incident:', error);
      toast({
        title: "Error",
        description: "Failed to resolve incident. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-4 h-4" />;
      case 'investigating':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'investigating':
        return 'default';
      case 'resolved':
        return 'default';
      case 'closed':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'driver':
        return <Car className="w-4 h-4" />;
      case 'parent':
        return <User className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'driver':
        return 'blue';
      case 'parent':
        return 'green';
      default:
        return 'gray';
    }
  };

  // Filter incidents based on search, status, and source
  const filteredIncidents = allIncidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || incident.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  if (selectedType) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <IncidentForm
            incidentType={selectedType}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading incidents: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Incident Reports</h1>
            <p className="text-gray-600">
              {profile.role === 'admin' || profile.role === 'council' 
                ? 'Manage and resolve all incident reports from drivers and parents'
                : 'Manage and track incident reports'
              }
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowTypeSelector(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Incident Report
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search" className="text-sm font-medium">Search</Label>
            <Input
              id="search"
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(profile.role === 'admin' || profile.role === 'council') && (
            <div>
              <Label htmlFor="source-filter" className="text-sm font-medium">Source</Label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="driver">Driver Reports</SelectItem>
                  <SelectItem value="parent">Parent Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-end">
            <Badge variant="outline" className="text-sm">
              {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        {filteredIncidents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No incidents found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by creating your first incident report.'
                }
              </p>
              <Button onClick={() => setShowTypeSelector(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Incident Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredIncidents.map((incident) => (
              <Card key={incident.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg">{incident.title}</CardTitle>
                        <Badge variant="outline" className={`text-${getSourceColor(incident.source)}-600 border-${getSourceColor(incident.source)}-200`}>
                          {getSourceIcon(incident.source)}
                          <span className="ml-1 capitalize">{incident.source}</span>
                        </Badge>
                                                 {'incident_type' in incident && incident.incident_type && (
                           <Badge variant="outline">
                             {getIncidentTypeLabel(incident.incident_type as IncidentType)}
                           </Badge>
                         )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {incident.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(incident.created_at), 'MMM dd, yyyy')}
                        </span>
                                                 {incident.source === 'parent' && 'child_name' in incident && incident.child_name && (
                           <span className="flex items-center">
                             <User className="w-3 h-3 mr-1" />
                             {incident.child_name}
                           </span>
                         )}
                         {incident.source === 'driver' && 'vehicles' in incident && incident.vehicles && (
                           <span className="flex items-center">
                             <Car className="w-3 h-3 mr-1" />
                             {incident.vehicles.vehicle_number}
                           </span>
                         )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(incident.status) as any} className="flex items-center space-x-1">
                        {getStatusIcon(incident.status)}
                        <span className="capitalize">{incident.status.replace('_', ' ')}</span>
                      </Badge>
                      {(profile.role === 'admin' || profile.role === 'council') && incident.status !== 'resolved' && incident.status !== 'closed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedIncident(incident);
                            setNewStatus(incident.status);
                            setIsResolveDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-600">Severity</p>
                      <Badge variant={incident.severity === 'high' || incident.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {incident.severity}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Reported By</p>
                      <p>{incident.source === 'driver' 
                        ? (incident.profiles ? `${incident.profiles.first_name} ${incident.profiles.last_name}` : 'Unknown')
                        : incident.reported_by_name
                      }</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Contact</p>
                      {incident.source === 'parent' && incident.contact_info ? (
                        <div className="space-y-1">
                          <p className="flex items-center text-xs">
                            <Phone className="w-3 h-3 mr-1" />
                            {incident.contact_info.phone}
                          </p>
                          <p className="flex items-center text-xs">
                            <Mail className="w-3 h-3 mr-1" />
                            {incident.contact_info.email}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">N/A</p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Location</p>
                      <p className="text-xs">
                        {incident.location_address || incident.location || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Incident Type Selector Dialog */}
      <IncidentTypeSelectorDialog
        open={showTypeSelector}
        onOpenChange={setShowTypeSelector}
        onSelect={handleTypeSelect}
      />

      {/* Resolve Incident Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Incident</DialogTitle>
            <DialogDescription>
              Update the status and add resolution notes for this incident.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="resolution-notes">Resolution Notes</Label>
              <Textarea
                id="resolution-notes"
                placeholder="Add notes about how this incident was resolved..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleResolveIncident} className="flex-1" disabled={!newStatus}>
                <Save className="w-4 h-4 mr-2" />
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncidentReports;
