import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Calendar, 
  Plus, 
  Search, 
  Clock, 
  Users, 
  Truck, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  TrendingUp,
  CalendarDays
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  type: 'delivery' | 'pickup' | 'maintenance' | 'inspection' | 'training' | 'meeting';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  assigned_driver?: string;
  assigned_vehicle?: string;
  client_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function Schedule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('today');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);

  // Mock data - replace with actual API calls
  const scheduleItems: ScheduleItem[] = [
    {
      id: '1',
      title: 'Express Delivery to Manchester',
      description: 'Urgent delivery of medical supplies',
      type: 'delivery',
      status: 'scheduled',
      priority: 'urgent',
      start_date: '2024-08-28',
      end_date: '2024-08-28',
      start_time: '09:00',
      end_time: '13:00',
      location: 'Manchester General Hospital',
      assigned_driver: 'John Smith',
      assigned_vehicle: 'TRK-001',
      client_name: 'MediSupply Ltd',
      notes: 'Urgent medical supplies - handle with care',
      created_at: '2024-08-27T10:00:00Z',
      updated_at: '2024-08-27T10:00:00Z'
    },
    {
      id: '2',
      title: 'Vehicle Maintenance Check',
      description: 'Routine maintenance for TRK-002',
      type: 'maintenance',
      status: 'scheduled',
      priority: 'medium',
      start_date: '2024-08-29',
      end_date: '2024-08-29',
      start_time: '14:00',
      end_time: '16:00',
      location: 'London Depot',
      assigned_driver: 'Mike Johnson',
      assigned_vehicle: 'TRK-002',
      notes: 'Oil change and brake inspection',
      created_at: '2024-08-27T15:00:00Z',
      updated_at: '2024-08-27T15:00:00Z'
    },
    {
      id: '3',
      title: 'Equipment Pickup from Birmingham',
      description: 'Pickup construction equipment',
      type: 'pickup',
      status: 'completed',
      priority: 'high',
      start_date: '2024-08-26',
      end_date: '2024-08-26',
      start_time: '08:00',
      end_time: '14:00',
      location: 'Birmingham Construction Site',
      assigned_driver: 'Sarah Wilson',
      assigned_vehicle: 'TRK-003',
      client_name: 'BuildCorp Ltd',
      notes: 'Equipment ready for pickup at main gate',
      created_at: '2024-08-25T09:00:00Z',
      updated_at: '2024-08-26T16:00:00Z'
    },
    {
      id: '4',
      title: 'Driver Training Session',
      description: 'Safety training for new drivers',
      type: 'training',
      status: 'scheduled',
      priority: 'medium',
      start_date: '2024-08-30',
      end_date: '2024-08-30',
      start_time: '10:00',
      end_time: '12:00',
      location: 'Training Center',
      assigned_driver: 'All New Drivers',
      notes: 'Mandatory safety training session',
      created_at: '2024-08-27T11:00:00Z',
      updated_at: '2024-08-27T11:00:00Z'
    }
  ];

  // Calculate statistics
  const totalScheduled = scheduleItems.filter(item => item.status === 'scheduled').length;
  const inProgress = scheduleItems.filter(item => item.status === 'in_progress').length;
  const completed = scheduleItems.filter(item => item.status === 'completed').length;
  const overdue = scheduleItems.filter(item => item.status === 'overdue').length;
  const urgentItems = scheduleItems.filter(item => item.priority === 'urgent').length;

  // Filter items based on search and filters
  const filteredItems = scheduleItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.assigned_driver && item.assigned_driver.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  // Filter by active tab
  const getTabItems = () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const thisWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    switch (activeTab) {
      case 'today':
        return filteredItems.filter(item => item.start_date === today);
      case 'tomorrow':
        return filteredItems.filter(item => item.start_date === tomorrow);
      case 'this_week':
        return filteredItems.filter(item => 
          item.start_date >= today && item.start_date <= thisWeek
        );
      case 'overdue':
        return filteredItems.filter(item => item.status === 'overdue');
      default:
        return filteredItems;
    }
  };

  const tabItems = getTabItems();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'delivery':
        return <Badge className="bg-blue-100 text-blue-800">Delivery</Badge>;
      case 'pickup':
        return <Badge className="bg-purple-100 text-purple-800">Pickup</Badge>;
      case 'maintenance':
        return <Badge className="bg-orange-100 text-orange-800">Maintenance</Badge>;
      case 'inspection':
        return <Badge className="bg-teal-100 text-teal-800">Inspection</Badge>;
      case 'training':
        return <Badge className="bg-indigo-100 text-indigo-800">Training</Badge>;
      case 'meeting':
        return <Badge className="bg-pink-100 text-pink-800">Meeting</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <PageLayout
      title="Schedule"
      description="Manage and view all scheduled activities and appointments"
      actionButton={{
        label: "Add Schedule Item",
        onClick: () => setShowCreateDialog(true),
        icon: <Plus className="w-4 h-4 mr-2" />
      }}
      summaryCards={[
        {
          title: "Scheduled",
          value: totalScheduled,
          icon: <Calendar className="h-4 w-4" />,
          color: "text-blue-600"
        },
        {
          title: "In Progress",
          value: inProgress,
          icon: <Clock className="h-4 w-4" />,
          color: "text-yellow-600"
        },
        {
          title: "Overdue",
          value: overdue,
          icon: <AlertTriangle className="h-4 w-4" />,
          color: "text-red-600"
        },
        {
          title: "Urgent Items",
          value: urgentItems,
          icon: <XCircle className="h-4 w-4" />,
          color: "text-red-600"
        }
      ]}
      searchPlaceholder="Search schedule items..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          label: "All Statuses",
          value: statusFilter,
          options: [
            { value: "all", label: "All Statuses" },
            { value: "scheduled", label: "Scheduled" },
            { value: "in_progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
            { value: "overdue", label: "Overdue" }
          ],
          onChange: setStatusFilter
        },
        {
          label: "All Types",
          value: typeFilter,
          options: [
            { value: "all", label: "All Types" },
            { value: "delivery", label: "Delivery" },
            { value: "pickup", label: "Pickup" },
            { value: "maintenance", label: "Maintenance" },
            { value: "inspection", label: "Inspection" },
            { value: "training", label: "Training" },
            { value: "meeting", label: "Meeting" }
          ],
          onChange: setTypeFilter
        },
        {
          label: "All Priorities",
          value: priorityFilter,
          options: [
            { value: "all", label: "All Priorities" },
            { value: "urgent", label: "Urgent" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" }
          ],
          onChange: setPriorityFilter
        }
      ]}
      tabs={[
        { value: "today", label: "Today" },
        { value: "tomorrow", label: "Tomorrow" },
        { value: "this_week", label: "This Week" },
        { value: "overdue", label: "Overdue" }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={false}
    >
      {/* Schedule Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(item.type)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.start_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.start_time} - {item.end_time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </div>
                  </TableCell>
                  <TableCell>{item.assigned_driver || '-'}</TableCell>
                  <TableCell>{item.assigned_vehicle || '-'}</TableCell>
                  <TableCell>{item.client_name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Schedule Item Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Schedule Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Schedule item creation form will be implemented here.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateDialog(false)}>
                Add Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}