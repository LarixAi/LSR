import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Calendar, Users, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function Subscriptions() {
  const { profile } = useAuth();

  // Fetch organization trial data
  const { data: trialData } = useQuery({
    queryKey: ['organization-trial', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;
      
      const { data, error } = await supabase
        .from('organization_trials')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!profile?.organization_id
  });

  // Fetch organization subscriptions
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['organization-subscriptions', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('organization_subscriptions')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  // Count active drivers in organization
  const { data: driverCount = 0 } = useQuery({
    queryKey: ['driver-count', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return 0;
      
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', profile.organization_id)
        .eq('role', 'driver')
        .eq('is_active', true);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!profile?.organization_id
  });

  const activeSubscription = subscriptions.find(sub => sub.status === 'active');
  const isTrialActive = trialData?.trial_status === 'active';
  const isTrialExpired = trialData?.trial_status === 'expired';

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Active', variant: 'default' as const, icon: CheckCircle2 },
      expired: { label: 'Expired', variant: 'destructive' as const, icon: AlertTriangle },
      cancelled: { label: 'Cancelled', variant: 'secondary' as const, icon: Clock },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const, 
      icon: Clock 
    };
    
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getRemainingTrialDays = () => {
    if (!trialData?.trial_end_date) return 0;
    const endDate = new Date(trialData.trial_end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your organization's subscription and billing
          </p>
        </div>
        <Button>
          <CreditCard className="w-4 h-4 mr-2" />
          Upgrade Plan
        </Button>
      </div>

      {/* Current Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                <p className="text-2xl font-bold">
                  {activeSubscription ? 'Premium' : isTrialActive ? 'Trial' : 'Free'}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Drivers</p>
                <p className="text-2xl font-bold">{driverCount}</p>
                {trialData && (
                  <p className="text-xs text-muted-foreground">
                    Limit: {trialData.max_drivers}
                  </p>
                )}
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">
                  {activeSubscription && getStatusBadge(activeSubscription.status)}
                  {isTrialActive && getStatusBadge('active')}
                  {isTrialExpired && getStatusBadge('expired')}
                  {!activeSubscription && !trialData && (
                    <Badge variant="secondary">No Plan</Badge>
                  )}
                </div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isTrialActive ? 'Trial Days Left' : 'Next Billing'}
                </p>
                <p className="text-2xl font-bold">
                  {isTrialActive ? getRemainingTrialDays() : '--'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList>
          <TabsTrigger value="current">Current Plan</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {/* Trial Information */}
          {trialData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isTrialActive ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  )}
                  Trial Status
                </CardTitle>
                <CardDescription>
                  Your organization's trial period information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Trial Period</p>
                    <p className="text-lg font-semibold">
                      {new Date(trialData.trial_start_date).toLocaleDateString()} - {' '}
                      {new Date(trialData.trial_end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Driver Limit</p>
                    <p className="text-lg font-semibold">
                      {driverCount} / {trialData.max_drivers} drivers
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(trialData.trial_status)}
                    </div>
                  </div>
                </div>

                {isTrialActive && getRemainingTrialDays() <= 7 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <p className="font-semibold text-orange-800">Trial Ending Soon</p>
                    </div>
                    <p className="text-orange-700 mt-1">
                      Your trial expires in {getRemainingTrialDays()} days. 
                      Upgrade to continue using all features.
                    </p>
                  </div>
                )}

                {isTrialExpired && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <p className="font-semibold text-red-800">Trial Expired</p>
                    </div>
                    <p className="text-red-700 mt-1">
                      Your trial has expired. Please upgrade to continue adding drivers and accessing premium features.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Active Subscription */}
          {activeSubscription && (
            <Card>
              <CardHeader>
                <CardTitle>Active Subscription</CardTitle>
                <CardDescription>Your current subscription details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Plan</p>
                    <p className="text-lg font-semibold">{activeSubscription.plan_id || 'Premium'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(activeSubscription.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(activeSubscription.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  {activeSubscription.end_date && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">End Date</p>
                      <p className="text-lg font-semibold">
                        {new Date(activeSubscription.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Plan Message */}
          {!activeSubscription && !trialData && (
            <Card>
              <CardHeader>
                <CardTitle>No Active Plan</CardTitle>
                <CardDescription>You don't have an active subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Get Started</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a plan to unlock all features and manage your fleet effectively.
                  </p>
                  <Button>View Available Plans</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
              <CardDescription>Your past and current subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No subscription history</h3>
                  <p className="text-muted-foreground">
                    Subscription history will appear here once you have active subscriptions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {subscription.plan_id || 'Premium Plan'}
                          </span>
                          {getStatusBadge(subscription.status)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {new Date(subscription.start_date).toLocaleDateString()} - {' '}
                          {subscription.end_date 
                            ? new Date(subscription.end_date).toLocaleDateString()
                            : 'Ongoing'
                          }
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Created: {new Date(subscription.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Free Trial</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">£0</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Up to 5 drivers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Basic tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    30-day trial
                  </li>
                </ul>
                <Button variant="outline" className="w-full" disabled={!!trialData}>
                  {trialData ? 'Already Used' : 'Start Trial'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Premium
                  <Badge>Popular</Badge>
                </CardTitle>
                <CardDescription>For growing transport businesses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">£99<span className="text-lg text-muted-foreground">/mo</span></div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Unlimited drivers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Real-time tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Priority support
                  </li>
                </ul>
                <Button className="w-full">
                  {activeSubscription ? 'Current Plan' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For large organizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">Custom</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Everything in Premium
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Custom integrations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Dedicated support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Custom SLA
                  </li>
                </ul>
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}