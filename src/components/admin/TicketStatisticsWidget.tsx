import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Ticket, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface TicketStatisticsWidgetProps {
  className?: string;
}

const TicketStatisticsWidget: React.FC<TicketStatisticsWidgetProps> = ({ className = '' }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  // Fetch all tickets for the organization
  const { supportTickets: tickets = [], isLoading } = useSupportTickets(
    profile?.organization_id
  );

  // Calculate statistics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const urgentTickets = tickets.filter(t => t.priority === 'urgent').length;
  const highPriorityTickets = tickets.filter(t => t.priority === 'high').length;

  // Calculate percentage changes (mock data for now)
  const openTicketsChange = 0; // Would calculate from previous period
  const resolvedTicketsChange = 0; // Would calculate from previous period

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Support Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Ticket className="w-5 h-5 text-blue-600" />
          Support Tickets
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/admin/support-tickets')}
          className="text-blue-600 hover:text-blue-700"
        >
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalTickets}</div>
            <div className="text-sm text-gray-600">Total Tickets</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{openTickets}</div>
            <div className="text-sm text-gray-600">Open Tickets</div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Status Breakdown</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Open</span>
              </div>
              <Badge variant="outline" className={getStatusColor('open')}>
                {openTickets}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">In Progress</span>
              </div>
              <Badge variant="outline" className={getStatusColor('in_progress')}>
                {inProgressTickets}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Resolved</span>
              </div>
              <Badge variant="outline" className={getStatusColor('resolved')}>
                {resolvedTickets}
              </Badge>
            </div>
          </div>
        </div>

        {/* Priority Alerts */}
        {(urgentTickets > 0 || highPriorityTickets > 0) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Priority Alerts</h4>
            <div className="space-y-1">
              {urgentTickets > 0 && (
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium">Urgent Tickets</span>
                  </div>
                  <Badge className={getPriorityColor('urgent')}>
                    {urgentTickets}
                  </Badge>
                </div>
              )}
              {highPriorityTickets > 0 && (
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">High Priority</span>
                  </div>
                  <Badge className={getPriorityColor('high')}>
                    {highPriorityTickets}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => navigate('/admin/support-tickets')}
          >
            <Ticket className="w-4 h-4 mr-2" />
            Manage Tickets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketStatisticsWidget;


