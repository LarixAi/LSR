import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  Plus,
  Search,
  Filter,
  MapPin,
  Car,
  Users,
  Eye,
  Calendar,
  Phone,
  Mail,
  Shield,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useIncidents } from '@/hooks/useIncidents';
import MobileOptimizedLayout from '@/components/mobile/MobileOptimizedLayout';

export default function MobileIncidentReports() {
  const { data: incidents = [], isLoading, error } = useIncidents();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('incidents');

  // Filter incidents based on search and status
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location_address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-3 h-3" />;
      case 'investigating':
        return <Clock className="w-3 h-3" />;
      case 'resolved':
        return <CheckCircle className="w-3 h-3" />;
      case 'closed':
        return <XCircle className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Calculate stats
  const stats = {
    totalIncidents: incidents.length,
    pendingIncidents: incidents.filter(i => i.status === 'open' || i.status === 'investigating').length,
    resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
    thisMonthIncidents: incidents.filter(i => {
      const incidentDate = new Date(i.incident_date || i.created_at);
      return incidentDate.getMonth() === new Date().getMonth() && 
             incidentDate.getFullYear() === new Date().getFullYear();
    }).length
  };

  if (isLoading) {
    return (
      <MobileOptimizedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-lg">Loading incident reports...</p>
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  if (error) {
    return (
      <MobileOptimizedLayout>
        <div className="space-y-4 p-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Reports</h3>
                <p className="text-red-700">{error.message}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileOptimizedLayout>
    );
  }

  return (
    <MobileOptimizedLayout>
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">My Incident Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage your incident reports
            </p>
          </div>
          <Button size="sm" className="ml-4 flex-shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalIncidents}</div>
                <p className="text-sm text-muted-foreground">Total Incidents</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.pendingIncidents}</div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.resolvedIncidents}</div>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.thisMonthIncidents}</div>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="incidents" className="text-xs">
              My Incidents
            </TabsTrigger>
            <TabsTrigger value="emergency" className="text-xs">
              Emergency Contact
            </TabsTrigger>
            <TabsTrigger value="guidelines" className="text-xs">
              Safety Guidelines
            </TabsTrigger>
          </TabsList>

          {/* My Incidents Tab */}
          <TabsContent value="incidents" className="space-y-4">
            {/* Search and Filter */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search incidents"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Incident Reports */}
            {filteredIncidents.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No incidents match your search criteria'
                        : 'You haven\'t reported any incidents yet'
                      }
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Report First Incident
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredIncidents.map((incident) => (
                  <Card key={incident.id} className="overflow-hidden">
                    <CardContent className="p-4 space-y-4">
                      {/* BLOCK 1: Title and Badges Row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 pr-6 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 leading-tight break-words">
                            {incident.title}
                          </h3>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0 ml-2">
                          <Badge 
                            variant={getSeverityColor(incident.severity)} 
                            className="h-6 px-2 text-xs whitespace-nowrap"
                          >
                            {incident.severity}
                          </Badge>
                          <Badge 
                            variant={getStatusColor(incident.status)} 
                            className="h-6 px-2 text-xs whitespace-nowrap"
                          >
                            {incident.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      {/* BLOCK 2: Date and Location Row */}
                      <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {incident.incident_date ? format(parseISO(incident.incident_date), 'yyyy-MM-dd') : 'Not specified'} at {incident.incident_time || '00:00'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="max-w-[120px] truncate">
                            {incident.location_address || 'Location not specified'}
                          </span>
                        </div>
                      </div>

                      {/* BLOCK 3: Description */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 leading-relaxed break-words max-h-[80px] overflow-hidden">
                          {incident.description}
                        </p>
                      </div>

                      {/* BLOCK 4: Bottom Info Row */}
                      <div className="space-y-3">
                        {/* Info Items Row */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Vehicle:</span>
                            <span className="truncate max-w-[80px]">{incident.vehicles?.vehicle_number || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Passengers:</span>
                            <span>{incident.people_involved?.length || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Damage:</span>
                            <span>Reported</span>
                            <Eye className="w-3 h-3 text-gray-400" />
                          </div>
                        </div>
                        
                        {/* Action Button Row */}
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-2 px-4 py-2 h-8 min-w-[120px]"
                          >
                            <Eye className="w-3 h-3" />
                            <span className="text-xs">View Details</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full h-12">
                    <Plus className="w-4 h-4 mr-2" />
                    Report New Incident
                  </Button>
                  <Button variant="outline" className="w-full h-12">
                    <FileText className="w-4 h-4 mr-2" />
                    View All Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Contact Tab */}
          <TabsContent value="emergency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Emergency Services</h4>
                      <p className="text-sm text-gray-600">Police, Fire, Ambulance</p>
                    </div>
                    <Button size="sm" variant="destructive">
                      <Phone className="w-4 h-4 mr-2" />
                      999
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Control Room</h4>
                      <p className="text-sm text-gray-600">24/7 Support</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Manager</h4>
                      <p className="text-sm text-gray-600">Direct Line</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Safety Guidelines Tab */}
          <TabsContent value="guidelines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Safety Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <h4 className="font-medium text-yellow-800 mb-2">Pre-Trip Safety</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Complete vehicle inspection before departure</li>
                      <li>• Check all safety equipment</li>
                      <li>• Verify passenger count and seating</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-medium text-blue-800 mb-2">During Journey</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Maintain safe driving speed</li>
                      <li>• Regular breaks every 4.5 hours</li>
                      <li>• Monitor passenger safety</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <h4 className="font-medium text-green-800 mb-2">Emergency Procedures</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Stop safely if incident occurs</li>
                      <li>• Contact emergency services if needed</li>
                      <li>• Report incident within 24 hours</li>
                    </ul>
                  </div>
                </div>
                
                <Button className="w-full mt-4">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Full Safety Manual
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileOptimizedLayout>
  );
}
