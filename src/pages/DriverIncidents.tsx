import React, { useState } from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Plus, 
  FileText, 
  Clock,
  MapPin,
  Camera,
  Upload,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { useIncidents, useCreateIncident } from '@/hooks/useIncidents';
import { useOrganizationContext } from '@/hooks/useOrganizationContext';
import { format, parseISO } from 'date-fns';

const DriverIncidents = () => {
  const { user, profile, loading } = useAuth();
  const { organizationId } = useOrganizationContext();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('my-incidents');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Use real data from database
  const { data: incidents = [], isLoading, error } = useIncidents();
  const createIncidentMutation = useCreateIncident();

  // Filter incidents based on search and filters
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location_address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
      case 'investigating':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Under Investigation</Badge>;
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Open</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>;
      case 'critical':
        return <Badge className="bg-red-200 text-red-900 hover:bg-red-200">Critical</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const stats = {
    totalIncidents: incidents.length,
    resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
    pendingIncidents: incidents.filter(i => i.status === 'open' || i.status === 'investigating').length,
    thisMonthIncidents: incidents.filter(i => {
      const incidentDate = new Date(i.incident_date || i.created_at);
      return incidentDate.getMonth() === new Date().getMonth() && 
             incidentDate.getFullYear() === new Date().getFullYear();
    }).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading incidents...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only drivers can access
  if (profile.role !== 'driver') {
    return <Navigate to="/dashboard" replace />;
  }

  const navigationTabs = [
    { value: 'my-incidents', label: 'My Incidents' },
    { value: 'emergency-contacts', label: 'Emergency Contacts' },
    { value: 'safety-guidelines', label: 'Safety Guidelines' }
  ];

  return (
    <StandardPageLayout
      title="Incident Reports"
      description="Report and track safety incidents"
      showMetricsDashboard={false}
      primaryAction={{ label: 'Report Incident', onClick: () => setShowForm(true) }}
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="report-incident-desc">
          <DialogHeader>
            <DialogTitle>Report New Incident</DialogTitle>
            <DialogDescription id="report-incident-desc">
              Report a new incident or issue that occurred during your shift.
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incident-type">Incident Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakdown">Vehicle Breakdown</SelectItem>
                      <SelectItem value="accident">Traffic Accident</SelectItem>
                      <SelectItem value="passenger">Passenger Incident</SelectItem>
                      <SelectItem value="medical">Medical Emergency</SelectItem>
                      <SelectItem value="security">Security Issue</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="severity">Severity Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Minor issue</SelectItem>
                      <SelectItem value="medium">Medium - Significant issue</SelectItem>
                      <SelectItem value="high">High - Serious issue</SelectItem>
                      <SelectItem value="critical">Critical - Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" defaultValue={new Date().toTimeString().split(' ')[0].substring(0, 5)} />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Where did the incident occur?" />
              </div>

              <div>
                <Label htmlFor="vehicle">Vehicle Number</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LSR-001">LSR-001</SelectItem>
                    <SelectItem value="LSR-002">LSR-002</SelectItem>
                    <SelectItem value="LSR-003">LSR-003</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="passenger-count">Number of Passengers on Board</Label>
                <Input id="passenger-count" type="number" placeholder="0" />
              </div>

              <div>
                <Label htmlFor="description">Incident Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Provide a detailed description of what happened..." 
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="injury" className="rounded" />
                  <Label htmlFor="injury">Injury Reported</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="damage" className="rounded" />
                  <Label htmlFor="damage">Property Damage</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="police" className="rounded" />
                  <Label htmlFor="police">Police Involved</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="emergency" className="rounded" />
                  <Label htmlFor="emergency">Emergency Services Called</Label>
                </div>
              </div>

              <div>
                <Label>Attach Photos/Documents</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload photos or documents</p>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>

              <Button className="w-full bg-red-600 hover:bg-red-700">
                Submit Incident Report
              </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold">{stats.totalIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolvedIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">{stats.thisMonthIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {activeTab === 'my-incidents' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                My Incident Reports
              </CardTitle>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search incidents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="investigating">Under Investigation</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredIncidents.map((incident) => (
                  <div key={incident.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{incident.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {incident.incident_date ? format(parseISO(incident.incident_date), 'MM/dd/yyyy HH:mm') : format(parseISO(incident.created_at), 'MM/dd/yyyy HH:mm')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {incident.location_address}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {getSeverityBadge(incident.severity)}
                        {getStatusBadge(incident.status)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{incident.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm text-gray-500">
                                                 <span>Vehicle: {incident.vehicles?.vehicle_number || 'Not specified'}</span>
                         <span>Passengers: {incident.people_involved?.length || 0}</span>
                         {incident.additional_data?.injury_reported && (
                           <span className="text-red-600 font-medium">Injury Reported</span>
                         )}
                         {incident.additional_data?.damage_reported && (
                           <span className="text-orange-600 font-medium">Damage Reported</span>
                         )}
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl" aria-describedby="incident-details-desc">
                          <DialogHeader>
                            <DialogTitle>Incident Details - {incident.title}</DialogTitle>
                            <DialogDescription id="incident-details-desc">
                              View detailed information about this incident report.
                            </DialogDescription>
                          </DialogHeader>
                          {incident && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Basic Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Date & Time:</span>
                                      <span>{incident.incident_date ? format(parseISO(incident.incident_date), 'MM/dd/yyyy HH:mm') : format(parseISO(incident.created_at), 'MM/dd/yyyy HH:mm')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Location:</span>
                                      <span>{incident.location_address}</span>
                                    </div>
                                                                          <div className="flex justify-between">
                                        <span className="text-gray-600">Vehicle:</span>
                                        <span>{incident.vehicles?.vehicle_number || 'Not specified'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Passengers:</span>
                                        <span>{incident.people_involved?.length || 0}</span>
                                      </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Status & Severity</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Severity:</span>
                                      <span>{getSeverityBadge(incident.severity)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Status:</span>
                                      <span>{getStatusBadge(incident.status)}</span>
                                    </div>
                                                                          <div className="flex justify-between">
                                        <span className="text-gray-600">Injury:</span>
                                        <span>{incident.additional_data?.injury_reported ? 'Yes' : 'No'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Damage:</span>
                                        <span>{incident.additional_data?.damage_reported ? 'Yes' : 'No'}</span>
                                      </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                  {incident.description}
                                </p>
                              </div>

                                                             {incident.additional_data?.resolution && (
                                 <div>
                                   <h4 className="font-medium mb-2">Resolution</h4>
                                   <p className="text-sm text-gray-600 bg-green-50 p-3 rounded">
                                     {incident.additional_data.resolution}
                                   </p>
                                 </div>
                               )}

                               {(incident.additional_data?.police_reference || incident.additional_data?.insurance_claim) && (
                                 <div>
                                   <h4 className="font-medium mb-2">References</h4>
                                   <div className="text-sm space-y-1">
                                     {incident.additional_data.police_reference && (
                                       <div>Police Ref: {incident.additional_data.police_reference}</div>
                                     )}
                                     {incident.additional_data.insurance_claim && (
                                       <div>Insurance Claim: {incident.additional_data.insurance_claim}</div>
                                     )}
                                   </div>
                                 </div>
                               )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'emergency-contacts' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Emergency Services</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">Emergency (Police/Fire/Ambulance)</span>
                      <span className="font-bold text-red-600">999</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">NHS 111</span>
                      <span className="font-bold text-blue-600">111</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">LSR Logistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Control Room (24/7)</span>
                      <span className="font-bold text-green-600">+44 20 1234 5678</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Fleet Manager</span>
                      <span className="font-bold">+44 20 1234 5679</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Safety Officer</span>
                      <span className="font-bold">+44 20 1234 5680</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'safety-guidelines' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Safety Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Safety Documentation</h3>
                <p className="text-gray-600 mb-6">
                  Access safety procedures, emergency protocols, and incident reporting guidelines.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Download Safety Manual
                  </Button>
                  <Button variant="outline">
                    Emergency Procedures
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </StandardPageLayout>
  );
};

export default DriverIncidents;
