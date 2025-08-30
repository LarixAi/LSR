import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useStripeCustomerPortal, useNoSubscriptionDialog } from '@/hooks/useStripeCustomerPortal';
import { NoSubscriptionDialog } from '@/components/subscription/NoSubscriptionDialog';
import StandardPageLayout, { 
  MetricCard, 
  NavigationTab, 
  ActionButton, 
  FilterOption,
  TableColumn 
} from '@/components/layout/StandardPageLayout';
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
  Activity,
  FileText,
  Edit3,
  GripVertical,
  Shield,
  Car,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL - NO CONDITIONAL HOOKS
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
  const stripeCheckout = useStripeCheckout();
  
  // Dialog management
  const noSubscriptionDialog = useNoSubscriptionDialog();
  const stripeCustomerPortal = useStripeCustomerPortal(() => {
    noSubscriptionDialog.openDialog(() => setIsUpgradeDialogOpen(true));
  });
  
  // State for dialogs and form data
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isDowngradeDialogOpen, setIsDowngradeDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isInvoiceViewOpen, setIsInvoiceViewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<BackendBillingHistory | null>(null);
  const [autoRenew, setAutoRenew] = useState(currentSubscription?.auto_renew ?? true);
  const [showYearlyPlans, setShowYearlyPlans] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  
  // StandardPageLayout state
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState('all');

  // Transform backend data to frontend format
  const subscriptionPlans = backendPlans.map(transformPlan);
  
  // Get current usage from usage data
  const currentUsage = usageData[0] || {
    drivers: 0,
    vehicles: 0,
    storage: 0,
    api_calls: 0
  };

  // Get only monthly plans as base (to avoid duplication)
  const monthlyPlans = subscriptionPlans.filter(plan => plan.billing_cycle === 'monthly');
  
  // Fallback: if no monthly plans found, use all plans (for backward compatibility)
  const plansToUse = monthlyPlans.length > 0 ? monthlyPlans : subscriptionPlans;
  
  // Create both monthly and yearly versions of plans with savings calculations
  const createPlanVariants = (plans: BackendSubscriptionPlan[]) => {
    const planVariants: (BackendSubscriptionPlan & { savings?: number; monthlyEquivalent?: number })[] = [];
    
    plans.forEach(plan => {
      // Monthly version
      planVariants.push({
        ...plan,
        billing_cycle: 'monthly' as const,
        savings: 0,
        monthlyEquivalent: plan.price
      });
      
      // Yearly version (17% discount)
      const yearlyPrice = Math.round(plan.price * 12 * 0.83); // 17% discount
      const monthlyEquivalent = Math.round(yearlyPrice / 12);
      const savings = (plan.price * 12) - yearlyPrice;
      
      planVariants.push({
        ...plan,
        price: yearlyPrice,
        billing_cycle: 'yearly' as const,
        savings: savings,
        monthlyEquivalent: monthlyEquivalent
      });
    });
    
    return planVariants;
  };

  // Create all plan variants and filter based on selection
  const allPlanVariants = createPlanVariants(plansToUse);
  const plansToShow = allPlanVariants.filter(plan => plan.billing_cycle === (showYearlyPlans ? 'yearly' : 'monthly'));
  
  const currentPlanFrontend = currentSubscription ? 
    allPlanVariants.find(plan => plan.id === currentSubscription.plan_id && plan.billing_cycle === (showYearlyPlans ? 'yearly' : 'monthly')) :
    allPlanVariants.find(plan => plan.id === 'professional' && plan.billing_cycle === (showYearlyPlans ? 'yearly' : 'monthly'));

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
    if (selectedPlan) {
      try {
        console.log('Starting upgrade process:', { selectedPlan, showYearlyPlans, currentSubscription });
        
        // Always use Stripe checkout for new subscriptions or plan changes
        console.log('Creating Stripe checkout session for plan:', selectedPlan);
        const result = await stripeCheckout.mutateAsync({
          planId: selectedPlan,
          isAnnual: showYearlyPlans
        });
        console.log('Stripe checkout result:', result);
        
        setIsUpgradeDialogOpen(false);
        setSelectedPlan(null);
      } catch (error) {
        console.error('Failed to upgrade subscription:', error);
        toast.error('Failed to start payment process. Please try again.');
      }
    } else {
      toast.error('Please select a plan first.');
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

  const handleViewInvoice = (invoice: BackendBillingHistory) => {
    setSelectedInvoice(invoice);
    setIsInvoiceViewOpen(true);
  };

  const handleDownloadInvoice = async (invoice: BackendBillingHistory) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Generating PDF invoice...');

      // Create a temporary div to render the invoice
      const invoiceContainer = document.createElement('div');
      invoiceContainer.style.position = 'absolute';
      invoiceContainer.style.left = '-9999px';
      invoiceContainer.style.top = '0';
      invoiceContainer.style.width = '800px';
      invoiceContainer.style.backgroundColor = 'white';
      invoiceContainer.style.padding = '40px';
      invoiceContainer.style.fontFamily = 'Helvetica, Arial, sans-serif';
      invoiceContainer.style.color = '#000000';
      invoiceContainer.style.lineHeight = '1.5';
      
      // Generate invoice HTML content with improved styling
      invoiceContainer.innerHTML = `
        <div style="margin-bottom: 40px; border-bottom: 3px solid #000000; padding-bottom: 25px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 15px;">
                <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #374151, #111827); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  🚛
                </div>
                <div>
                  <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px 0; color: #000000; font-family: 'Helvetica', Arial, sans-serif;">Logistics Solution Resources</h1>
                  <p style="font-size: 16px; color: #4B5563; margin: 0 0 20px 0; font-weight: 500;">Transport Management System</p>
                </div>
              </div>
              <div style="font-size: 14px; color: #4B5563; line-height: 1.6; font-weight: 400;">
                <p style="margin: 3px 0; font-weight: 500;">123 Transport Way, Business District</p>
                <p style="margin: 3px 0;">London, UK SW1A 1AA</p>
                <p style="margin: 3px 0;">Phone: +44 20 7946 0958</p>
                <p style="margin: 3px 0;">Email: billing@logistics-solution.com</p>
              </div>
            </div>
            <div style="text-align: right;">
              <h2 style="font-size: 36px; font-weight: 700; margin: 0 0 8px 0; color: #000000; font-family: 'Helvetica', Arial, sans-serif;">INVOICE</h2>
              <p style="font-size: 16px; color: #4B5563; margin: 0 0 20px 0; font-weight: 500;">Professional Transport Services</p>
              <div style="font-size: 14px; color: #4B5563; line-height: 1.8; font-weight: 400;">
                <p style="margin: 4px 0;"><strong style="font-weight: 600;">Invoice #:</strong> ${invoice.id.slice(0, 8).toUpperCase()}</p>
                <p style="margin: 4px 0;"><strong style="font-weight: 600;">Date:</strong> ${new Date(invoice.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 4px 0;"><strong style="font-weight: 600;">Due Date:</strong> ${new Date(invoice.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div style="margin-top: 15px;">
                <span style="display: inline-block; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; background-color: ${invoice.status === 'paid' ? '#10B981' : invoice.status === 'pending' ? '#F59E0B' : '#EF4444'}; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 35px;">
          <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #000000; font-family: 'Helvetica', Arial, sans-serif;">Bill To:</h3>
          <div style="background-color: #F8FAFC; padding: 20px; border-radius: 10px; border: 2px solid #E2E8F0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <p style="font-weight: 600; font-size: 16px; margin: 3px 0; color: #000000;">${profile?.email || 'Transport Manager Admin'}</p>
            <p style="font-size: 14px; margin: 3px 0; color: #4B5563;">Transport Company</p>
            <p style="font-size: 14px; margin: 3px 0; color: #4B5563;">123 Business Street</p>
            <p style="font-size: 14px; margin: 3px 0; color: #4B5563;">London, UK SW1A 1AA</p>
          </div>
        </div>

        <div style="margin-bottom: 35px;">
          <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #000000; font-family: 'Helvetica', Arial, sans-serif;">Services:</h3>
          <div style="background-color: #F8FAFC; padding: 20px; border-radius: 10px; border: 2px solid #E2E8F0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <div>
                <p style="font-weight: 600; font-size: 16px; margin: 0 0 5px 0; color: #000000;">${currentPlanFrontend?.name || 'Professional Plan'}</p>
                <p style="font-size: 14px; color: #4B5563; margin: 0;">Transport Management System Subscription</p>
              </div>
              <div style="text-align: right;">
                <p style="font-weight: 600; font-size: 16px; margin: 0; color: #000000;">£${invoice.amount}</p>
                <p style="font-size: 12px; color: #4B5563; margin: 0;">${showYearlyPlans ? 'Yearly' : 'Monthly'} billing</p>
              </div>
            </div>
            <div style="border-top: 1px solid #E2E8F0; padding-top: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <p style="font-weight: 600; font-size: 16px; margin: 0; color: #000000;">Total Amount:</p>
                <p style="font-weight: 700; font-size: 18px; margin: 0; color: #000000;">£${invoice.amount}</p>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #E2E8F0;">
          <div style="text-align: center; color: #4B5563; font-size: 14px;">
            <p style="margin: 5px 0; font-weight: 500;">Thank you for choosing Logistics Solution Resources</p>
            <p style="margin: 5px 0;">For any questions, please contact our support team</p>
            <p style="margin: 5px 0;">support@logistics-solution.com | +44 20 7946 0958</p>
          </div>
        </div>
      `;

      document.body.appendChild(invoiceContainer);

      // Convert to canvas and then to PDF
      const canvas = await html2canvas(invoiceContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(invoiceContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(`invoice-${invoice.id.slice(0, 8)}.pdf`);

      toast.dismiss(loadingToast);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  // StandardPageLayout Configuration
  const pageTitle = "Subscription Management";
  const pageDescription = "Manage your subscription plan, billing, and usage";

  const primaryAction: ActionButton = {
    label: "Upgrade Plan",
    onClick: () => setIsUpgradeDialogOpen(true),
    icon: <ArrowUpRight className="w-4 h-4" />
  };

  const secondaryActions: ActionButton[] = [
    {
      label: "Export Data",
      onClick: handleExportData,
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
      title: "Current Plan",
      value: currentPlanFrontend?.name || "Professional",
      subtitle: "Active subscription",
      icon: <Shield className="w-5 h-5" />,
      bgColor: "bg-blue-100",
      color: "text-blue-600"
    },
    {
      title: "Monthly Cost",
      value: `£${currentPlanFrontend?.price || 0}`,
      subtitle: showYearlyPlans ? "Yearly billing" : "Monthly billing",
      icon: <DollarSign className="w-5 h-5" />,
      bgColor: "bg-green-100",
      color: "text-green-600"
    },
    {
      title: "Drivers Used",
      value: `${currentUsage.drivers} / ${currentPlanFrontend?.limits?.drivers || '∞'}`,
      subtitle: `${getUsagePercentage(currentUsage.drivers, currentPlanFrontend?.limits?.drivers || -1).toFixed(1)}% used`,
      icon: <Users className="w-5 h-5" />,
      bgColor: "bg-purple-100",
      color: "text-purple-600"
    },
    {
      title: "Vehicles Used",
      value: `${currentUsage.vehicles} / ${currentPlanFrontend?.limits?.vehicles || '∞'}`,
      subtitle: `${getUsagePercentage(currentUsage.vehicles, currentPlanFrontend?.limits?.vehicles || -1).toFixed(1)}% used`,
      icon: <Truck className="w-5 h-5" />,
      bgColor: "bg-orange-100",
      color: "text-orange-600"
    }
  ];

  const navigationTabs: NavigationTab[] = [
    { value: "overview", label: "Overview" },
    { value: "plans", label: "Plans & Pricing" },
    { value: "billing", label: "Billing History" },
    { value: "usage", label: "Usage Analytics" }
  ];

  const searchConfig = {
    placeholder: "Search billing history, invoices, or usage data...",
    value: searchTerm,
    onChange: setSearchTerm,
    showSearch: true
  };

  const filters: FilterOption[] = [
    {
      label: "Status",
      value: viewFilter,
      options: [
        { value: "all", label: "All Invoices" },
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" }
      ],
      placeholder: "Filter by status"
    }
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "Status") setViewFilter(value);
  };

  // Table data for billing history
  const billingTableData = billingHistory.map(invoice => ({
    id: invoice.id,
    date: new Date(invoice.date).toLocaleDateString(),
    amount: `£${invoice.amount}`,
    status: invoice.status,
    plan: currentPlanFrontend?.name || 'Professional',
    invoiceNumber: invoice.id.slice(0, 8).toUpperCase()
  }));

  const billingColumns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { key: 'date', label: 'Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'plan', label: 'Plan' },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: any) => (
        <Badge className={getStatusColor(item.status)}>
          {item.status}
        </Badge>
      )
    }
  ];

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
      showTable={activeTab === 'billing'}
      tableData={billingTableData}
      tableColumns={billingColumns}
    >
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Plan Details */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div>
                   <h3 className="font-semibold mb-2">{currentPlanFrontend?.name || 'Professional'}</h3>
                   <p className="text-gray-600 mb-4">Professional transport management solution</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Billing Cycle:</span>
                      <span className="text-sm font-medium">{showYearlyPlans ? 'Yearly' : 'Monthly'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Auto Renew:</span>
                      <Switch checked={autoRenew} onCheckedChange={handleToggleAutoRenew} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Next Billing:</span>
                      <span className="text-sm font-medium">
                        {currentSubscription?.next_billing_date 
                          ? new Date(currentSubscription.next_billing_date).toLocaleDateString()
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Usage Summary</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Drivers</span>
                        <span>{currentUsage.drivers} / {currentPlanFrontend?.limits?.drivers || '∞'}</span>
                      </div>
                      <Progress value={getUsagePercentage(currentUsage.drivers, currentPlanFrontend?.limits?.drivers || -1)} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Vehicles</span>
                        <span>{currentUsage.vehicles} / {currentPlanFrontend?.limits?.vehicles || '∞'}</span>
                      </div>
                      <Progress value={getUsagePercentage(currentUsage.vehicles, currentPlanFrontend?.limits?.vehicles || -1)} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage</span>
                        <span>{currentUsage.storage}GB / {currentPlanFrontend?.limits?.storage || '∞'}GB</span>
                      </div>
                      <Progress value={getUsagePercentage(currentUsage.storage, currentPlanFrontend?.limits?.storage || -1)} />
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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => setIsUpgradeDialogOpen(true)} className="w-full">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
                <Button variant="outline" onClick={() => stripeCustomerPortal.mutate()} className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Billing
                </Button>
                <Button variant="outline" onClick={handleExportData} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!showYearlyPlans ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>Monthly</span>
            <Switch checked={showYearlyPlans} onCheckedChange={setShowYearlyPlans} />
            <span className={`text-sm ${showYearlyPlans ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Yearly <Badge variant="secondary" className="ml-1">Save 17%</Badge>
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plansToShow.map((plan) => (
              <Card key={plan.id} className={`relative ${currentPlanFrontend?.id === plan.id ? 'ring-2 ring-blue-500' : ''}`}>
                {currentPlanFrontend?.id === plan.id && (
                  <Badge className="absolute -top-2 -right-2 bg-blue-600">Current</Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>Professional transport management solution</CardDescription>
                  <div className="text-3xl font-bold">£{plan.price}</div>
                  <div className="text-sm text-gray-500">
                    per {plan.billing_cycle === 'yearly' ? 'year' : 'month'}
                    {plan.savings && plan.savings > 0 && (
                      <span className="ml-2 text-green-600">Save £{plan.savings}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{plan.limits?.drivers === -1 ? 'Unlimited' : plan.limits?.drivers} Drivers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{plan.limits?.vehicles === -1 ? 'Unlimited' : plan.limits?.vehicles} Vehicles</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{plan.limits?.storage === -1 ? 'Unlimited' : plan.limits?.storage}GB Storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{plan.limits?.api_calls === -1 ? 'Unlimited' : plan.limits?.api_calls} API Calls</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={currentPlanFrontend?.id === plan.id ? "outline" : "default"}
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      setIsUpgradeDialogOpen(true);
                    }}
                  >
                    {currentPlanFrontend?.id === plan.id ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'usage' && (
        <div className="space-y-6">
          {/* Usage Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Drivers</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{currentUsage.drivers}</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vehicles</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{currentUsage.vehicles}</span>
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{currentUsage.storage}GB</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Drivers</span>
                      <span>{currentUsage.drivers} / {currentPlanFrontend?.limits?.drivers || '∞'}</span>
                    </div>
                    <Progress value={getUsagePercentage(currentUsage.drivers, currentPlanFrontend?.limits?.drivers || -1)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Vehicles</span>
                      <span>{currentUsage.vehicles} / {currentPlanFrontend?.limits?.vehicles || '∞'}</span>
                    </div>
                    <Progress value={getUsagePercentage(currentUsage.vehicles, currentPlanFrontend?.limits?.vehicles || -1)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage</span>
                      <span>{currentUsage.storage}GB / {currentPlanFrontend?.limits?.storage || '∞'}GB</span>
                    </div>
                    <Progress value={getUsagePercentage(currentUsage.storage, currentPlanFrontend?.limits?.storage || -1)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <NoSubscriptionDialog 
        isOpen={noSubscriptionDialog.isDialogOpen}
        onClose={noSubscriptionDialog.closeDialog}
        onUpgrade={() => setIsUpgradeDialogOpen(true)}
      />
    </StandardPageLayout>
  );
}