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
  Calculator, 
  Plus, 
  Search,
  Send,
  Eye,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  FileText,
  Mail,
  Phone,
  Download,
  Settings,
  Filter,
  BarChart3,
  Target,
  Award,
  AlertTriangle,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuotationsData } from '@/hooks/useQuotationsData';

interface Quotation {
  id: string;
  quoteNumber: string;
  customerName: string;
  contactPerson: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  serviceType: string;
  description: string;
  routeDetails: string;
  passengers: number;
  duration: string;
  frequency: string;
  baseAmount: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'pending' | 'accepted' | 'rejected' | 'expired' | 'converted';
  priority: 'low' | 'medium' | 'high';
  createdDate: string;
  validUntil: string;
  acceptedDate?: string;
  convertedDate?: string;
  invoiceId?: string;
  createdBy: string;
  lastModified: string;
  notes?: string;
  attachments: string[];
  followUpDate?: string;
  competitorQuotes: number;
  estimatedProbability: number;
}

interface QuoteLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const QuotationManagement: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [isCreateQuoteDialogOpen, setIsCreateQuoteDialogOpen] = useState<boolean>(false);
  
  // Get real quotation data from backend
  const { quotations, isLoading: quotationsLoading, clearAllQuotations, stats, hasData } = useQuotationsData();

  const handleClearQuotations = async () => {
    const confirmed = confirm(
      'Are you sure you want to clear all quotation data?\n\nThis will permanently delete:\n- All quotation records\n- All customer quotes\n- All sales pipeline data\n\nThis action cannot be undone.'
    );
    
    if (confirmed) {
      try {
        await clearAllQuotations.mutateAsync();
        toast({
          title: "Success!",
          description: "All quotation data has been cleared from the database.",
        });
      } catch (error) {
        console.error('Error clearing quotations:', error);
        toast({
          title: "Error",
          description: "Failed to clear quotation data. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading || quotationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading quotation management...</p>
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

  // Real quotations data from backend is now available via the useQuotationsData hook
  /*
  // Mock data removed - using real data from backend hook
  const quotations: Quotation[] = [
    {
      id: 'quote-001',
      quoteNumber: 'QUO-2024-001',
      customerName: 'St. Margaret\'s Academy',
      contactPerson: 'Mrs. Sarah Thompson',
      customerEmail: 'sarah.thompson@stmargarets.edu',
      customerPhone: '+44 20 7123 4567',
      customerAddress: '456 Education Lane, London, SW2 3BC',
      serviceType: 'School Transport',
      description: 'Daily school transport service for academic year 2024-2025',
      routeDetails: 'Pickup from residential areas to school campus, 2 routes',
      passengers: 45,
      duration: '12 months',
      frequency: 'Daily (Mon-Fri)',
      baseAmount: 48000.00,
      discountAmount: 2400.00,
      vatRate: 20,
      vatAmount: 9120.00,
      totalAmount: 54720.00,
      status: 'pending',
      priority: 'high',
      createdDate: '2024-01-05',
      validUntil: '2024-02-05',
      createdBy: 'Sales Manager',
      lastModified: '2024-01-15T10:30:00Z',
      notes: 'Potential for multi-year contract. Competitor pricing available.',
      attachments: ['route_map.pdf', 'service_proposal.pdf'],
      followUpDate: '2024-01-25',
      competitorQuotes: 2,
      estimatedProbability: 75
    },
    {
      id: 'quote-002',
      quoteNumber: 'QUO-2024-002',
      customerName: 'Healthcare Solutions Ltd',
      contactPerson: 'Dr. Michael Roberts',
      customerEmail: 'michael.roberts@healthsolutions.co.uk',
      customerPhone: '+44 161 987 6543',
      customerAddress: '789 Medical Centre, Manchester, M2 4DE',
      serviceType: 'Medical Transport',
      description: 'Patient transport for dialysis treatments',
      routeDetails: 'Home to clinic transport, wheelchair accessible',
      passengers: 8,
      duration: '6 months',
      frequency: '3 times per week',
      baseAmount: 15600.00,
      discountAmount: 0,
      vatRate: 20,
      vatAmount: 3120.00,
      totalAmount: 18720.00,
      status: 'accepted',
      priority: 'medium',
      createdDate: '2024-01-12',
      validUntil: '2024-02-12',
      acceptedDate: '2024-01-20',
      convertedDate: '2024-01-22',
      invoiceId: 'INV-2024-010',
      createdBy: 'Account Manager',
      lastModified: '2024-01-22T14:45:00Z',
      notes: 'Contract signed. Invoice generated.',
      attachments: ['signed_contract.pdf', 'insurance_cert.pdf'],
      competitorQuotes: 1,
      estimatedProbability: 100
    },
    {
      id: 'quote-003',
      quoteNumber: 'QUO-2024-003',
      customerName: 'TechCorp International',
      contactPerson: 'James Wilson',
      customerEmail: 'james.wilson@techcorp.com',
      customerPhone: '+44 121 555 7890',
      customerAddress: '321 Innovation Hub, Birmingham, B1 5GH',
      serviceType: 'Corporate Shuttle',
      description: 'Employee shuttle service for major conference',
      routeDetails: 'Hotel to conference centre, multiple pickup points',
      passengers: 120,
      duration: '3 days',
      frequency: 'Multiple daily runs',
      baseAmount: 8400.00,
      discountAmount: 400.00,
      vatRate: 20,
      vatAmount: 1600.00,
      totalAmount: 9600.00,
      status: 'rejected',
      priority: 'low',
      createdDate: '2024-01-08',
      validUntil: '2024-01-18',
      createdBy: 'Business Dev',
      lastModified: '2024-01-19T09:20:00Z',
      notes: 'Client chose competitor due to pricing. Feedback: 15% too expensive.',
      attachments: ['event_schedule.pdf'],
      competitorQuotes: 3,
      estimatedProbability: 0
    },
    {
      id: 'quote-004',
      quoteNumber: 'QUO-2024-004',
      customerName: 'Golden Years Care Home',
      contactPerson: 'Mrs. Patricia Davies',
      customerEmail: 'patricia.davies@goldenyears.co.uk',
      customerPhone: '+44 117 234 5678',
      customerAddress: '654 Care Gardens, Bristol, BS3 2FG',
      serviceType: 'Medical Transport',
      description: 'Regular medical appointments transport',
      routeDetails: 'Care home to various medical facilities',
      passengers: 12,
      duration: '12 months',
      frequency: 'As needed (avg 2x/week)',
      baseAmount: 9600.00,
      discountAmount: 0,
      vatRate: 20,
      vatAmount: 1920.00,
      totalAmount: 11520.00,
      status: 'sent',
      priority: 'medium',
      createdDate: '2024-01-18',
      validUntil: '2024-02-18',
      createdBy: 'Regional Manager',
      lastModified: '2024-01-18T16:15:00Z',
      notes: 'Follow up scheduled for next week.',
      attachments: ['service_terms.pdf'],
      followUpDate: '2024-01-26',
      competitorQuotes: 0,
      estimatedProbability: 60
    },
    {
      id: 'quote-005',
      quoteNumber: 'QUO-2024-005',
      customerName: 'Premier Events Company',
      contactPerson: 'Simon Clarke',
      customerEmail: 'simon.clarke@premierevents.co.uk',
      customerPhone: '+44 131 876 5432',
      customerAddress: '987 Event Plaza, Edinburgh, EH1 3JK',
      serviceType: 'Charter Service',
      description: 'VIP transport for corporate gala dinner',
      routeDetails: 'Airport transfers and event transport',
      passengers: 50,
      duration: '1 day',
      frequency: 'One-time event',
      baseAmount: 2800.00,
      discountAmount: 0,
      vatRate: 20,
      vatAmount: 560.00,
      totalAmount: 3360.00,
      status: 'draft',
      priority: 'high',
      createdDate: '2024-01-22',
      validUntil: '2024-02-05',
      createdBy: 'Event Coordinator',
      lastModified: '2024-01-22T11:30:00Z',
      notes: 'Rush job - high profile client. Premium pricing applied.',
      attachments: [],
      competitorQuotes: 1,
      estimatedProbability: 85
    }
  ];
  */

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
      converted: 'bg-emerald-100 text-emerald-800'
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
      case 'accepted':
      case 'converted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'expired':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'pending':
      case 'sent':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600';
    if (probability >= 50) return 'text-yellow-600';
    if (probability >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const isExpiringSoon = (validUntil: string) => {
    const expiryDate = new Date(validUntil);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const filteredQuotations = quotations.filter(quote => {
    const matchesSearch = quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || quote.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Real statistics from backend data
  const quoteStats = {
    totalQuotes: stats.totalQuotations,
    totalValue: stats.totalValue,
    acceptedValue: stats.acceptedValue,
    pendingValue: stats.pendingValue,
    acceptedCount: stats.acceptedQuotes,
    pendingCount: stats.pendingQuotes,
    rejectedCount: stats.rejectedQuotes,
    draftCount: stats.draftQuotes,
    expiringSoon: stats.expiredQuotes,
    avgQuoteValue: stats.averageValue,
    conversionRate: stats.winRate
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calculator className="w-8 h-8 text-blue-600" />
            Quotation Management
          </h1>
          <p className="text-gray-600 mt-1">Create, track, and convert customer quotations</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleClearQuotations} 
            variant="destructive" 
            className="inline-flex items-center"
            disabled={clearAllQuotations.isPending}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {clearAllQuotations.isPending ? 'Clearing...' : 'Clear All Data'}
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Dialog open={isCreateQuoteDialogOpen} onOpenChange={setIsCreateQuoteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Quotation</DialogTitle>
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
                      <Label htmlFor="contact-person">Contact Person</Label>
                      <Input id="contact-person" placeholder="Primary contact name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="contact@company.com" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="+44 20 1234 5678" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea id="address" placeholder="Full address" rows={3} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Quote Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quote-number">Quote Number</Label>
                        <Input id="quote-number" placeholder="QUO-2024-XXX" />
                      </div>
                      <div>
                        <Label htmlFor="service-type">Service Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
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
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="passengers">Passengers</Label>
                        <Input id="passengers" type="number" placeholder="0" />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration</Label>
                        <Input id="duration" placeholder="e.g., 6 months" />
                      </div>
                      <div>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Input id="frequency" placeholder="e.g., Daily" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="valid-until">Valid Until</Label>
                      <Input id="valid-until" type="date" />
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
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Service Details</h3>
                  <div>
                    <Label htmlFor="description">Service Description</Label>
                    <Textarea id="description" placeholder="Detailed description of services" rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="route-details">Route Details</Label>
                    <Textarea id="route-details" placeholder="Route information, pickup points, etc." rows={2} />
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pricing</h3>
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="base-amount">Base Amount (£)</Label>
                      <Input id="base-amount" type="number" step="0.01" placeholder="0.00" />
                    </div>
                    <div>
                      <Label htmlFor="discount">Discount (£)</Label>
                      <Input id="discount" type="number" step="0.01" placeholder="0.00" />
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
                      <Label htmlFor="total-amount">Total Amount (£)</Label>
                      <Input id="total-amount" type="number" step="0.01" placeholder="0.00" />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="probability">Win Probability (%)</Label>
                      <Input id="probability" type="number" min="0" max="100" placeholder="50" />
                    </div>
                    <div>
                      <Label htmlFor="competitor-quotes">Competitor Quotes</Label>
                      <Input id="competitor-quotes" type="number" min="0" placeholder="0" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes & Special Requirements</Label>
                    <Textarea id="notes" placeholder="Additional information, terms, conditions..." rows={3} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-gray-600 hover:bg-gray-700">
                    Save as Draft
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4 mr-2" />
                    Send Quote
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    Save & Follow Up
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
              <Calculator className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Quotes</p>
                <p className="text-2xl font-bold">{quoteStats.totalQuotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">£{quoteStats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Won Value</p>
                <p className="text-2xl font-bold text-green-600">£{quoteStats.acceptedValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Value</p>
                <p className="text-2xl font-bold text-yellow-600">£{quoteStats.pendingValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{quoteStats.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Quote Value</p>
                <p className="text-2xl font-bold text-indigo-600">£{quoteStats.avgQuoteValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{quoteStats.expiringSoon}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Draft Quotes</p>
                <p className="text-2xl font-bold text-gray-600">{quoteStats.draftCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rate Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Quote Conversion Performance</h3>
              <p className="text-gray-600">Current quote-to-win conversion rate</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{quoteStats.conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">
                {quoteStats.acceptedCount} of {quotations.filter(q => q.status !== 'draft').length} quotes won
              </div>
            </div>
          </div>
          <Progress value={quoteStats.conversionRate} className="h-3" />
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="quotes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="quotes">All Quotes</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="expiring">Expiring</TabsTrigger>
          <TabsTrigger value="won">Won</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Quotation Management
              </CardTitle>
              <div className="flex flex-wrap gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search quotes, customers..."
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
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
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
                    <TableHead>Quote</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Win %</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((quote) => (
                    <TableRow key={quote.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(quote.status)}
                          <div>
                            <p className="font-medium">{quote.quoteNumber}</p>
                            <p className="text-sm text-gray-500">
                              Created: {new Date(quote.createdDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quote.customerName}</p>
                          <p className="text-sm text-gray-500">{quote.contactPerson}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quote.serviceType}</p>
                          <p className="text-sm text-gray-500">
                            {quote.passengers} pax • {quote.frequency}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold">£{quote.totalAmount.toLocaleString()}</p>
                          {quote.discountAmount > 0 && (
                            <p className="text-sm text-green-600">
                              -£{quote.discountAmount.toFixed(2)} discount
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell>{getPriorityBadge(quote.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getProbabilityColor(quote.estimatedProbability)}`}>
                            {quote.estimatedProbability}%
                          </span>
                          {quote.competitorQuotes > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {quote.competitorQuotes} comp
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`${
                          isExpiringSoon(quote.validUntil) ? 'text-orange-600 font-medium' : ''
                        }`}>
                          {new Date(quote.validUntil).toLocaleDateString()}
                          {isExpiringSoon(quote.validUntil) && (
                            <p className="text-xs text-orange-600">Expiring soon!</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" title="View Quote">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" title="Edit Quote">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" title="Send Email">
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" title="Download PDF">
                            <Download className="w-4 h-4" />
                          </Button>
                          {quote.status === 'accepted' && (
                            <Button variant="outline" size="sm" title="Convert to Invoice" className="bg-green-50">
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                Pending Quotes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotations.filter(q => q.status === 'pending' || q.status === 'sent').map((quote) => (
                  <div key={quote.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Clock className="w-6 h-6 text-yellow-600" />
                        <div>
                          <h3 className="font-semibold">{quote.quoteNumber}</h3>
                          <p className="text-sm text-gray-600">{quote.customerName} • {quote.contactPerson}</p>
                          <p className="text-sm text-yellow-600">
                            Win probability: {quote.estimatedProbability}% 
                            {quote.followUpDate && ` • Follow up: ${new Date(quote.followUpDate).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">£{quote.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">
                          Expires: {new Date(quote.validUntil).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          Follow Up
                        </Button>
                        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Expiring Quotes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotations.filter(q => isExpiringSoon(q.validUntil)).map((quote) => (
                  <div key={quote.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                        <div>
                          <h3 className="font-semibold">{quote.quoteNumber}</h3>
                          <p className="text-sm text-gray-600">{quote.customerName}</p>
                          <p className="text-sm text-orange-600">
                            Expires in {Math.ceil((new Date(quote.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">£{quote.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Calendar className="w-4 h-4 mr-2" />
                          Extend
                        </Button>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                          <Send className="w-4 h-4 mr-2" />
                          Urgent Follow Up
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="won" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Won Quotes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotations.filter(q => q.status === 'accepted' || q.status === 'converted').map((quote) => (
                  <div key={quote.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Award className="w-6 h-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold">{quote.quoteNumber}</h3>
                          <p className="text-sm text-gray-600">{quote.customerName}</p>
                          <p className="text-sm text-green-600">
                            Accepted: {quote.acceptedDate ? new Date(quote.acceptedDate).toLocaleDateString() : 'N/A'}
                            {quote.status === 'converted' && quote.invoiceId && (
                              <span> • Invoice: {quote.invoiceId}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">£{quote.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{quote.serviceType}</p>
                      </div>
                      <div className="flex gap-2">
                        {quote.status === 'accepted' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Create Invoice
                          </Button>
                        )}
                        {quote.status === 'converted' && (
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Invoice
                          </Button>
                        )}
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
                Quotation Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Quote Analytics</h3>
                <p className="text-gray-600 mb-6">
                  Detailed analytics on conversion rates, win/loss analysis, and revenue forecasting.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
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
                Quotation Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Quote Configuration</h3>
                <p className="text-gray-600 mb-6">
                  Configure quote templates, approval workflows, and automated follow-ups.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
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

export default QuotationManagement;