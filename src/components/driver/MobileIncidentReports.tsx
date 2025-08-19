import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Mail
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useIncidents } from '@/hooks/useIncidents';
import MobileOptimizedLayout from '@/components/mobile/MobileOptimizedLayout';

export default function MobileIncidentReports() {
  const { data: incidents = [], isLoading, error } = useIncidents();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Incident Reports</h1>
            <p className="text-sm text-muted-foreground">
              Track and manage your incident reports
            </p>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
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

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{incidents.length}</div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {incidents.filter(i => i.status === 'open' || i.status === 'investigating').length}
                </div>
                <p className="text-sm text-muted-foreground">Active Cases</p>
              </div>
            </CardContent>
          </Card>
        </div>

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
          <div className="space-y-3">
            {filteredIncidents.map((incident) => (
              <Card key={incident.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{incident.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant={getStatusColor(incident.status)} className="flex items-center space-x-1">
                          {getStatusIcon(incident.status)}
                          <span className="capitalize">{incident.status.replace('_', ' ')}</span>
                        </Badge>
                        <Badge variant={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Description */}
                  <div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {incident.description}
                    </p>
                  </div>

                  {/* Incident Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {incident.incident_date ? format(parseISO(incident.incident_date), 'MMM dd, yyyy') : 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {incident.location_address || 'Location not specified'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Car className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {incident.vehicles?.vehicle_number || 'Vehicle not specified'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {incident.people_involved?.length || 0} people involved
                      </span>
                    </div>
                  </div>

                  {/* Reported By */}
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-500">Reported by:</span>
                    <span className="font-medium">
                      {incident.profiles ? `${incident.profiles.first_name} ${incident.profiles.last_name}` : 'Unknown'}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <Card>
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
      </div>
    </MobileOptimizedLayout>
  );
}
