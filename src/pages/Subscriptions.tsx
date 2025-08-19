import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/contexts/AuthContext';
import { useTrialStatus, useCreateTrial, useConvertTrial } from '@/hooks/useTrialManagement';
import { 
  CreditCard, 
  Calendar, 
  Users, 
  Truck, 
  Database, 
  Zap, 
  Check, 
  X, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Eye,
  Edit,
  Plus,
  Trash2,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Bell,
  Settings,
  HelpCircle,
  FileText,
  ExternalLink,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    drivers: number;
    vehicles: number;
    storage: number;
    apiCalls: number;
  };
  popular?: boolean;
  savings?: number; // Yearly savings percentage
}

interface CurrentSubscription {
  planId: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'trial';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  amount: number;
  trialEndsAt?: string;
  autoRenew: boolean;
  usage: {
    drivers: number;
    vehicles: number;
    storage: number;
    apiCalls: number;
  };
  paymentMethod: {
    type: 'card' | 'bank';
    last4: string;
    brand?: string;
    expiryDate?: string;
  };
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  invoiceUrl?: string;
  paymentMethod: string;
  taxAmount?: number;
  discountAmount?: number;
}

interface UsageTrend {
  date: string;
  drivers: number;
  vehicles: number;
  storage: number;
  apiCalls: number;
}

const availablePlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    billingCycle: 'monthly',
    features: [
      'Driver mobile app access',
      'Daily vehicle inspections',
      'Basic job management',
      'Route planning (up to 10 routes)',
      'Driver compliance tracking',
      'Basic reporting',
      'Email support',
      'GPS tracking',
      'Mobile notifications'
    ],
    limits: {
      drivers: 5,
      vehicles: 10,
      storage: 10, // GB
      apiCalls: 1000
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    billingCycle: 'monthly',
    features: [
      'All Starter features',
      'Advanced job scheduling',
      'Real-time tracking',
      'Compliance automation',
      'Advanced reporting & analytics',
      'Route optimization',
      'Driver performance metrics',
      'Incident management',
      'Priority support',
      'API access',
      'Custom integrations'
    ],
    limits: {
      drivers: 25,
      vehicles: 50,
      storage: 50, // GB
      apiCalls: 10000
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    billingCycle: 'monthly',
    features: [
      'All Professional features',
      'Unlimited routes',
      'Advanced analytics dashboard',
      'Custom reporting',
      'White-label options',
      'Dedicated account manager',
      '24/7 phone support',
      'Custom integrations',
      'Advanced security features',
      'Multi-location support'
    ],
    limits: {
      drivers: 100,
      vehicles: 200,
      storage: 200, // GB
      apiCalls: 50000
    }
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: 299,
    billingCycle: 'monthly',
    features: [
      'All Enterprise features',
      'Unlimited everything',
      'Custom development',
      'On-premise deployment option',
      'Advanced AI features',
      'Custom training',
      'SLA guarantees',
      'Advanced compliance features'
    ],
    limits: {
      drivers: -1, // Unlimited
      vehicles: -1, // Unlimited
      storage: 1000, // GB
      apiCalls: 100000
    }
  }
];

const yearlyPlans: SubscriptionPlan[] = availablePlans.map(plan => ({
  ...plan,
  billingCycle: 'yearly' as const,
  price: Math.round(plan.price * 10), // 2 months free
  savings: 17
}));

const mockCurrentSubscription: CurrentSubscription = {
  planId: 'professional',
  status: 'active',
  startDate: '2024-01-15',
  endDate: '2024-12-15',
  nextBillingDate: '2024-02-15',
  amount: 79,
  autoRenew: true,
  usage: {
    drivers: 12,
    vehicles: 23,
    storage: 28.5,
    apiCalls: 6500
  },
  paymentMethod: {
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryDate: '12/25'
  }
};

const mockBillingHistory: BillingHistory[] = [
  {
    id: '1',
    date: '2024-01-15',
    amount: 79,
    status: 'paid',
    description: 'Professional Plan - Monthly',
    invoiceUrl: '#',
    paymentMethod: 'Visa ending in 4242',
    taxAmount: 7.11,
    discountAmount: 0
  },
  {
    id: '2',
    date: '2023-12-15',
    amount: 79,
    status: 'paid',
    description: 'Professional Plan - Monthly',
    invoiceUrl: '#',
    paymentMethod: 'Visa ending in 4242',
    taxAmount: 7.11,
    discountAmount: 0
  },
  {
    id: '3',
    date: '2023-11-15',
    amount: 79,
    status: 'paid',
    description: 'Professional Plan - Monthly',
    invoiceUrl: '#',
    paymentMethod: 'Visa ending in 4242',
    taxAmount: 7.11,
    discountAmount: 0
  }
];

const mockUsageTrends: UsageTrend[] = [
  { date: '2024-01-01', drivers: 10, vehicles: 20, storage: 25, apiCalls: 5000 },
  { date: '2024-01-08', drivers: 11, vehicles: 21, storage: 26, apiCalls: 5500 },
  { date: '2024-01-15', drivers: 12, vehicles: 23, storage: 28.5, apiCalls: 6500 },
];

export default function Subscriptions() {
  const { profile } = useAuth();
  const { data: trialStatus } = useTrialStatus();
  const createTrial = useCreateTrial();
  const convertTrial = useConvertTrial();
  
  const [currentSubscription] = useState<CurrentSubscription>(mockCurrentSubscription);
  const [billingHistory] = useState<BillingHistory[]>(mockBillingHistory);
  const [usageTrends] = useState<UsageTrend[]>(mockUsageTrends);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [autoRenew, setAutoRenew] = useState(currentSubscription.autoRenew);
  const [showYearlyPlans, setShowYearlyPlans] = useState(false);

  const currentPlan = (showYearlyPlans ? yearlyPlans : availablePlans).find(plan => plan.id === currentSubscription.planId);
  const plansToShow = showYearlyPlans ? yearlyPlans : availablePlans;

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <X className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'trial': return <Star className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getUsageTrend = (metric: keyof UsageTrend) => {
    if (usageTrends.length < 2) return 0;
    const current = usageTrends[usageTrends.length - 1][metric] as number;
    const previous = usageTrends[usageTrends.length - 2][metric] as number;
    return ((current - previous) / previous) * 100;
  };

  const handleUpgrade = () => {
    if (selectedPlan) {
      toast.success(`Successfully upgraded to ${selectedPlan} plan!`);
      setIsUpgradeDialogOpen(false);
    }
  };

  const handleDowngrade = () => {
    toast.success('Successfully downgraded plan!');
  };

  const handleCancel = () => {
    toast.success('Subscription cancelled successfully!');
  };

  const handleToggleAutoRenew = () => {
    setAutoRenew(!autoRenew);
    toast.success(`Auto-renew ${!autoRenew ? 'enabled' : 'disabled'} successfully!`);
  };

  const handleExportData = () => {
    toast.success('Data export started! You will receive an email when ready.');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Trial Status Section */}
      {trialStatus && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-600" />
              Trial Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {trialStatus.daysLeft}
                </div>
                <div className="text-sm text-muted-foreground">Days Left</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {trialStatus.currentDrivers}/{trialStatus.maxDrivers}
                </div>
                <div className="text-sm text-muted-foreground">Drivers Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {trialStatus.isActive ? 'Active' : 'Expired'}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
            </div>
            {trialStatus.isActive && trialStatus.daysLeft <= 7 && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Trial ending soon! Upgrade to keep your data and continue using the platform.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Manage your subscription, billing, and usage</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(true)}>
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" onClick={() => setIsPaymentDialogOpen(true)}>
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Methods
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Cost</p>
                <p className="text-2xl font-bold">${currentSubscription.amount}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Billing</p>
                <p className="text-2xl font-bold">{new Date(currentSubscription.nextBillingDate).toLocaleDateString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usage Trend</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <p className="text-2xl font-bold text-green-600">+12%</p>
                </div>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Auto-Renew</p>
                <div className="flex items-center gap-2">
                  <Switch checked={autoRenew} onCheckedChange={handleToggleAutoRenew} />
                  <span className="text-sm">{autoRenew ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
              <RefreshCw className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 gap-1 h-auto p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Subscription</span>
                <Badge className={getStatusColor(currentSubscription.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(currentSubscription.status)}
                    {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
                  </div>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-lg">{currentPlan?.name} Plan</h3>
                  <p className="text-2xl font-bold">${currentSubscription.amount}/month</p>
                  <p className="text-sm text-muted-foreground">Next billing: {new Date(currentSubscription.nextBillingDate).toLocaleDateString()}</p>
                  {currentSubscription.trialEndsAt && (
                    <p className="text-sm text-blue-600 mt-1">
                      Trial ends: {new Date(currentSubscription.trialEndsAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Subscription Period</h4>
                  <p className="text-sm">
                    {new Date(currentSubscription.startDate).toLocaleDateString()} - {new Date(currentSubscription.endDate).toLocaleDateString()}
                  </p>
                  <div className="mt-2">
                    <h4 className="font-medium mb-2">Payment Method</h4>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">
                        {currentSubscription.paymentMethod.brand} ending in {currentSubscription.paymentMethod.last4}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsUpgradeDialogOpen(true)}>
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    Upgrade
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDowngrade}>
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                    Downgrade
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentSubscription.usage.drivers}</div>
                <div className="flex items-center gap-1 mt-1">
                                      {getUsageTrend('drivers') > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {Math.abs(getUsageTrend('drivers')).toFixed(1)}% from last week
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(currentSubscription.usage.drivers, currentPlan?.limits.drivers || 0)} 
                    className="mt-2" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentPlan?.limits.drivers === -1 ? 'Unlimited' : `${currentPlan?.limits.drivers} limit`}
                  </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentSubscription.usage.vehicles}</div>
                <div className="flex items-center gap-1 mt-1">
                  {getUsageTrend('vehicles') > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {Math.abs(getUsageTrend('vehicles')).toFixed(1)}% from last week
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(currentSubscription.usage.vehicles, currentPlan?.limits.vehicles || 0)} 
                  className="mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {currentPlan?.limits.vehicles === -1 ? 'Unlimited' : `${currentPlan?.limits.vehicles} limit`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentSubscription.usage.storage}GB</div>
                <div className="flex items-center gap-1 mt-1">
                  {getUsageTrend('storage') > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {Math.abs(getUsageTrend('storage')).toFixed(1)}% from last week
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(currentSubscription.usage.storage, currentPlan?.limits.storage || 0)} 
                  className="mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {currentPlan?.limits.storage}GB limit
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentSubscription.usage.apiCalls.toLocaleString()}</div>
                <div className="flex items-center gap-1 mt-1">
                  {getUsageTrend('apiCalls') > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {Math.abs(getUsageTrend('apiCalls')).toFixed(1)}% from last week
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(currentSubscription.usage.apiCalls, currentPlan?.limits.apiCalls || 0)} 
                  className="mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {currentPlan?.limits.apiCalls.toLocaleString()} limit
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {currentSubscription.usage.drivers > (currentPlan?.limits.drivers || 0) * 0.8 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You're approaching your driver limit. Consider upgrading to add more drivers.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">${invoice.amount}</div>
                          {invoice.taxAmount && (
                            <div className="text-xs text-muted-foreground">
                              Tax: ${invoice.taxAmount}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{invoice.paymentMethod}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
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

        <TabsContent value="plans" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Available Plans</h3>
              <p className="text-muted-foreground">Choose the plan that best fits your needs</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Monthly</span>
              <Switch 
                checked={showYearlyPlans} 
                onCheckedChange={setShowYearlyPlans}
              />
              <span className="text-sm">Yearly</span>
              {showYearlyPlans && (
                <Badge className="bg-green-100 text-green-800">
                  Save 17%
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plansToShow.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                {plan.savings && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-100 text-green-800">Save {plan.savings}%</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">${plan.price}<span className="text-sm font-normal text-muted-foreground">/{plan.billingCycle === 'monthly' ? 'month' : 'year'}</span></div>
                  {plan.billingCycle === 'yearly' && (
                    <p className="text-sm text-muted-foreground">${Math.round(plan.price / 12)}/month when billed yearly</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Drivers:</span>
                      <span>{plan.limits.drivers === -1 ? 'Unlimited' : plan.limits.drivers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Vehicles:</span>
                      <span>{plan.limits.vehicles === -1 ? 'Unlimited' : plan.limits.vehicles}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Storage:</span>
                      <span>{plan.limits.storage}GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>API Calls:</span>
                      <span>{plan.limits.apiCalls.toLocaleString()}/month</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    variant={plan.id === currentSubscription.planId ? "outline" : "default"}
                    disabled={plan.id === currentSubscription.planId}
                    onClick={() => {
                      if (plan.id !== currentSubscription.planId) {
                        setSelectedPlan(plan.id);
                        setIsUpgradeDialogOpen(true);
                      }
                    }}
                  >
                    {plan.id === currentSubscription.planId ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Monthly Usage Trends</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Drivers</span>
                        <span>{currentSubscription.usage.drivers}/{currentPlan?.limits.drivers === -1 ? '∞' : currentPlan?.limits.drivers}</span>
                      </div>
                      <Progress value={getUsagePercentage(currentSubscription.usage.drivers, currentPlan?.limits.drivers || 0)} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Vehicles</span>
                        <span>{currentSubscription.usage.vehicles}/{currentPlan?.limits.vehicles === -1 ? '∞' : currentPlan?.limits.vehicles}</span>
                      </div>
                      <Progress value={getUsagePercentage(currentSubscription.usage.vehicles, currentPlan?.limits.vehicles || 0)} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage</span>
                        <span>{currentSubscription.usage.storage}GB/{currentPlan?.limits.storage}GB</span>
                      </div>
                      <Progress value={getUsagePercentage(currentSubscription.usage.storage, currentPlan?.limits.storage || 0)} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>API Calls</span>
                        <span>{currentSubscription.usage.apiCalls.toLocaleString()}/{currentPlan?.limits.apiCalls.toLocaleString()}</span>
                      </div>
                      <Progress value={getUsagePercentage(currentSubscription.usage.apiCalls, currentPlan?.limits.apiCalls || 0)} />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Usage Recommendations</h3>
                  <div className="space-y-3">
                    {currentSubscription.usage.drivers > (currentPlan?.limits.drivers || 0) * 0.8 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Approaching driver limit</span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">Consider upgrading to add more drivers</p>
                      </div>
                    )}
                    {currentSubscription.usage.vehicles > (currentPlan?.limits.vehicles || 0) * 0.8 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Approaching vehicle limit</span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">Consider upgrading to add more vehicles</p>
                      </div>
                    )}
                    {currentSubscription.usage.storage > (currentPlan?.limits.storage || 0) * 0.8 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Approaching storage limit</span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">Consider upgrading for more storage</p>
                      </div>
                    )}
                    {currentSubscription.usage.apiCalls > (currentPlan?.limits.apiCalls || 0) * 0.8 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Approaching API limit</span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">Consider upgrading for more API calls</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Subscription Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoRenew">Auto-Renew Subscription</Label>
                    <p className="text-sm text-muted-foreground">Automatically renew your subscription</p>
                  </div>
                  <Switch id="autoRenew" checked={autoRenew} onCheckedChange={handleToggleAutoRenew} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive billing notifications</p>
                  </div>
                  <Switch id="emailNotifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="usageAlerts">Usage Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when approaching limits</p>
                  </div>
                  <Switch id="usageAlerts" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6" />
                      <div>
                        <p className="font-medium">
                          {currentSubscription.paymentMethod.brand} ending in {currentSubscription.paymentMethod.last4}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires {currentSubscription.paymentMethod.expiryDate}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Default</Badge>
                  </div>
                </div>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Payment Method
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Subscription</DialogTitle>
            <DialogDescription>
              Choose a new plan to upgrade your subscription. Changes will take effect immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="plan">Select Plan</Label>
              <Select value={selectedPlan || ''} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plansToShow.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - ${plan.price}/{plan.billingCycle === 'monthly' ? 'month' : 'year'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPlan && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Plan Details</h4>
                <div className="space-y-1 text-sm">
                  {plansToShow.find(p => p.id === selectedPlan)?.features.slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpgrade} disabled={!selectedPlan}>
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Methods Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Methods</DialogTitle>
            <DialogDescription>
              Manage your payment methods and billing information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6" />
                  <div>
                    <p className="font-medium">
                      {currentSubscription.paymentMethod.brand} ending in {currentSubscription.paymentMethod.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires {currentSubscription.paymentMethod.expiryDate}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Default</Badge>
              </div>
            </div>
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add New Payment Method
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}