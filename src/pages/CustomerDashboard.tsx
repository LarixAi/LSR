import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  Star, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Clock3,
  DollarSign,
  Car,
  Route,
  FileText,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Activity
} from 'lucide-react';
import StandardPageLayout, { 
  MetricCard,
  NavigationTab, 
  ActionButton, 
  FilterOption,
  TableColumn 
} from '@/components/layout/StandardPageLayout';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock customer data
  const mockCustomers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+44 7911 123456',
      company: 'Johnson & Associates',
      status: 'active',
      totalBookings: 24,
      totalSpent: 2840.50,
      lastBooking: '2024-01-15',
      rating: 4.8,
      location: 'London, UK'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'm.chen@techcorp.com',
      phone: '+44 7922 234567',
      company: 'TechCorp Solutions',
      status: 'active',
      totalBookings: 18,
      totalSpent: 1920.75,
      lastBooking: '2024-01-12',
      rating: 4.9,
      location: 'Manchester, UK'
    },
    {
      id: '3',
      name: 'Emma Thompson',
      email: 'emma.t@eventsplus.co.uk',
      phone: '+44 7933 345678',
      company: 'Events Plus Ltd',
      status: 'active',
      totalBookings: 31,
      totalSpent: 4560.25,
      lastBooking: '2024-01-18',
      rating: 4.7,
      location: 'Birmingham, UK'
    },
    {
      id: '4',
      name: 'David Rodriguez',
      email: 'd.rodriguez@globaltrans.com',
      phone: '+44 7944 456789',
      company: 'Global Transport',
      status: 'inactive',
      totalBookings: 12,
      totalSpent: 980.00,
      lastBooking: '2023-12-20',
      rating: 4.6,
      location: 'Liverpool, UK'
    },
    {
      id: '5',
      name: 'Lisa Park',
      email: 'lisa.park@executive.com',
      phone: '+44 7955 567890',
      company: 'Executive Travel',
      status: 'active',
      totalBookings: 28,
      totalSpent: 3250.80,
      lastBooking: '2024-01-16',
      rating: 4.9,
      location: 'Edinburgh, UK'
    }
  ];

  const mockBookings = [
    {
      id: 'B001',
      customerName: 'Sarah Johnson',
      service: 'Airport Transfer',
      date: '2024-01-20',
      time: '09:00',
      status: 'confirmed',
      amount: 85.50,
      vehicle: 'Mercedes E-Class',
      driver: 'John Smith'
    },
    {
      id: 'B002',
      customerName: 'Michael Chen',
      service: 'Corporate Event',
      date: '2024-01-22',
      time: '14:00',
      status: 'pending',
      amount: 320.00,
      vehicle: 'Mercedes Sprinter',
      driver: 'Mike Johnson'
    },
    {
      id: 'B003',
      customerName: 'Emma Thompson',
      service: 'Wedding Transport',
      date: '2024-01-25',
      time: '11:00',
      status: 'confirmed',
      amount: 450.00,
      vehicle: 'Rolls Royce Phantom',
      driver: 'David Wilson'
    }
  ];

  const mockFeedback = [
    {
      id: 'F001',
      customerName: 'Sarah Johnson',
      rating: 5,
      comment: 'Excellent service! Driver was professional and punctual.',
      date: '2024-01-15',
      service: 'Airport Transfer'
    },
    {
      id: 'F002',
      customerName: 'Michael Chen',
      rating: 4,
      comment: 'Good service overall. Vehicle was clean and comfortable.',
      date: '2024-01-12',
      service: 'Corporate Event'
    },
    {
      id: 'F003',
      customerName: 'Emma Thompson',
      rating: 5,
      comment: 'Perfect for our special day. Highly recommend!',
      date: '2024-01-10',
      service: 'Wedding Transport'
    }
    ];

  // Calculate stats
  const totalCustomers = mockCustomers.length;
  const activeCustomers = mockCustomers.filter(c => c.status === 'active').length;
  const totalRevenue = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const averageRating = mockCustomers.reduce((sum, c) => sum + c.rating, 0) / totalCustomers;

  // StandardPageLayout Configuration
  const pageTitle = "Customer Dashboard";
  const pageDescription = "Manage customer relationships, track bookings, and monitor customer satisfaction";

  const primaryAction: ActionButton = {
    label: "Add Customer",
    onClick: () => console.log("Add customer clicked"),
    icon: <Plus className="w-4 h-4" />
  };

  const secondaryActions: ActionButton[] = [
    {
      label: "Export Data",
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

  const metricsCards: MetricCard[] = [
    {
      title: "Total Customers",
      value: totalCustomers.toString(),
      subtitle: `${activeCustomers} active`,
      icon: <Users className="w-5 h-5" />,
      bgColor: "bg-blue-100",
      color: "text-blue-600"
    },
    {
      title: "Total Revenue",
      value: `£${totalRevenue.toLocaleString()}`,
      subtitle: "From all customers",
      icon: <DollarSign className="w-5 h-5" />,
      bgColor: "bg-green-100",
      color: "text-green-600"
    },
    {
      title: "Average Rating",
      value: averageRating.toFixed(1),
      subtitle: "Customer satisfaction",
      icon: <Star className="w-5 h-5" />,
      bgColor: "bg-yellow-100",
      color: "text-yellow-600"
    },
    {
      title: "Recent Bookings",
      value: mockBookings.length.toString(),
      subtitle: "This month",
      icon: <Calendar className="w-5 h-5" />,
      bgColor: "bg-purple-100",
      color: "text-purple-600"
    }
  ];

  const navigationTabs: NavigationTab[] = [
    { value: "overview", label: "Overview" },
    { value: "customers", label: "Customers", badge: totalCustomers },
    { value: "bookings", label: "Bookings", badge: mockBookings.length },
    { value: "feedback", label: "Feedback", badge: mockFeedback.length },
    { value: "analytics", label: "Analytics" }
  ];

  const searchConfig = {
    placeholder: "Search customers, bookings, or feedback...",
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
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" }
      ],
      placeholder: "Filter by status"
    }
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "Status") setStatusFilter(value);
  };

  const customerTableColumns: TableColumn[] = [
    { key: 'name', label: 'Customer Name' },
    { key: 'company', label: 'Company' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status' },
    { key: 'totalBookings', label: 'Total Bookings' },
    { key: 'totalSpent', label: 'Total Spent' },
    { key: 'rating', label: 'Rating' },
    { key: 'actions', label: 'Actions' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{rating}</span>
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      </div>
    );
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
      {/* Custom content for each tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Customer Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">New customer registration: Lisa Park</p>
                      <p className="text-sm text-gray-600">Executive Travel company joined</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">New booking: Wedding Transport</p>
                      <p className="text-sm text-gray-600">Emma Thompson - £450.00</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">5-star review received</p>
                      <p className="text-sm text-gray-600">Sarah Johnson - Airport Transfer</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">2 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Satisfaction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Customer Satisfaction Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">This Month</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-600">4.8</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Month</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-600">4.6</span>
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">3 Months Ago</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-600">4.5</span>
                      <TrendingDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Revenue Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="text-lg font-bold text-green-600">£2,450.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Month</span>
                    <span className="text-lg font-bold text-gray-600">£3,120.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">3 Months Ago</span>
                    <span className="text-lg font-bold text-gray-600">£2,890.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{customer.name}</h4>
                      <p className="text-sm text-gray-600">{customer.company}</p>
                      <p className="text-xs text-gray-500">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{customer.totalBookings} bookings</p>
                      <p className="text-xs text-gray-600">£{customer.totalSpent.toLocaleString()}</p>
                    </div>
                    {getRatingStars(customer.rating)}
                    {getStatusBadge(customer.status)}
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'bookings' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{booking.service}</h4>
                      <p className="text-sm text-gray-600">{booking.customerName}</p>
                      <p className="text-xs text-gray-500">{booking.date} at {booking.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">£{booking.amount}</p>
                      <p className="text-xs text-gray-600">{booking.vehicle}</p>
                    </div>
                    <Badge className={
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {booking.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'feedback' && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockFeedback.map((feedback) => (
                <div key={feedback.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{feedback.customerName}</h4>
                      <p className="text-sm text-gray-600">{feedback.service}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < feedback.rating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{feedback.comment}</p>
                  <p className="text-xs text-gray-500">{feedback.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600 mb-6">
                View detailed customer analytics, trends, and insights for business growth.
              </p>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </StandardPageLayout>
  );
};

export default CustomerDashboard;
