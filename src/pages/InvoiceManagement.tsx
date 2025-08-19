import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Plus, 
  Search,
  DollarSign,
  Send,
  Download,
  Eye,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Filter,
  Settings,
  Mail,
  Printer,
  CreditCard,
  Phone,
  Users,
  TrendingUp,
  FileSpreadsheet,
  Receipt,
  BarChart3,
  RotateCcw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useInvoicesData } from '@/hooks/useInvoicesData';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  serviceType: string;
  description: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  createdBy: string;
  lastModified: string;
  notes?: string;
  remindersSent: number;
  attachments: string[];
}

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const InvoiceManagement: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [isCreateInvoiceDialogOpen, setIsCreateInvoiceDialogOpen] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Get real invoice data from backend
  const { invoices, isLoading: invoicesLoading, clearAllInvoices, stats, hasData } = useInvoicesData();

  const handleClearInvoices = async () => {
    const confirmed = confirm(
      'Are you sure you want to clear all invoice data?\n\nThis will permanently delete:\n- All invoice records\n- All payment history\n- All customer invoicing data\n\nThis action cannot be undone.'
    );
    
    if (confirmed) {
      try {
        await clearAllInvoices.mutateAsync();
        toast({
          title: "Success!",
          description: "All invoice data has been cleared from the database.",
        });
      } catch (error) {
        console.error('Error clearing invoices:', error);
        toast({
          title: "Error",
          description: "Failed to clear invoice data. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading || invoicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading invoice management...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only admins and council can access
  if (!['admin', 'council'].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Real invoices data from backend is now available via the useInvoicesData hook
  /*
  // Mock data removed - using real data from backend hook
  const invoices: Invoice[] = [
    {
      id: 'inv-001',
      invoiceNumber: 'INV-2024-001',
      customerName: 'Elmwood Primary School',
      customerEmail: 'admin@elmwood.edu',
      customerAddress: '123 School Lane, London, SW1A 1AA',
      serviceType: 'School Transport',
      description: 'Daily school transport service for January 2024',
      subtotal: 4500.00,
      vatRate: 20,
      vatAmount: 900.00,
      totalAmount: 5400.00,
      status: 'paid',
      priority: 'high',
      issueDate: '2024-01-01',
      dueDate: '2024-01-31',
      paidDate: '2024-01-28',
      paymentMethod: 'Bank Transfer',
      createdBy: 'Admin User',
      lastModified: '2024-01-28T14:30:00Z',
      notes: 'Regular monthly service contract',
      remindersSent: 1,
      attachments: ['contract_2024.pdf', 'route_schedule.pdf']
    },
    {
      id: 'inv-002',
      invoiceNumber: 'INV-2024-002',
      customerName: 'Sunset Care Home',
      customerEmail: 'finance@sunsetcare.co.uk',
      customerAddress: '456 Care Street, Manchester, M1 2AB',
      serviceType: 'Medical Transport',
      description: 'Medical appointment transport services',
      subtotal: 1800.00,
      vatRate: 20,
      vatAmount: 360.00,
      totalAmount: 2160.00,
      status: 'pending',
      priority: 'medium',
      issueDate: '2024-01-15',
      dueDate: '2024-02-14',
      createdBy: 'Finance Team',
      lastModified: '2024-01-15T16:20:00Z',
      notes: 'Weekly medical transport for 4 residents',
      remindersSent: 0,
      attachments: ['service_schedule.pdf']
    },
    {
      id: 'inv-003',
      invoiceNumber: 'INV-2024-003',
      customerName: 'Tech Solutions Ltd',
      customerEmail: 'accounts@techsolutions.com',
      customerAddress: '789 Business Park, Birmingham, B1 3CD',
      serviceType: 'Corporate Shuttle',
      description: 'Employee shuttle service for tech conference',
      subtotal: 2400.00,
      vatRate: 20,
      vatAmount: 480.00,
      totalAmount: 2880.00,
      status: 'overdue',
      priority: 'high',
      issueDate: '2024-01-10',
      dueDate: '2024-02-09',
      createdBy: 'Sales Team',
      lastModified: '2024-02-10T09:15:00Z',
      notes: 'Conference transport - urgent payment required',
      remindersSent: 3,
      attachments: ['conference_details.pdf', 'payment_terms.pdf']
    },
    {
      id: 'inv-004',
      invoiceNumber: 'INV-2024-004',
      customerName: 'Johnson & Associates',
      customerEmail: 'billing@johnson-law.co.uk',
      customerAddress: '321 Legal Lane, Leeds, LS1 4EF',
      serviceType: 'Charter Service',
      description: 'Corporate event transportation',
      subtotal: 1200.00,
      vatRate: 20,
      vatAmount: 240.00,
      totalAmount: 1440.00,
      status: 'sent',
      priority: 'low',
      issueDate: '2024-01-12',
      dueDate: '2024-02-11',
      createdBy: 'Operations Team',
      lastModified: '2024-01-12T11:45:00Z',
      notes: 'Annual company retreat transport',
      remindersSent: 0,
      attachments: ['event_schedule.pdf']
    },
    {
      id: 'inv-005',
      invoiceNumber: 'INV-2024-005',
      customerName: 'Green Valley Academy',
      customerEmail: 'finance@greenvalley.edu',
      customerAddress: '654 Academy Road, Bristol, BS1 5GH',
      serviceType: 'School Transport',
      description: 'Special needs transport service',
      subtotal: 3600.00,
      vatRate: 20,
      vatAmount: 720.00,
      totalAmount: 4320.00,
      status: 'draft',
      priority: 'medium',
      issueDate: '2024-01-20',
      dueDate: '2024-02-19',
      createdBy: 'Admin User',
      lastModified: '2024-01-20T13:20:00Z',
      notes: 'Specialized transport for mobility-impaired students',
      remindersSent: 0,
      attachments: []
    }
  ];
  */

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: 'bg-green-100 text-green-800',
      sent: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={priorityConfig[priority as keyof typeof priorityConfig] || 'bg-gray-100 text-gray-800'}>
        {priority}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'pending':
      case 'sent':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || invoice.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Real statistics from backend data
  const invoiceStats = {
    totalInvoices: stats.totalInvoices,
    totalRevenue: stats.totalAmount,
    paidAmount: stats.paidInvoices * stats.averageValue, // Estimate paid amount
    pendingAmount: stats.pendingAmount,
    overdueAmount: stats.overdueAmount,
    draftCount: stats.draftInvoices,
    overdueCount: stats.overdueInvoices,
    avgInvoiceValue: stats.averageValue
  };

  const paymentRate = stats.paidPercentage;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Receipt className="w-8 h-8 text-green-600" />
            Invoice Management
          </h1>
          <p className="text-gray-600 mt-1">Create, send, track, and manage customer invoices</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleClearInvoices} 
            variant="destructive" 
            className="inline-flex items-center"
            disabled={clearAllInvoices.isPending}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {clearAllInvoices.isPending ? 'Clearing...' : 'Clear All Data'}
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateInvoiceDialogOpen} onOpenChange={setIsCreateInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Customer Information</h3>
                    <div>
                      <Label htmlFor="customer-name">Customer Name</Label>
                      <Input id="customer-name" placeholder="Company or individual name" />
                    </div>
                    <div>
                      <Label htmlFor="customer-email">Email Address</Label>
                      <Input id="customer-email" type="email" placeholder="customer@company.com" />
                    </div>
                    <div>
                      <Label htmlFor="customer-address">Billing Address</Label>
                      <Textarea id="customer-address" placeholder="Full billing address" rows={3} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Invoice Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="invoice-number">Invoice Number</Label>
                        <Input id="invoice-number" placeholder="INV-2024-XXX" />
                      </div>
                      <div>
                        <Label htmlFor="service-type">Service Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="school">School Transport</SelectItem>
                            <SelectItem value="medical">Medical Transport</SelectItem>
                            <SelectItem value="corporate">Corporate Shuttle</SelectItem>
                            <SelectItem value="charter">Charter Service</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="issue-date">Issue Date</Label>
                        <Input id="issue-date" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="due-date">Due Date</Label>
                        <Input id="due-date" type="date" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Service Description */}
                <div>
                  <Label htmlFor="description">Service Description</Label>
                  <Textarea id="description" placeholder="Detailed description of services provided" rows={3} />
                </div>

                {/* Financial Details */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="subtotal">Subtotal (£)</Label>
                    <Input id="subtotal" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div>
                    <Label htmlFor="vat-rate">VAT Rate (%)</Label>
                    <Input id="vat-rate" type="number" step="0.01" placeholder="20.00" />
                  </div>
                  <div>
                    <Label htmlFor="vat-amount">VAT Amount (£)</Label>
                    <Input id="vat-amount" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div>
                    <Label htmlFor="total">Total Amount (£)</Label>
                    <Input id="total" type="number" step="0.01" placeholder="0.00" />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea id="notes" placeholder="Payment terms, special instructions, etc." rows={2} />
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-gray-600 hover:bg-gray-700">
                    Save as Draft
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4 mr-2" />
                    Send Invoice
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    Create & Pay
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Receipt className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold">{invoiceStats.totalInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">£{invoiceStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600">Paid Amount</p>
                <p className="text-2xl font-bold text-emerald-600">£{invoiceStats.paidAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">£{invoiceStats.pendingAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">£{invoiceStats.overdueAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-600">{invoiceStats.draftCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Value</p>
                <p className="text-2xl font-bold text-purple-600">£{invoiceStats.avgInvoiceValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">Payment Rate</p>
                <p className="text-2xl font-bold text-indigo-600">{paymentRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Rate Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Payment Performance</h3>
              <p className="text-gray-600">Current payment collection rate</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">{paymentRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">
                £{invoiceStats.paidAmount.toLocaleString()} of £{invoiceStats.totalRevenue.toLocaleString()}
              </div>
            </div>
          </div>
          <Progress value={paymentRate} className="h-3" />
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="invoices">All Invoices</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Invoice Management
              </CardTitle>
              <div className="flex flex-wrap gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search invoices, customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invoice.status)}
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-gray-500">
                              Issued: {new Date(invoice.issueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.customerName}</p>
                          <p className="text-sm text-gray-500">{invoice.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.serviceType}</p>
                          <p className="text-sm text-gray-500 truncate max-w-32">
                            {invoice.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold">£{invoice.totalAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">
                            +£{invoice.vatAmount.toFixed(2)} VAT
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{getPriorityBadge(invoice.priority)}</TableCell>
                      <TableCell>
                        <div className={`${
                          invoice.status === 'overdue' ? 'text-red-600 font-medium' : ''
                        }`}>
                          {new Date(invoice.dueDate).toLocaleDateString()}
                          {invoice.remindersSent > 0 && (
                            <p className="text-xs text-orange-600">
                              {invoice.remindersSent} reminder{invoice.remindersSent > 1 ? 's' : ''} sent
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" title="View Invoice">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" title="Edit Invoice">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" title="Send Email">
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" title="Download PDF">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" title="Copy Invoice">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Overdue Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.filter(inv => inv.status === 'overdue').map((invoice) => (
                  <div key={invoice.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        <div>
                          <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                          <p className="text-sm text-gray-600">{invoice.customerName}</p>
                          <p className="text-sm text-red-600">
                            Overdue by {Math.ceil((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">£{invoice.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{invoice.remindersSent} reminders sent</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          Send Reminder
                        </Button>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          <Phone className="w-4 h-4 mr-2" />
                          Call Customer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Draft Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.filter(inv => inv.status === 'draft').map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                        <p className="text-sm text-gray-600">{invoice.customerName} • {invoice.serviceType}</p>
                        <p className="text-sm text-gray-500">
                          Last modified: {new Date(invoice.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">£{invoice.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Invoice Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Invoice Analytics</h3>
                <p className="text-gray-600 mb-6">
                  Detailed analytics on payment patterns, customer behavior, and revenue trends.
                </p>
                <Button className="bg-green-600 hover:bg-green-700">
                  View Analytics Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Invoice Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice Configuration</h3>
                <p className="text-gray-600 mb-6">
                  Configure invoice templates, payment terms, and automated reminders.
                </p>
                <Button className="bg-green-600 hover:bg-green-700">
                  Configure Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceManagement;