
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  X,
  Activity,
  Settings,
  Download
} from 'lucide-react';
import { useIncidents, useCreateIncident, useUpdateIncident } from '@/hooks/useIncidents';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileIncidentReports from '@/components/driver/MobileIncidentReports';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import StandardPageLayout, { 
  MetricCard,
  NavigationTab, 
  ActionButton, 
  FilterOption,
  TableColumn 
} from '@/components/layout/StandardPageLayout';
import { toast } from 'sonner';

const IncidentReports = () => {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL - NO CONDITIONAL HOOKS
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
  
  // PageLayout state
  const [activeTab, setActiveTab] = useState('overview');
  const [viewFilter, setViewFilter] = useState('all');
  
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

  // Calculate incident statistics
  const incidentStats = {
    totalIncidents: incidents.length + parentIncidents.length,
    openIncidents: incidents.filter(i => i.status === 'open').length + parentIncidents.filter(i => i.status === 'open').length,
    resolvedIncidents: incidents.filter(i => i.status === 'resolved').length + parentIncidents.filter(i => i.status === 'resolved').length,
    investigatingIncidents: incidents.filter(i => i.status === 'investigating').length + parentIncidents.filter(i => i.status === 'investigating').length,
    highPriorityIncidents: incidents.filter(i => i.severity === 'high').length + parentIncidents.filter(i => i.severity === 'high').length,
    parentIncidents: parentIncidents.length
  };

  // CONDITIONAL RENDERING AFTER ALL HOOKS ARE CALLED
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading incident reports...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Handle incident resolution
  const handleResolveIncident = async () => {
    if (selectedIncident && resolutionNotes.trim()) {
      try {
        await updateIncidentMutation.mutateAsync({
          id: selectedIncident.id,
          status: newStatus || 'resolved',
          resolution_notes: resolutionNotes
        });
        setIsResolveDialogOpen(false);
        setResolutionNotes('');
        setSelectedIncident(null);
        toast({
          title: "Incident Updated",
          description: "The incident has been successfully updated.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update incident. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-red-100 text-red-800">Open</Badge>;
      case 'investigating':
        return <Badge className="bg-yellow-100 text-yellow-800">Investigating</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  // Mobile view
  if (isMobile) {
    return <MobileIncidentReports />;
  }

  // StandardPageLayout Configuration
  const pageTitle = "Incident Reports";
  const pageDescription = "Manage and track incidents, safety concerns, and compliance issues";

  const primaryAction: ActionButton = {
    label: "Report Incident",
    onClick: () => setShowTypeSelector(true),
    icon: <Plus className="w-4 h-4" />
  };

  const secondaryActions: ActionButton[] = [
    {
      label: "Export Reports",
      onClick: () => console.log("Export clicked"),
      icon: <Download className="w-4 h-4" />,
      variant: "outline"
    },
    {
      label: "Settings",
      onClick: () => console.log("Settings clicked"),
      icon: <Settings className="w-4 h-4" />,
      variant: "outline"
    }
  ];

  // Metrics cards for the dashboard
  const metricsCards: MetricCard[] = [
    {
      title: "Total Incidents",
      value: incidentStats.totalIncidents.toString(),
      subtitle: "All reported incidents",
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: "bg-red-100",
      color: "text-red-600"
    },
    {
      title: "Open Cases",
      value: incidentStats.openIncidents.toString(),
      subtitle: "Requiring attention",
      icon: <Clock className="w-5 h-5" />,
      bgColor: "bg-yellow-100",
      color: "text-yellow-600"
    },
    {
      title: "Resolved",
      value: incidentStats.resolvedIncidents.toString(),
      subtitle: "Successfully closed",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-green-600"
    },
    {
      title: "High Priority",
      value: incidentStats.highPriorityIncidents.toString(),
      subtitle: "Critical incidents",
      icon: <Shield className="w-5 h-5" />,
      bgColor: "bg-red-100",
      color: "text-red-600"
    }
  ];

  const navigationTabs: NavigationTab[] = [
    { value: "overview", label: "Overview" },
    { value: "incidents", label: "All Incidents", badge: incidents.length },
    { value: "parent-reports", label: "Parent Reports", badge: parentIncidents.length },
    { value: "analytics", label: "Analytics" }
  ];

  const searchConfig = {
    placeholder: "Search incidents by title, description, or reporter...",
    value: searchTerm,
    onChange: setSearchTerm,
    showSearch: true
  };

  const filters: FilterOption[] = [
    {
      label: "Status",
      value: statusFilter,
      options: [
        { value: "all", label: "All Status" },
        { value: "open", label: "Open" },
        { value: "investigating", label: "Investigating" },
        { value: "resolved", label: "Resolved" },
        { value: "closed", label: "Closed" }
      ],
      placeholder: "Filter by status"
    },
    {
      label: "Source",
      value: sourceFilter,
      options: [
        { value: "all", label: "All Sources" },
        { value: "driver", label: "Driver Reports" },
        { value: "parent", label: "Parent Reports" },
        { value: "system", label: "System Generated" }
      ],
      placeholder: "Filter by source"
    }
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "Status") setStatusFilter(value);
    if (filterKey === "Source") setSourceFilter(value);
  };

  return (
    <StandardPageLayout
      title={pageTitle}
      description={pageDescription}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      metricsCards={metricsCards}
      showMetricsDashboard={true}
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchConfig={searchConfig}
      filters={filters}
      onFilterChange={handleFilterChange}
    >
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Incident Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-red-900">{incidentStats.totalIncidents}</p>
                      <p className="text-sm text-red-700">Total Incidents</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-yellow-900">{incidentStats.openIncidents}</p>
                      <p className="text-sm text-yellow-700">Open Cases</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-900">{incidentStats.resolvedIncidents}</p>
                      <p className="text-sm text-green-700">Resolved</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-blue-900">{incidentStats.investigatingIncidents}</p>
                      <p className="text-sm text-blue-700">Investigating</p>
                    </div>
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Response Time</p>
                    <p className="text-sm text-gray-500">Average: 2.3 hours</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Good Response Time
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === "incidents" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Incident Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Incident Management</h3>
              <p className="text-gray-600 mb-6">
                View, manage, and resolve incident reports from drivers and system alerts.
              </p>
              <div className="flex gap-4 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Report Incident
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View All Incidents
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parent Reports Tab */}
      {activeTab === "parent-reports" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Parent Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Parent Incident Reports</h3>
              <p className="text-gray-600 mb-6">
                Manage incident reports and concerns submitted by parents and guardians.
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Users className="w-4 h-4 mr-2" />
                View Parent Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Incident Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600 mb-6">
                View detailed analytics and trends for incident management and safety improvements.
              </p>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <IncidentTypeSelectorDialog
        open={showTypeSelector}
        onOpenChange={setShowTypeSelector}
        onSelect={(type) => {
          setSelectedType(type);
          setShowTypeSelector(false);
        }}
      />

      {selectedType && (
        <IncidentForm
          incidentType={selectedType}
          onSubmit={async (data: IncidentFormData) => {
            try {
              await createIncidentMutation.mutateAsync({
                ...data,
                incident_type: selectedType || 'transportation',
                reported_by: profile?.id || user?.id || ''
              });
              setSelectedType(null);
              toast({
                title: "Incident Reported",
                description: "Your incident has been successfully reported.",
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to report incident. Please try again.",
                variant: "destructive",
              });
            }
          }}
          onCancel={() => setSelectedType(null)}
        />
      )}

      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Incident</DialogTitle>
            <DialogDescription>
              Update the incident status and add resolution notes.
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
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Resolution Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter resolution details..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolveIncident}>
              Update Incident
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
};

export default IncidentReports;
