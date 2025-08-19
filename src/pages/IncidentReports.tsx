
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
  Shield
} from 'lucide-react';
import { useIncidents, useCreateIncident } from '@/hooks/useIncidents';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileIncidentReports from '@/components/driver/MobileIncidentReports';
import { format, parseISO } from 'date-fns';

const IncidentReports = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data: incidents = [], isLoading, error } = useIncidents();
  const createIncidentMutation = useCreateIncident();

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

  // SECURITY CHECK: Verify user is a driver
  if (profile.role !== 'driver') {
    return <Navigate to="/dashboard" replace />;
  }

  // Use mobile-optimized component on mobile devices
  if (isMobile) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center">
            <div className="text-lg">Loading incidents...</div>
          </div>
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
            <p className="text-gray-600">Manage and track incident reports</p>
          </div>
          <Button onClick={() => setShowTypeSelector(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Incident Report
          </Button>
        </div>

        {/* Main Content */}
        {incidents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No incidents reported</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first incident report.</p>
              <Button onClick={() => setShowTypeSelector(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Incident Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <Card key={incident.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2 mb-2">
                        <span>{incident.title}</span>
                        <Badge variant="outline">
                          {getIncidentTypeLabel(incident.incident_type as IncidentType)}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {incident.description}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(incident.status) as any} className="flex items-center space-x-1">
                      {getStatusIcon(incident.status)}
                      <span className="capitalize">{incident.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-600">Severity</p>
                      <p className="capitalize">{incident.severity}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Date</p>
                      <p>{incident.incident_date ? new Date(incident.incident_date).toLocaleDateString() : 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">People Involved</p>
                      <p>{incident.people_involved?.length || 0}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Reported By</p>
                      <p>{incident.profiles ? `${incident.profiles.first_name} ${incident.profiles.last_name}` : 'Unknown'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <IncidentTypeSelectorDialog
        open={showTypeSelector}
        onOpenChange={setShowTypeSelector}
        onSelect={handleTypeSelect}
      />
    </div>
  );
};

export default IncidentReports;
