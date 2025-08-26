import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  Lightbulb, 
  Search, 
  Filter, 
  Mail, 
  Clock, 
  User, 
  Settings,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SupportTicket {
  id: string;
  ticket_id: string;
  type: 'support' | 'suggestion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  user_email: string;
  user_name: string;
  user_phone?: string;
  app_version?: string;
  device_info?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminSupportTickets() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  const priorityIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    urgent: '🔴'
  };

  const statusColors = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch support tickets.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Ticket status updated to ${status}.`,
      });

      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status.",
        variant: "destructive"
      });
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      (ticket.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ticket.user_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ticket.user_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ticket.ticket_id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesType = typeFilter === 'all' || ticket.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const getStatusCounts = () => {
    const counts = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    tickets.forEach(ticket => {
      if (ticket.status && counts.hasOwnProperty(ticket.status)) {
        counts[ticket.status as keyof typeof counts]++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (!profile || !['admin', 'council'].includes(profile.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view support tickets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">Manage support requests and feature suggestions</p>
        </div>
        <Button onClick={fetchTickets} disabled={loading}>
          <Settings className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Open</span>
            </div>
            <p className="text-2xl font-bold">{statusCounts.open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold">{statusCounts.in_progress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Resolved</span>
            </div>
            <p className="text-2xl font-bold">{statusCounts.resolved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-sm font-medium">Closed</span>
            </div>
            <p className="text-2xl font-bold">{statusCounts.closed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Tickets ({filteredTickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tickets found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {(ticket.type || 'support') === 'support' ? (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        ) : (
                          <Lightbulb className="w-4 h-4 text-blue-600" />
                        )}
                        <span className="font-medium">{ticket.subject || 'No Subject'}</span>
                        <Badge variant="outline" className="text-xs">
                          {ticket.ticket_id || 'No ID'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{ticket.user_name || 'Unknown User'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{ticket.user_email || 'No Email'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'Unknown Date'}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className={priorityColors[ticket.priority] || 'bg-gray-100 text-gray-800'}>
                          {priorityIcons[ticket.priority] || '⚪'} {ticket.priority || 'unknown'}
                        </Badge>
                        <Badge className={statusColors[ticket.status] || 'bg-gray-100 text-gray-800'}>
                          {(ticket.status || 'unknown').replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {(ticket.type || 'support') === 'support' ? 'IT Support' : 'Feature Suggestion'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Ticket Details - {ticket.ticket_id || 'No ID'}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Type</Label>
                                <p className="text-sm">{(ticket.type || 'support') === 'support' ? 'IT Support' : 'Feature Suggestion'}</p>
                              </div>
                              <div>
                                <Label>Priority</Label>
                                <p className="text-sm">{ticket.priority}</p>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <p className="text-sm">{ticket.status}</p>
                              </div>
                              <div>
                                <Label>Created</Label>
                                <p className="text-sm">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'Unknown Date'}</p>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Subject</Label>
                              <p className="text-sm font-medium">{ticket.subject || 'No Subject'}</p>
                            </div>
                            
                            <div>
                              <Label>Description</Label>
                              <p className="text-sm whitespace-pre-wrap">{ticket.description || 'No description provided'}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>User Name</Label>
                                <p className="text-sm">{ticket.user_name || 'Unknown User'}</p>
                              </div>
                              <div>
                                <Label>User Email</Label>
                                <p className="text-sm">{ticket.user_email || 'No Email'}</p>
                              </div>
                              {ticket.user_phone && (
                                <div>
                                  <Label>Phone</Label>
                                  <p className="text-sm">{ticket.user_phone}</p>
                                </div>
                              )}
                              {ticket.app_version && (
                                <div>
                                  <Label>App Version</Label>
                                  <p className="text-sm">{ticket.app_version}</p>
                                </div>
                              )}
                            </div>
                            
                            {ticket.device_info && (
                              <div>
                                <Label>Device Info</Label>
                                <p className="text-sm text-muted-foreground">{ticket.device_info}</p>
                              </div>
                            )}

                            <div className="flex space-x-2">
                              {ticket.status === 'open' && (
                                <>
                                  <Button 
                                    size="sm"
                                    onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                                  >
                                    Mark In Progress
                                  </Button>
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                                  >
                                    Mark Resolved
                                  </Button>
                                </>
                              )}
                              {ticket.status === 'in_progress' && (
                                <Button 
                                  size="sm"
                                  onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                                >
                                  Mark Resolved
                                </Button>
                              )}
                              {ticket.status === 'resolved' && (
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateTicketStatus(ticket.id, 'closed')}
                                >
                                  Close Ticket
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

