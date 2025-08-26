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
  const [isInvoiceViewOpen, setIsInvoiceViewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<BackendBillingHistory | null>(null);
  const [autoRenew, setAutoRenew] = useState(currentSubscription?.auto_renew ?? true);
  const [showYearlyPlans, setShowYearlyPlans] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

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
             <p style="font-size: 14px; margin: 3px 0; color: #4B5563;">${profile?.email || 'transport@nationalbusgroup.co.uk'}</p>
             <p style="font-size: 14px; margin: 3px 0; color: #4B5563; font-family: monospace;">Subscription: ${invoice.subscription_id}</p>
           </div>
         </div>

                 <div style="margin-bottom: 35px;">
           <table style="width: 100%; border-collapse: collapse; border: 2px solid #374151; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
             <thead>
               <tr style="background-color: #374151;">
                 <th style="padding: 16px; text-align: left; font-weight: 600; font-size: 14px; color: white; font-family: 'Helvetica', Arial, sans-serif;">Description</th>
                 <th style="padding: 16px; text-align: right; font-weight: 600; font-size: 14px; color: white; font-family: 'Helvetica', Arial, sans-serif;">Quantity</th>
                 <th style="padding: 16px; text-align: right; font-weight: 600; font-size: 14px; color: white; font-family: 'Helvetica', Arial, sans-serif;">Unit Price</th>
                 <th style="padding: 16px; text-align: right; font-weight: 600; font-size: 14px; color: white; font-family: 'Helvetica', Arial, sans-serif;">Amount</th>
               </tr>
             </thead>
             <tbody>
               <tr style="background-color: white;">
                 <td style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
                   <div style="font-weight: 600; font-size: 14px; color: #000000; margin-bottom: 4px;">${invoice.description}</div>
                   <div style="color: #6B7280; font-size: 12px;">Transport Management System Subscription</div>
                 </td>
                 <td style="padding: 16px; text-align: right; border-bottom: 1px solid #E5E7EB; font-size: 14px; font-weight: 500; color: #000000;">1</td>
                 <td style="padding: 16px; text-align: right; border-bottom: 1px solid #E5E7EB; font-size: 14px; font-weight: 500; color: #000000;">£${(invoice.amount - invoice.tax_amount + invoice.discount_amount).toFixed(2)}</td>
                 <td style="padding: 16px; text-align: right; border-bottom: 1px solid #E5E7EB; font-size: 14px; font-weight: 600; color: #000000;">£${(invoice.amount - invoice.tax_amount + invoice.discount_amount).toFixed(2)}</td>
               </tr>
             </tbody>
           </table>
         </div>

                 <div style="text-align: right; margin-bottom: 35px;">
           <table style="margin-left: auto; width: 350px; background-color: #F8FAFC; border-radius: 10px; padding: 20px; border: 2px solid #E2E8F0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
             <tr>
               <td style="padding: 8px 0; font-size: 14px; color: #4B5563; font-weight: 500;">Subtotal:</td>
               <td style="padding: 8px 0; font-size: 14px; color: #000000; font-weight: 600; text-align: right;">£${(invoice.amount - invoice.tax_amount + invoice.discount_amount).toFixed(2)}</td>
             </tr>
             ${invoice.discount_amount > 0 ? `<tr><td style="padding: 8px 0; font-size: 14px; color: #4B5563; font-weight: 500;">Discount:</td><td style="padding: 8px 0; font-size: 14px; color: #059669; font-weight: 600; text-align: right;">-£${invoice.discount_amount.toFixed(2)}</td></tr>` : ''}
             ${invoice.tax_amount > 0 ? `<tr><td style="padding: 8px 0; font-size: 14px; color: #4B5563; font-weight: 500;">VAT (20%):</td><td style="padding: 8px 0; font-size: 14px; color: #000000; font-weight: 600; text-align: right;">£${invoice.tax_amount.toFixed(2)}</td></tr>` : ''}
             <tr style="border-top: 2px solid #374151;">
               <td style="padding: 12px 0 8px 0; font-weight: 700; font-size: 18px; color: #000000;">Total:</td>
               <td style="padding: 12px 0 8px 0; font-weight: 700; font-size: 18px; color: #000000; text-align: right;">£${invoice.amount.toFixed(2)}</td>
             </tr>
           </table>
         </div>

                 <div style="background-color: #F8FAFC; padding: 25px; border-radius: 12px; border: 2px solid #E2E8F0; margin-bottom: 35px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
           <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 18px; color: #000000; font-family: 'Helvetica', Arial, sans-serif;">Payment Information</h3>
           <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
             <div>
               <p style="margin: 3px 0; font-size: 14px; color: #4B5563; font-weight: 500;"><strong style="color: #374151;">Payment Method:</strong></p>
               <p style="margin: 3px 0; font-size: 14px; color: #000000; font-weight: 500;">💳 ${invoice.payment_method}</p>
             </div>
             <div>
               <p style="margin: 3px 0; font-size: 14px; color: #4B5563; font-weight: 500;"><strong style="color: #374151;">Payment Date:</strong></p>
               <p style="margin: 3px 0; font-size: 14px; color: #000000; font-weight: 500;">${new Date(invoice.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
             </div>
           </div>
         </div>

                 <div style="border-top: 3px solid #374151; padding-top: 25px;">
           <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 25px;">
             <div>
               <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #000000; font-family: 'Helvetica', Arial, sans-serif;">Terms & Conditions</h4>
               <p style="font-size: 13px; color: #4B5563; line-height: 1.5; margin: 0; font-weight: 400;">Payment is due upon receipt. Late payments may incur additional charges.</p>
             </div>
             <div>
               <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #000000; font-family: 'Helvetica', Arial, sans-serif;">Thank You</h4>
               <p style="font-size: 13px; color: #4B5563; line-height: 1.5; margin: 0; font-weight: 400;">Thank you for choosing Logistics Solution Resources for your transport management needs.</p>
             </div>
             <div>
               <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #000000; font-family: 'Helvetica', Arial, sans-serif;">Contact</h4>
               <p style="font-size: 13px; color: #4B5563; line-height: 1.5; margin: 0; font-weight: 400;">For questions about this invoice, please contact our billing department.</p>
             </div>
           </div>
         </div>
      `;

      // Add the container to the DOM temporarily
      document.body.appendChild(invoiceContainer);

             // Convert to canvas with higher quality settings
       const canvas = await html2canvas(invoiceContainer, {
         scale: 3, // Increased scale for better quality
         useCORS: true,
         allowTaint: true,
         backgroundColor: '#ffffff',
         width: 1200, // Increased width for better resolution
         height: invoiceContainer.scrollHeight,
         logging: false,
         imageTimeout: 0,
         removeContainer: true,
         foreignObjectRendering: false
       });

      // Remove the temporary container
      document.body.removeChild(invoiceContainer);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

      // Add security features
      pdf.setProperties({
        title: `Invoice ${invoice.id.slice(0, 8).toUpperCase()}`,
        subject: 'Transport Management System Invoice',
        author: 'Logistics Solution Resources',
        creator: 'Logistics Solution Resources'
      });

      // Add watermark for security
      pdf.setTextColor(200, 200, 200);
      pdf.setFontSize(12);
      pdf.text('ORIGINAL INVOICE', pdfWidth / 2, pdfHeight - 10, { align: 'center' });

      // Save the PDF
      const filename = `Invoice-${invoice.id.slice(0, 8).toUpperCase()}-${new Date(invoice.date).toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('PDF invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF invoice:', error);
      toast.error('Failed to generate PDF invoice. Please try again.');
    }
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

      {/* Free Trial Information */}
      {!currentSubscription && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-green-600" />
              Free Trial Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">30-Day Free Trial Available</p>
                  <p className="text-sm text-green-700">Start with our Starter plan and explore all features risk-free</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800">Trial Limited to Starter Plan</p>
                  <p className="text-sm text-blue-700">Free trial is only available for the Starter plan. Professional and Enterprise plans require immediate payment.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ArrowUpRight className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-purple-800">Easy Upgrade Path</p>
                  <p className="text-sm text-purple-700">Upgrade to Professional or Enterprise anytime during or after your trial period</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Manage your subscription, billing, and usage</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsUpgradeDialogOpen(true)}
            disabled={stripeCheckout.isPending || stripeCustomerPortal.isPending}
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            {stripeCheckout.isPending || stripeCustomerPortal.isPending ? 'Loading...' : (currentSubscription ? 'Upgrade Plan' : 'Choose Plan')}
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          {currentSubscription ? (
            <Button 
              variant="outline" 
              onClick={() => stripeCustomerPortal.mutate()}
              disabled={stripeCustomerPortal.isPending}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {stripeCustomerPortal.isPending ? 'Loading...' : 'Payment Methods'}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => noSubscriptionDialog.openDialog(() => setIsUpgradeDialogOpen(true))}
              disabled={stripeCustomerPortal.isPending}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Methods
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="animate-fade-in-up stagger-1 hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Cost</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  £{currentSubscription?.amount || 79}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 animate-bounce-subtle" />
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up stagger-2 hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Billing</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {currentSubscription?.next_billing_date 
                    ? new Date(currentSubscription.next_billing_date).toLocaleDateString()
                    : new Date(currentSubscription?.start_date || '').toLocaleDateString() // Fallback to start date if next billing is not set
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500 animate-bounce-subtle" />
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up stagger-3 hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usage Trend</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500 animate-pulse" />
                  <p className="text-2xl font-bold text-green-600">+12%</p>
                </div>
              </div>
              <Activity className="h-8 w-8 text-green-500 animate-bounce-subtle" />
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up stagger-4 hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Auto-Renew</p>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={autoRenew} 
                    onCheckedChange={handleToggleAutoRenew}
                    className="data-[state=checked]:bg-purple-600"
                  />
                  <span className="text-sm">{autoRenew ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
              <RefreshCw className="h-8 w-8 text-purple-500 animate-rotate-slow" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 gap-1 h-auto p-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="billing" className="text-xs">Billing</TabsTrigger>
          <TabsTrigger value="plans" className="text-xs">Plans</TabsTrigger>
          <TabsTrigger value="vehicle-checks" className="text-xs">Vehicle Checks</TabsTrigger>
          <TabsTrigger value="usage" className="text-xs">Usage</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Current Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Subscription</span>
                {currentSubscription ? (
                  <Badge className={getStatusColor(currentSubscription.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(currentSubscription.status)}
                      {currentSubscription.status.charAt(0).toUpperCase() + 
                       currentSubscription.status.slice(1)}
                    </div>
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      No Active Subscription
                    </div>
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentSubscription ? (
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => stripeCustomerPortal.mutateAsync()}
                    disabled={stripeCustomerPortal.isPending}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    {stripeCustomerPortal.isPending ? 'Loading...' : 'Manage Subscription'}
                  </Button>
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
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    You don't have an active subscription yet. Choose a plan to get started with our premium features.
                  </p>
                  <Button onClick={() => setIsUpgradeDialogOpen(true)}>
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Choose a Plan
                  </Button>
                </div>
              )}
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

        <TabsContent value="billing" className="space-y-4">
          {/* Billing Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">
                      £{billingHistory.reduce((sum, invoice) => sum + invoice.amount, 0).toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">
                      £{billingHistory
                        .filter(invoice => {
                          const invoiceDate = new Date(invoice.date);
                          const now = new Date();
                          return invoiceDate.getMonth() === now.getMonth() && 
                                 invoiceDate.getFullYear() === now.getFullYear();
                        })
                        .reduce((sum, invoice) => sum + invoice.amount, 0)
                        .toFixed(2)}
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
                    <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                    <p className="text-2xl font-bold">{billingHistory.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Success Rate</p>
                    <p className="text-2xl font-bold">
                      {billingHistory.length > 0 
                        ? Math.round((billingHistory.filter(invoice => invoice.status === 'paid').length / billingHistory.length) * 100)
                        : 0}%
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Billing History Table */}
          <Card className="animate-fade-in-up stagger-2 mb-4">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Billing History
                  </CardTitle>
                  <p className="text-purple-700">
                    View and manage your payment history and invoices
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExportData}
                    className="hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {billingHistory.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No billing history yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Your billing history will appear here once you have active subscriptions or payments.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Filter and Search */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input 
                        placeholder="Search invoices..." 
                        className="max-w-sm"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Time Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="this-month">This Month</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="this-year">This Year</SelectItem>
                        <SelectItem value="last-year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingHistory.map((invoice, index) => (
                        <TableRow 
                          key={invoice.id} 
                          className="hover:bg-purple-50/50 transition-all duration-200 animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {new Date(invoice.date).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(invoice.date).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{invoice.description}</div>
                              {invoice.description.includes('Plan') && (
                                <div className="text-xs text-muted-foreground">
                                  Plan: {invoice.description.split(' - ')[0]}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                                                           <div className="font-medium">£{invoice.amount.toFixed(2)}</div>
                             {invoice.tax_amount > 0 && (
                               <div className="text-xs text-muted-foreground">
                                 Tax: £{invoice.tax_amount.toFixed(2)}
                               </div>
                             )}
                             {invoice.discount_amount > 0 && (
                               <div className="text-xs text-green-600">
                                 Discount: -£{invoice.discount_amount.toFixed(2)}
                               </div>
                             )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(invoice.status)}>
                              {getStatusIcon(invoice.status)}
                              <span className="ml-1">
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{invoice.payment_method}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                                                         <div className="text-sm font-mono text-muted-foreground">
                               {`INV-${invoice.id.slice(0, 8).toUpperCase()}`}
                             </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                title="View Invoice Details"
                                onClick={() => handleViewInvoice(invoice)}
                                className="hover:bg-blue-50 hover:border-blue-300 hover:scale-105 transition-all duration-200"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                title="Download Invoice"
                                onClick={() => handleDownloadInvoice(invoice)}
                                className="hover:bg-green-50 hover:border-green-300 hover:scale-105 transition-all duration-200"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              {invoice.status === 'paid' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  title="Request Refund"
                                  className="hover:bg-orange-50 hover:border-orange-300 hover:scale-105 transition-all duration-200"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {billingHistory.length} of {billingHistory.length} invoices
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          {/* Available Plans Section */}
          <Card className="mb-4 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Available Plans
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Choose the perfect plan for your business needs
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-blue-200">
                    <span className={`text-sm font-medium transition-colors duration-200 ${!showYearlyPlans ? 'text-blue-600' : 'text-gray-500'}`}>Monthly</span>
                    <Switch 
                      checked={showYearlyPlans} 
                      onCheckedChange={setShowYearlyPlans}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <span className={`text-sm font-medium transition-colors duration-200 ${showYearlyPlans ? 'text-blue-600' : 'text-gray-500'}`}>Yearly</span>
                  </div>
                  {showYearlyPlans && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg animate-pulse">
                      <span className="font-semibold">Save 17%</span>
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {showYearlyPlans && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">£</span>
                    </div>
                    <h4 className="font-semibold text-green-800 text-lg">Yearly Savings Summary</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {plansToShow.map((plan, index) => (
                      <div 
                        key={plan.id} 
                        className="flex justify-between items-center p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <span className="text-green-700 font-medium">{plan.name}:</span>
                        <span className="font-bold text-green-800 bg-green-100 px-2 py-1 rounded-md">
                          Save £{plan.savings}/year
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {plansToShow.map((plan, index) => (
                  <Card 
                    key={`${plan.id}-${plan.billing_cycle}`} 
                    className={`relative group overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl h-fit mt-4 ${
                      plan.popular 
                        ? 'border-blue-500 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50' 
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    } animate-fade-in-up`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {plan.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg animate-bounce-subtle text-xs px-2 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    {plan.id === 'starter' && !currentSubscription && (
                      <div className="absolute -top-2 right-4 z-10">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg animate-pulse text-xs px-2 py-1">
                          <Star className="w-3 h-3 mr-1" />
                          Free Trial
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="relative z-10 pb-3 pt-6">
                      <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {plan.name}
                      </CardTitle>
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            £{plan.price}
                          </span>
                          <span className="text-sm font-normal text-gray-500">
                            /{plan.billing_cycle === 'monthly' ? 'month' : 'year'}
                          </span>
                        </div>
                        {plan.billing_cycle === 'yearly' && (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600 bg-gray-50 p-1.5 rounded-lg">
                              £{plan.monthlyEquivalent}/month when billed yearly
                            </p>
                            {plan.savings && plan.savings > 0 && (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs border-0 shadow-md">
                                  Save £{plan.savings}/year
                                </Badge>
                              </div>
                            )}
                          </div>
                        )}
                        {plan.billing_cycle === 'monthly' && (
                          <p className="text-xs text-gray-600 bg-gray-50 p-1.5 rounded-lg">
                            £{plan.price}/month
                          </p>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="relative z-10 space-y-3">
                      <div className="space-y-2">
                        {plan.features.slice(0, 6).map((feature, featureIndex) => (
                          <div 
                            key={featureIndex} 
                            className="flex items-center gap-2 group/feature hover:bg-blue-50 p-1.5 rounded-lg transition-all duration-200"
                          >
                            <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-sm group-hover/feature:scale-110 transition-transform duration-200 flex-shrink-0">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                            <span className="text-xs text-gray-700 group-hover/feature:text-gray-900 transition-colors duration-200">
                              {feature}
                            </span>
                          </div>
                        ))}
                        {plan.features.length > 6 && (
                          <div className="text-xs text-gray-500 italic">
                            +{plan.features.length - 6} more features
                          </div>
                        )}
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 text-xs">Resource Limits</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                            <span className="text-xs text-gray-600">Drivers:</span>
                            <span className="font-semibold text-gray-900 text-xs">
                              {plan.limits.drivers === -1 ? 'Unlimited' : plan.limits.drivers}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                            <span className="text-xs text-gray-600">Vehicles:</span>
                            <span className="font-semibold text-gray-900 text-xs">
                              {plan.limits.vehicles === -1 ? 'Unlimited' : plan.limits.vehicles}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                            <span className="text-xs text-gray-600">Storage:</span>
                            <span className="font-semibold text-gray-900 text-xs">
                              {plan.limits.storage === -1 ? 'Unlimited' : `${plan.limits.storage}GB`}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                            <span className="text-xs text-gray-600">API Calls:</span>
                            <span className="font-semibold text-gray-900 text-xs">
                              {plan.limits.api_calls === -1 ? 'Unlimited' : `${plan.limits.api_calls.toLocaleString()}/month`}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                                             <Button 
                         onClick={() => {
                           setSelectedPlan(plan.id);
                           setIsUpgradeDialogOpen(true);
                         }}
                         className={`w-full group/button transition-all duration-300 text-sm ${
                           plan.id === currentSubscription?.plan_id
                             ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-gray-300'
                             : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                         }`}
                         disabled={plan.id === currentSubscription?.plan_id}
                       >
                         <span className="group-hover/button:scale-105 transition-transform duration-200">
                           {plan.id === currentSubscription?.plan_id 
                             ? 'Current Plan' 
                             : currentSubscription 
                               ? `Upgrade to ${plan.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'}`
                               : `Start ${plan.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'} Plan`
                           }
                         </span>
                         {plan.id !== currentSubscription?.plan_id && (
                           <ArrowRight className="w-3 h-3 ml-2 group-hover/button:translate-x-1 transition-transform duration-200" />
                         )}
                       </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <TabsContent value="vehicle-checks" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Vehicle Check Questions Features</h3>
                <p className="text-muted-foreground">Manage and customize vehicle inspection questions based on your plan</p>
              </div>
            </div>

            {/* Feature Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Feature Comparison by Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Starter Plan */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">Starter Plan</h4>
                      <Badge variant="outline">View Only</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">View default Daily Pre-Trip Inspection questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Drivers can complete vehicle checks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-muted-foreground">Edit questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-muted-foreground">Create custom question sets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-muted-foreground">Reorder questions</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Upgrade to Professional+ for full control</span>
                      </div>
                    </div>
                  </div>

                  {/* Professional Plan */}
                  <div className="border rounded-lg p-4 border-primary">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">Professional Plan</h4>
                      <Badge className="bg-primary">Full Access</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">View default Daily Pre-Trip Inspection questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Drivers can complete vehicle checks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Edit existing questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Create custom question sets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Drag-and-drop question reordering</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Customize inspection flow</span>
                      </div>
                    </div>
                  </div>

                  {/* Enterprise Plan */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">Enterprise Plan</h4>
                      <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">All Professional features</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Advanced customization options</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Priority support for questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Custom compliance standards</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">White-label options</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Plan Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Your Current Vehicle Check Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Current Plan: {currentPlanFrontend?.name}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Can Edit Questions:</span>
                        <Badge variant={currentPlanFrontend?.name === 'Starter' ? 'destructive' : 'default'}>
                          {currentPlanFrontend?.name === 'Starter' ? '❌ No' : '✅ Yes'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Can Create Question Sets:</span>
                        <Badge variant={currentPlanFrontend?.name === 'Starter' ? 'destructive' : 'default'}>
                          {currentPlanFrontend?.name === 'Starter' ? '❌ No' : '✅ Yes'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Can Reorder Questions:</span>
                        <Badge variant={currentPlanFrontend?.name === 'Starter' ? 'destructive' : 'default'}>
                          {currentPlanFrontend?.name === 'Starter' ? '❌ No' : '✅ Yes'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Access to Admin Panel:</span>
                        <Badge variant="default">✅ Yes</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Quick Actions</h4>
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => window.location.href = '/admin/smart-inspections'}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Vehicle Check Questions
                      </Button>
                      {currentPlanFrontend?.name !== 'Starter' && (
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => window.location.href = '/admin/smart-inspections'}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Questions
                        </Button>
                      )}
                      {currentPlanFrontend?.name === 'Starter' && (
                        <Button 
                          className="w-full justify-start"
                          onClick={() => setIsUpgradeDialogOpen(true)}
                        >
                          <ArrowUpRight className="w-4 h-4 mr-2" />
                          Upgrade for Full Access
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Default Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    All plans include access to the comprehensive Daily Pre-Trip Inspection with 56 safety-critical questions.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">56 comprehensive safety questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">DVSA compliance standards</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Photo and notes support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Mobile-optimized for drivers</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5" />
                    Advanced Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Professional+ plans unlock advanced customization and management features.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Drag-and-drop question reordering</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Create custom question sets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Edit question content and settings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Customize inspection flow</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
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

          <TabsContent value="settings" className="space-y-4">
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
        </TabsContent>
      </Tabs>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentSubscription ? 'Upgrade Subscription' : 'Start New Subscription'}</DialogTitle>
            <DialogDescription>
              {currentSubscription 
                ? 'You will be redirected to Stripe to complete your plan upgrade. Your new plan will take effect immediately.'
                : 'You will be redirected to Stripe to complete your payment. Starter plan includes a 30-day free trial.'
              }
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
            {currentSubscription && selectedPlan && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Upgrade Notice</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  You will be charged the difference between your current plan and the new plan. Your new plan will take effect immediately.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpgrade} 
              disabled={!selectedPlan || stripeCheckout.isPending}
            >
              {stripeCheckout.isPending ? 'Redirecting to Payment...' : (currentSubscription ? 'Upgrade & Pay' : 'Start & Pay')}
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

      {/* Invoice View Dialog */}
      <Dialog open={isInvoiceViewOpen} onOpenChange={setIsInvoiceViewOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 bg-white">
          <DialogHeader className="p-6 pb-4 border-b bg-gray-50">
            <DialogTitle className="flex items-center gap-2 text-gray-800">
              <FileText className="w-5 h-5" />
              Invoice Details
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Professional invoice view - Print or download for your records
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="bg-white">
              {/* A4 Invoice Layout */}
              <div className="p-8 bg-white border border-gray-200 shadow-sm" style={{ aspectRatio: '1.414', minHeight: '800px' }}>
                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-300">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                        <Truck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">Logistics Solution Resources</h1>
                        <p className="text-sm text-gray-600">Transport Management System</p>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <p>123 Transport Way, Business District</p>
                      <p>London, UK SW1A 1AA</p>
                      <p>Phone: +44 20 7946 0958</p>
                      <p>Email: billing@logistics-solution.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-4">
                      <h2 className="text-3xl font-bold text-gray-900 mb-1">INVOICE</h2>
                      <p className="text-sm text-gray-600">Professional Transport Services</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>Invoice #:</strong> {selectedInvoice.id.slice(0, 8).toUpperCase()}</p>
                      <p><strong>Date:</strong> {new Date(selectedInvoice.date).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                      <p><strong>Due Date:</strong> {new Date(selectedInvoice.date).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                    <div className="mt-3">
                      <Badge className={`${getStatusColor(selectedInvoice.status)} text-sm font-medium px-3 py-1`}>
                        {getStatusIcon(selectedInvoice.status)}
                        <span className="ml-1">
                          {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>

                              {/* Bill To Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                         <p className="font-medium text-gray-900">{profile?.email || 'Transport Manager Admin'}</p>
                     <p className="text-sm text-gray-600">Transport Company</p>
                    <p className="text-sm text-gray-600">{profile?.email || 'transport@nationalbusgroup.co.uk'}</p>
                    <p className="text-sm text-gray-600">Subscription: {selectedInvoice.subscription_id}</p>
                  </div>
                </div>

                {/* Invoice Items Table */}
                <div className="mb-8">
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">Description</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 border-b border-gray-300">Quantity</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 border-b border-gray-300">Unit Price</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 border-b border-gray-300">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-6 py-4 text-sm text-gray-900 border-b border-gray-200">
                            <div>
                              <p className="font-medium">{selectedInvoice.description}</p>
                              <p className="text-xs text-gray-600">Transport Management System Subscription</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right border-b border-gray-200">1</td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right border-b border-gray-200">
                            £{(selectedInvoice.amount - selectedInvoice.tax_amount + selectedInvoice.discount_amount).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right border-b border-gray-200">
                            £{(selectedInvoice.amount - selectedInvoice.tax_amount + selectedInvoice.discount_amount).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-8">
                  <div className="w-80">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">£{(selectedInvoice.amount - selectedInvoice.tax_amount + selectedInvoice.discount_amount).toFixed(2)}</span>
                      </div>
                      {selectedInvoice.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-£{selectedInvoice.discount_amount.toFixed(2)}</span>
                        </div>
                      )}
                      {selectedInvoice.tax_amount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">VAT (20%):</span>
                          <span className="text-gray-900">£{selectedInvoice.tax_amount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-300 pt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-gray-900">£{selectedInvoice.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong className="text-gray-700">Payment Method:</strong></p>
                      <div className="flex items-center gap-2 mt-1">
                        <CreditCard className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-900">{selectedInvoice.payment_method}</span>
                      </div>
                    </div>
                    <div>
                      <p><strong className="text-gray-700">Payment Date:</strong></p>
                      <p className="text-gray-900 mt-1">{new Date(selectedInvoice.date).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t-2 border-gray-300 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                      <p>Payment is due upon receipt. Late payments may incur additional charges.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Thank You</h4>
                      <p>Thank you for choosing Logistics Solution Resources for your transport management needs.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                      <p>For questions about this invoice, please contact our billing department.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
          
          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => selectedInvoice && handleDownloadInvoice(selectedInvoice)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (selectedInvoice) {
                      navigator.clipboard.writeText(selectedInvoice.id);
                      toast.success('Invoice number copied to clipboard');
                    }
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Copy Invoice Number
                </Button>
                {selectedInvoice?.status === 'paid' && (
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Request Refund
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={() => setIsInvoiceViewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* No Subscription Dialog */}
      <NoSubscriptionDialog
        isOpen={noSubscriptionDialog.isDialogOpen}
        onClose={noSubscriptionDialog.closeDialog}
        onUpgrade={noSubscriptionDialog.handleUpgrade}
      />
    </div>
  );
}