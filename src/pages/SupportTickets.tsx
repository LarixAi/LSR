import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Ticket, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  MessageSquare,
  Eye,
  UserCheck,
  Send,
  RefreshCw,
  Plus,
  Settings,
  Download,
  Activity
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import StandardPageLayout, { 
  MetricCard,
  NavigationTab, 
  ActionButton, 
  FilterOption,
  TableColumn 
} from '@/components/layout/StandardPageLayout';
import { toast } from 'sonner';

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  created_by: string;
  assigned_to?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
  } | null;
}

const SupportTicketManagement = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // StandardPageLayout Configuration
  const pageTitle = "Support Tickets";
  const pageDescription = "Manage and track support tickets for your organization";

  const primaryAction: ActionButton = {
    label: "Create Ticket",
    onClick: () => console.log("Create ticket clicked"),
    icon: <Plus className="w-4 h-4" />
  };

  const secondaryActions: ActionButton[] = [
    {
      label: "Export Tickets",
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

  // Fetch all support tickets for the organization
  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-support-tickets', profile?.organization_id, statusFilter, priorityFilter],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      // Mock support tickets (table doesn't exist yet)
      return [] as any[];
    },
    enabled: !!profile?.organization_id && (profile?.role === 'admin' || profile?.role === 'council')
  });

  // Update ticket status/assignment mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, updates }: { ticketId: string; updates: any }) => {
      // Mock update (table doesn't exist yet)
      console.log('Ticket would be updated:', { ticketId, updates });
      return {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      toast({
        title: "Ticket Updated",
        description: "Support ticket has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update support ticket.",
        variant: "destructive",
      });
    }
  });

  // Metrics cards for the dashboard
  const metricsCards: MetricCard[] = [
    {
      title: "Total Tickets",
      value: tickets.length.toString(),
      subtitle: "All support tickets",
      icon: <Ticket className="w-5 h-5" />,
      bgColor: "bg-blue-100",
      color: "text-blue-600"
    },
    {
      title: "Open",
      value: tickets.filter(t => t.status === 'open').length.toString(),
      subtitle: "Requiring attention",
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: "bg-red-100",
      color: "text-red-600"
    },
    {
      title: "In Progress",
      value: tickets.filter(t => t.status === 'in_progress').length.toString(),
      subtitle: "Being worked on",
      icon: <Clock className="w-5 h-5" />,
      bgColor: "bg-yellow-100",
      color: "text-yellow-600"
    },
    {
      title: "Resolved",
      value: tickets.filter(t => t.status === 'resolved').length.toString(),
      subtitle: "Successfully closed",
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: "bg-green-100",
      color: "text-green-600"
    }
  ];

  const navigationTabs: NavigationTab[] = [
    { value: "overview", label: "Overview" },
    { value: "tickets", label: "All Tickets", badge: tickets.length },
    { value: "create", label: "Create Ticket" },
    { value: "analytics", label: "Analytics" }
  ];

  const searchConfig = {
    placeholder: "Search tickets by subject, description, or ticket number...",
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
        { value: "in_progress", label: "In Progress" },
        { value: "resolved", label: "Resolved" },
        { value: "closed", label: "Closed" }
      ],
      placeholder: "Filter by status"
    },
    {
      label: "Priority",
      value: priorityFilter,
      options: [
        { value: "all", label: "All Priorities" },
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "urgent", label: "Urgent" }
      ],
      placeholder: "Filter by priority"
    }
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "Status") setStatusFilter(value);
    if (filterKey === "Priority") setPriorityFilter(value);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'open': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-orange-100 text-orange-800',
      'resolved': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const priorityColors: Record<string, string> = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return priorityColors[priority] || 'bg-gray-100 text-gray-800';
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    await updateTicketMutation.mutateAsync({
      ticketId,
      updates: { status: newStatus }
    });
  };

  const handleAssignToSelf = async (ticketId: string) => {
    await updateTicketMutation.mutateAsync({
      ticketId,
      updates: { assigned_to: user?.id, status: 'in_progress' }
    });
  };

  if (!profile || !['admin', 'council'].includes(profile.role)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You must be an admin or council member to access support ticket management.</p>
        </div>
      </div>
    );
  }

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
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Support Overview</CardTitle>
              <CardDescription>Quick overview of your support ticket system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Ticket className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">Total Tickets</h3>
                      <p className="text-sm text-gray-600">{tickets.length} support tickets</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                    <div>
                      <h3 className="font-semibold">Open Tickets</h3>
                      <p className="text-sm text-gray-600">{tickets.filter(t => t.status === 'open').length} requiring attention</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold">Resolved</h3>
                      <p className="text-sm text-gray-600">{tickets.filter(t => t.status === 'resolved').length} successfully closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common support ticket tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => console.log("Create ticket clicked")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Ticket
                </Button>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Tickets
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status Filter</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority Filter</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    Total: {tickets.length} tickets
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p>Loading support tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No support tickets found</p>
                </CardContent>
              </Card>
            ) : (
              tickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {ticket.ticket_number}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)} variant="secondary">
                            {ticket.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)} variant="secondary">
                            {ticket.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <h3 className="font-medium mb-1">{ticket.subject}</h3>
                        <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Category: {ticket.category}</span>
                          <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                          {ticket.assigned_to && (
                            <span>Assigned to: {ticket.assigned_to}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {ticket.status === 'open' && (
                          <Button 
                            size="sm"
                            onClick={() => handleAssignToSelf(ticket.id)}
                            disabled={ticket.assigned_to === user?.id}
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            {ticket.assigned_to === user?.id ? 'Assigned' : 'Take'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ticket #{selectedTicket?.ticket_number}</DialogTitle>
            <DialogDescription>
              {selectedTicket?.subject}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              {/* Ticket Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={selectedTicket.status} 
                    onValueChange={(value) => handleStatusUpdate(selectedTicket.id, value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Assignment</label>
                  <Button 
                    className="w-full mt-1" 
                    variant="outline"
                    onClick={() => handleAssignToSelf(selectedTicket.id)}
                    disabled={selectedTicket.assigned_to === user?.id}
                  >
                    <UserCheck className="w-4 h-4 mr-1" />
                    {selectedTicket.assigned_to === user?.id ? 'Assigned to You' : 'Assign to Me'}
                  </Button>
                </div>
              </div>

              {/* Original Description */}
              <div>
                <h4 className="font-medium mb-2">Original Request</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h4 className="font-medium mb-2">Ticket Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Created:</span> {new Date(selectedTicket.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span> {selectedTicket.category}
                  </div>
                  <div>
                    <span className="font-medium">Priority:</span> 
                    <Badge className={getPriorityColor(selectedTicket.priority)} variant="secondary">
                      {selectedTicket.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Submitted by:</span> {selectedTicket.profiles ? 
                      `${selectedTicket.profiles.first_name} ${selectedTicket.profiles.last_name}` : 
                      'Unknown User'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
};

export default SupportTicketManagement;