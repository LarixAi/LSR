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
import { useTrialStatus } from '@/hooks/useTrialManagement';
import { 
  useSubscriptionPlans, 
  useCompanySubscription, 
  useBillingHistory, 
  useUsageData,
  useUpdateSubscription,
  useCancelSubscription,
  type SubscriptionPlan as BackendSubscriptionPlan,
  type CurrentSubscription as BackendCurrentSubscription,
  type BillingHistory as BackendBillingHistory,
  type UsageData as BackendUsageData
} from '@/hooks/useSubscriptions';
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
  Plus,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Settings,
  RefreshCw,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

// Frontend interfaces that match the backend structure
interface SubscriptionPlan extends BackendSubscriptionPlan {
  // Add any frontend-specific properties here if needed
}




// Helper function to transform backend plan to frontend format
const transformPlan = (backendPlan: BackendSubscriptionPlan): SubscriptionPlan => {
  return {
    ...backendPlan,
    // Add any transformations here if needed
  };
};


// Helper function to calculate usage percentage
const getUsagePercentage = (current: number, limit: number): number => {
  if (limit === -1) return 0; // Unlimited
  if (limit === 0) return 0;
  return Math.min((current / limit) * 100, 100);
};

// Helper function to get usage trend (mock data for now)
const getUsageTrend = (type: 'drivers' | 'vehicles' | 'storage' | 'api_calls'): number => {
  // Mock trend data - in real app, this would come from historical usage data
  const trends = {
    drivers: 5.2,
    vehicles: -2.1,
    storage: 12.5,
    api_calls: 8.7
  };
  return trends[type];
};

export default function Subscriptions() {
  const { profile } = useAuth();
  const { data: trialStatus } = useTrialStatus();
  
  // Use real subscription data from backend
  const { data: backendPlans = [] } = useSubscriptionPlans();
  const { data: currentSubscription } = useCompanySubscription(profile?.organization_id);
  const { data: billingHistory = [] } = useBillingHistory(profile?.organization_id);
  const { data: usageData = [] } = useUsageData(profile?.organization_id);
  
  // Mutation hooks for subscription management
  const updateSubscription = useUpdateSubscription();
  const cancelSubscription = useCancelSubscription();
  
  // Transform backend data to frontend format
  const subscriptionPlans = backendPlans.map(transformPlan);
  
  // Get current usage from usage data
  const currentUsage = usageData[0] || {
    drivers: 0,
    vehicles: 0,
    storage: 0,
    api_calls: 0
  };
  
  // State for dialogs and form data
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isDowngradeDialogOpen, setIsDowngradeDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [autoRenew, setAutoRenew] = useState(currentSubscription?.auto_renew ?? true);
  const [showYearlyPlans, setShowYearlyPlans] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  // Use real subscription data or fallback to available plans
  const plansToShow = showYearlyPlans ? subscriptionPlans.filter(plan => plan.billing_cycle === 'yearly') : subscriptionPlans;
  const currentPlanFrontend = currentSubscription ? 
    subscriptionPlans.find(plan => plan.id === currentSubscription.plan_id) :
    subscriptionPlans.find(plan => plan.id === 'professional'); // Default to professional if no subscription


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


  const handleUpgrade = async () => {
    if (selectedPlan && currentSubscription) {
      try {
        await updateSubscription.mutateAsync({
          planId: selectedPlan,
          autoRenew: autoRenew
        });
        setIsUpgradeDialogOpen(false);
        setSelectedPlan(null);
      } catch (error) {
        console.error('Failed to upgrade subscription:', error);
      }
    }
  };

  const handleDowngrade = async () => {
    if (selectedPlan && currentSubscription) {
      try {
        await updateSubscription.mutateAsync({
          planId: selectedPlan,
          autoRenew: autoRenew
        });
        setIsDowngradeDialogOpen(false);
        setSelectedPlan(null);
      } catch (error) {
        console.error('Failed to downgrade subscription:', error);
      }
    }
  };

  const handleCancel = async () => {
    if (currentSubscription) {
      try {
        await cancelSubscription.mutateAsync();
        setIsCancelDialogOpen(false);
        setCancellationReason('');
      } catch (error) {
        console.error('Failed to cancel subscription:', error);
      }
    }
  };

  const handleToggleAutoRenew = async () => {
    if (currentSubscription) {
      try {
        await updateSubscription.mutateAsync({
          planId: currentSubscription.plan_id,
          autoRenew: !autoRenew
        });
        setAutoRenew(!autoRenew);
      } catch (error) {
        console.error('Failed to toggle auto-renew:', error);
      }
    }
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
          <Button 
            variant="outline" 
            onClick={() => setIsUpgradeDialogOpen(true)}
            disabled={updateSubscription.isPending}
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            {updateSubscription.isPending ? 'Upgrading...' : 'Upgrade Plan'}
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
                <p className="text-2xl font-bold">£{currentSubscription?.amount || 79}</p>
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
                <p className="text-2xl font-bold">
                  {currentSubscription?.next_billing_date 
                    ? new Date(currentSubscription.next_billing_date).toLocaleDateString()
                    : new Date(currentSubscription?.start_date || '').toLocaleDateString() // Fallback to start date if next billing is not set
                  }
                </p>
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
                                <Badge className={getStatusColor(currentSubscription?.status || 'inactive')}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(currentSubscription?.status || 'inactive')}
                    {(currentSubscription?.status || 'inactive').charAt(0).toUpperCase() + 
                     (currentSubscription?.status || 'inactive').slice(1)}
                  </div>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-lg">{currentPlanFrontend?.name} Plan</h3>
                  <p className="text-2xl font-bold">£{currentSubscription?.amount || 0}/month</p>
                  <p className="text-sm text-muted-foreground">
                    Next billing: {currentSubscription?.next_billing_date 
                      ? new Date(currentSubscription.next_billing_date).toLocaleDateString() 
                      : 'N/A'
                    }
                  </p>
                  {currentSubscription?.trial_ends_at && (
                    <p className="text-sm text-blue-600 mt-1">
                      Trial ends: {new Date(currentSubscription.trial_ends_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Subscription Period</h4>
                  <p className="text-sm">
                    {currentSubscription?.start_date 
                      ? new Date(currentSubscription.start_date).toLocaleDateString() 
                      : 'N/A'
                    } - {currentSubscription?.end_date 
                      ? new Date(currentSubscription.end_date).toLocaleDateString() 
                      : 'N/A'
                    }
                  </p>
                  <div className="mt-2">
                    <h4 className="font-medium mb-2">Payment Method</h4>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">
                        Card ending in 1234
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsUpgradeDialogOpen(true)}>
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    Upgrade
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsDowngradeDialogOpen(true)}>
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                    Downgrade
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsCancelDialogOpen(true)}>
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
                <div className="text-2xl font-bold">{currentUsage.drivers}</div>
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
                    value={getUsagePercentage(currentUsage.drivers || 0, currentPlanFrontend?.limits.drivers || 0)} 
                    className="mt-2" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentPlanFrontend?.limits.drivers === -1 ? 'Unlimited' : `${currentPlanFrontend?.limits.drivers} limit`}
                  </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentUsage.vehicles}</div>
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
                    value={getUsagePercentage(currentUsage.vehicles || 0, currentPlanFrontend?.limits.vehicles || 0)} 
                    className="mt-2" 
                  />
                <p className="text-xs text-muted-foreground mt-1">
                  {currentPlanFrontend?.limits.vehicles === -1 ? 'Unlimited' : `${currentPlanFrontend?.limits.vehicles} limit`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentUsage.storage}GB</div>
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
                  value={getUsagePercentage(currentUsage.storage || 0, currentPlanFrontend?.limits.storage || 0)} 
                  className="mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {currentPlanFrontend?.limits.storage}GB limit
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentUsage.api_calls.toLocaleString()}</div>
                <div className="flex items-center gap-1 mt-1">
                  {getUsageTrend('api_calls') > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {Math.abs(getUsageTrend('api_calls')).toFixed(1)}% from last week
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(currentUsage.api_calls || 0, currentPlanFrontend?.limits.api_calls || 0)} 
                  className="mt-2" 
                />
                                  <p className="text-xs text-muted-foreground mt-1">
                    {currentPlanFrontend?.limits.api_calls.toLocaleString()} limit
                  </p>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {currentUsage.drivers > (currentPlanFrontend?.limits.drivers || 0) * 0.8 && (
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
                          <div className="font-medium">£{invoice.amount}</div>
                          {invoice.tax_amount && (
                            <div className="text-xs text-muted-foreground">
                              Tax: £{invoice.tax_amount}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{invoice.payment_method}</TableCell>
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
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">£{plan.price}<span className="text-sm font-normal text-muted-foreground">/{plan.billing_cycle === 'monthly' ? 'month' : 'year'}</span></div>
                  {plan.billing_cycle === 'yearly' && (
                                          <p className="text-sm text-muted-foreground">£{Math.round(plan.price / 12)}/month when billed yearly</p>
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
                      <span>{plan.limits.api_calls.toLocaleString()}/month</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    variant={plan.id === currentSubscription?.plan_id ? "outline" : "default"}
                    disabled={plan.id === currentSubscription?.plan_id}
                    onClick={() => {
                      if (plan.id !== currentSubscription?.plan_id) {
                        setSelectedPlan(plan.id);
                        setIsUpgradeDialogOpen(true);
                      }
                    }}
                  >
                    {plan.id === currentSubscription?.plan_id ? 'Current Plan' : 'Select Plan'}
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
                        <span>{currentUsage.drivers}/{currentPlanFrontend?.limits.drivers === -1 ? '∞' : currentPlanFrontend?.limits.drivers}</span>
                      </div>
                      <Progress value={getUsagePercentage(currentUsage.drivers || 0, currentPlanFrontend?.limits.drivers || 0)} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Vehicles</span>
                        <span>{currentUsage.vehicles}/{currentPlanFrontend?.limits.vehicles === -1 ? '∞' : currentPlanFrontend?.limits.vehicles}</span>
                      </div>
                      <Progress value={getUsagePercentage(currentUsage.vehicles || 0, currentPlanFrontend?.limits.vehicles || 0)} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage</span>
                        <span>{currentUsage.storage}GB/{currentPlanFrontend?.limits.storage}GB</span>
                      </div>
                      <Progress value={getUsagePercentage(currentUsage.storage || 0, currentPlanFrontend?.limits.storage || 0)} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>API Calls</span>
                                                 <span>{currentUsage.api_calls.toLocaleString()}/{currentPlanFrontend?.limits.api_calls.toLocaleString()}</span>
                      </div>
                      <Progress value={getUsagePercentage(currentUsage.api_calls || 0, currentPlanFrontend?.limits.api_calls || 0)} />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Usage Recommendations</h3>
                  <div className="space-y-3">
                    {(currentUsage.drivers || 0) > (currentPlanFrontend?.limits.drivers || 0) * 0.8 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Approaching driver limit</span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">Consider upgrading to add more drivers</p>
                      </div>
                    )}
                    {(currentUsage.vehicles || 0) > (currentPlanFrontend?.limits.vehicles || 0) * 0.8 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Approaching vehicle limit</span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">Consider upgrading to add more vehicles</p>
                      </div>
                    )}
                    {(currentUsage.storage || 0) > (currentPlanFrontend?.limits.storage || 0) * 0.8 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Approaching storage limit</span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">Consider upgrading for more storage</p>
                      </div>
                    )}
                    {(currentUsage.api_calls || 0) > (currentPlanFrontend?.limits.api_calls || 0) * 0.8 && (
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
                    <Label htmlFor="auto-renew" className="text-sm font-medium">Auto-renew</Label>
                    <p className="text-xs text-muted-foreground">Automatically renew your subscription</p>
                  </div>
                  <Switch
                    id="auto-renew"
                    checked={autoRenew}
                    onCheckedChange={handleToggleAutoRenew}
                    disabled={updateSubscription.isPending}
                  />
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
                          Card ending in 1234
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires 12/25
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
                      {plan.name} - £{plan.price}/{plan.billing_cycle === 'monthly' ? 'month' : 'year'}
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
            <Button onClick={handleUpgrade} disabled={!selectedPlan || updateSubscription.isPending}>
              {updateSubscription.isPending ? 'Upgrading...' : 'Upgrade Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Downgrade Dialog */}
      <Dialog open={isDowngradeDialogOpen} onOpenChange={setIsDowngradeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Downgrade Subscription</DialogTitle>
            <DialogDescription>
              Choose a lower-tier plan. Changes will take effect at the end of your current billing period.
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
                      {plan.name} - £{plan.price}/{plan.billing_cycle === 'monthly' ? 'month' : 'year'}
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
            <Button variant="outline" onClick={() => setIsDowngradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDowngrade} disabled={!selectedPlan || updateSubscription.isPending}>
              {updateSubscription.isPending ? 'Downgrading...' : 'Downgrade Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for cancellation (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Please let us know why you're cancelling..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
              />
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your subscription will remain active until the end of your current billing period. 
                You can reactivate at any time.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Subscription
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancel} 
              disabled={cancelSubscription.isPending}
            >
              {cancelSubscription.isPending ? 'Cancelling...' : 'Cancel Subscription'}
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
                      Card ending in 1234
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires 12/25
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