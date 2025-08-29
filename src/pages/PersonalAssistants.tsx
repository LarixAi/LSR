import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Shield, 
  Plus,
  Users,
  MessageSquare,
  Calendar,
  Settings,
  Eye,
  Edit,
  Trash2,
  Bot,
  Headphones,
  FileText,
  BarChart3,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

interface ComplianceAlert {
  id: string;
  type: 'license_renewal' | 'inspection_due' | 'document_expiry' | 'training_required';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  due_date: string;
  affected_entity: string;
  action_required: string;
  status: 'active' | 'resolved' | 'overdue';
}

interface Assistant {
  id: string;
  name: string;
  type: 'compliance' | 'scheduling' | 'customer_service' | 'analytics' | 'maintenance';
  status: 'active' | 'inactive' | 'maintenance';
  description: string;
  capabilities: string[];
  lastActive: string;
  responseTime: number;
  accuracy: number;
  totalInteractions: number;
  avatar: string;
}

export default function PersonalAssistants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('assistants');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);

  // Mock data for compliance alerts
  const alerts: ComplianceAlert[] = [
    {
      id: '1',
      type: 'inspection_due',
      title: 'Vehicle Inspection Due',
      description: 'Annual MOT inspection due for vehicle BUS123',
      urgency: 'medium',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      affected_entity: 'BUS123',
      action_required: 'Schedule inspection',
      status: 'active'
    },
    {
      id: '2',
      type: 'license_renewal',
      title: 'Driver License Expiry',
      description: 'Commercial driver license expires soon',
      urgency: 'high',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      affected_entity: 'John Smith',
      action_required: 'Renew license',
      status: 'active'
    },
    {
      id: '3',
      type: 'document_expiry',
      title: 'Insurance Certificate Expiry',
      description: 'Vehicle insurance certificate expires in 30 days',
      urgency: 'low',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      affected_entity: 'Fleet Insurance',
      action_required: 'Renew insurance',
      status: 'active'
    }
  ];

  // Mock data for AI assistants
  const assistants: Assistant[] = [
    {
      id: '1',
      name: 'Compliance Guardian',
      type: 'compliance',
      status: 'active',
      description: 'AI-powered compliance monitoring and alert system',
      capabilities: ['License monitoring', 'Document expiry tracking', 'Regulation updates', 'Automated alerts'],
      lastActive: new Date().toISOString(),
      responseTime: 0.5,
      accuracy: 98.5,
      totalInteractions: 1247,
      avatar: '🛡️'
    },
    {
      id: '2',
      name: 'Schedule Optimizer',
      type: 'scheduling',
      status: 'active',
      description: 'Intelligent route and schedule optimization assistant',
      capabilities: ['Route planning', 'Driver assignment', 'Time optimization', 'Traffic analysis'],
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      responseTime: 1.2,
      accuracy: 94.2,
      totalInteractions: 892,
      avatar: '📅'
    },
    {
      id: '3',
      name: 'Customer Care Bot',
      type: 'customer_service',
      status: 'active',
      description: '24/7 customer support and inquiry handling',
      capabilities: ['Ticket management', 'FAQ responses', 'Escalation handling', 'Multi-language support'],
      lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      responseTime: 0.3,
      accuracy: 96.8,
      totalInteractions: 2156,
      avatar: '💬'
    },
    {
      id: '4',
      name: 'Analytics Pro',
      type: 'analytics',
      status: 'maintenance',
      description: 'Advanced analytics and reporting assistant',
      capabilities: ['Performance metrics', 'Predictive analytics', 'Custom reports', 'Data visualization'],
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      responseTime: 2.1,
      accuracy: 99.1,
      totalInteractions: 567,
      avatar: '📊'
    },
    {
      id: '5',
      name: 'Maintenance Monitor',
      type: 'maintenance',
      status: 'active',
      description: 'Predictive maintenance and service scheduling',
      capabilities: ['Service reminders', 'Parts tracking', 'Cost analysis', 'Warranty monitoring'],
      lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      responseTime: 0.8,
      accuracy: 97.3,
      totalInteractions: 743,
      avatar: '🔧'
    }
  ];

  // Calculate statistics
  const totalAssistants = assistants.length;
  const activeAssistants = assistants.filter(assistant => assistant.status === 'active').length;
  const totalInteractions = assistants.reduce((sum, assistant) => sum + assistant.totalInteractions, 0);
  const avgResponseTime = assistants.reduce((sum, assistant) => sum + assistant.responseTime, 0) / assistants.length;

  // Filter assistants based on search and filters
  const filteredAssistants = assistants.filter(assistant => {
    const matchesSearch = searchTerm === '' || 
      assistant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assistant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assistant.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || assistant.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || assistant.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'compliance':
        return <Badge className="bg-blue-100 text-blue-800">Compliance</Badge>;
      case 'scheduling':
        return <Badge className="bg-green-100 text-green-800">Scheduling</Badge>;
      case 'customer_service':
        return <Badge className="bg-purple-100 text-purple-800">Customer Service</Badge>;
      case 'analytics':
        return <Badge className="bg-orange-100 text-orange-800">Analytics</Badge>;
      case 'maintenance':
        return <Badge className="bg-red-100 text-red-800">Maintenance</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const handleResolveAlert = (alertId: string) => {
    console.log('Resolving alert:', alertId);
    // Mock action - in real implementation would update database
  };

  return (
    <PageLayout
      title="Personal Assistants"
      description="AI-powered assistants for compliance, scheduling, customer service, and analytics"
      actionButton={{
        label: "Add Assistant",
        onClick: () => setShowCreateDialog(true),
        icon: <Plus className="w-4 h-4 mr-2" />
      }}
      summaryCards={[
        {
          title: "Total Assistants",
          value: totalAssistants,
          icon: <Bot className="h-4 w-4" />,
          color: "text-blue-600"
        },
        {
          title: "Active Assistants",
          value: activeAssistants,
          icon: <CheckCircle className="h-4 w-4" />,
          color: "text-green-600"
        },
        {
          title: "Total Interactions",
          value: totalInteractions.toLocaleString(),
          icon: <MessageSquare className="h-4 w-4" />,
          color: "text-purple-600"
        },
        {
          title: "Avg Response Time",
          value: `${avgResponseTime.toFixed(1)}s`,
          icon: <Zap className="h-4 w-4" />,
          color: "text-orange-600"
        }
      ]}
      searchPlaceholder="Search assistants..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          label: "All Types",
          value: typeFilter,
          options: [
            { value: "all", label: "All Types" },
            { value: "compliance", label: "Compliance" },
            { value: "scheduling", label: "Scheduling" },
            { value: "customer_service", label: "Customer Service" },
            { value: "analytics", label: "Analytics" },
            { value: "maintenance", label: "Maintenance" }
          ],
          onChange: setTypeFilter
        },
        {
          label: "All Statuses",
          value: statusFilter,
          options: [
            { value: "all", label: "All Statuses" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "maintenance", label: "Maintenance" }
          ],
          onChange: setStatusFilter
        }
      ]}
      tabs={[
        { value: "assistants", label: "Assistants" },
        { value: "compliance", label: "Compliance" },
        { value: "analytics", label: "Analytics" }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={false}
    >
      {/* Content based on active tab */}
      {activeTab === 'assistants' && (
        <Card>
          <CardHeader>
            <CardTitle>AI Assistants</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assistant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssistants.map((assistant) => (
                  <TableRow key={assistant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{assistant.avatar}</div>
                        <div>
                          <p className="font-medium">{assistant.name}</p>
                          <p className="text-sm text-gray-500">{assistant.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(assistant.type)}</TableCell>
                    <TableCell>{getStatusBadge(assistant.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Target className="w-3 h-3" />
                          {assistant.accuracy}% accuracy
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Zap className="w-3 h-3" />
                          {assistant.responseTime}s response
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(assistant.lastActive).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'compliance' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Compliance Assistant</span>
            </CardTitle>
            <CardDescription>
              AI-powered monitoring for regulations and documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                <p className="text-muted-foreground">No compliance alerts at this time</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getUrgencyIcon(alert.urgency)}
                      <h4 className="font-medium">{alert.title}</h4>
                    </div>
                    <Badge className={getUrgencyColor(alert.urgency)}>
                      {alert.urgency.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Affected: {alert.affected_entity}</span>
                    <span>Due: {new Date(alert.due_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Action: {alert.action_required}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      Mark Resolved
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle>Assistant Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Assistant analytics features coming soon</p>
              <p className="text-sm text-gray-500 mt-2">
                Performance metrics, usage analytics, and optimization insights for AI assistants
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Assistant Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New AI Assistant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">AI assistant creation form will be implemented here.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateDialog(false)}>
                Add Assistant
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}