import React, { useState, useEffect, useRef } from 'react';
import { useCompanySubscription, useSubscriptionPlans } from '@/hooks/useSubscriptions';
import { useTrialStatus } from '@/hooks/useTrialManagement';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Clock, ChevronRight, Sparkles, Zap, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const SubscriptionStatus = () => {
  const { profile } = useAuth();
  const { data: subscription, isLoading: subscriptionLoading } = useCompanySubscription(profile?.organization_id);
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: trialStatus, isLoading: trialLoading } = useTrialStatus();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDetails(false);
      }
    };

    if (showDetails) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDetails]);

  if (subscriptionLoading || plansLoading || trialLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg animate-pulse">
        <div className="h-4 w-4 bg-muted rounded"></div>
        <div className="h-4 w-20 bg-muted rounded"></div>
      </div>
    );
  }

  // Determine current plan and status
  let currentPlan = 'Free';
  let isActive = false;
  let isTrial = false;

  // Debug logging
  console.log('Subscription Status Debug:', {
    subscription: subscription,
    trialStatus: trialStatus,
    plans: plans,
    hasSubscription: !!subscription?.plan_id,
    hasTrial: !!trialStatus?.isActive,
    trialDaysLeft: trialStatus?.daysLeft
  });

  if (subscription?.plan_id) {
    // Has paid subscription
    currentPlan = plans?.find(plan => plan.id === subscription.plan_id)?.name || 'Unknown';
    isActive = subscription?.status === 'active';
    console.log('Using paid subscription:', currentPlan);
  } else if (trialStatus?.isActive) {
    // Has active trial
    currentPlan = 'Trial';
    isActive = true;
    isTrial = true;
    console.log('Using trial subscription:', currentPlan, 'Days left:', trialStatus.daysLeft);
  } else {
    // No paid subscription and no trial record - assume free trial for new users
    // This handles the case where the trial table doesn't exist or trial record is missing
    currentPlan = 'Trial';
    isActive = true;
    isTrial = true;
    console.log('Using default trial (no trial record found):', currentPlan);
  }

  const getTierIcon = () => {
    switch (currentPlan) {
      case 'Enterprise':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'Professional':
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      case 'Starter':
        return <Zap className="h-4 w-4 text-blue-500" />;
      case 'Trial':
        return <Gift className="h-4 w-4 text-green-500" />;
      case 'Free':
        return <Zap className="h-4 w-4 text-gray-500" />;
      default:
        return <Crown className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTierColor = () => {
    switch (currentPlan) {
      case 'Enterprise':
        return 'from-yellow-500/10 to-yellow-600/10 border-yellow-500/20 hover:border-yellow-500/30';
      case 'Professional':
        return 'from-purple-500/10 to-purple-600/10 border-purple-500/20 hover:border-purple-500/30';
      case 'Starter':
        return 'from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:border-blue-500/30';
      case 'Trial':
        return 'from-green-500/10 to-green-600/10 border-green-500/20 hover:border-green-500/30';
      case 'Free':
        return 'from-gray-500/10 to-gray-600/10 border-gray-500/20 hover:border-gray-500/30';
      default:
        return 'from-muted/50 to-muted border-border hover:border-muted-foreground/20';
    }
  };

  const getDaysRemaining = () => {
    if (isTrial && trialStatus) {
      return trialStatus.daysLeft;
    }
    if (isTrial && !trialStatus) {
      // Default trial - assume 14 days from now
      return 14;
    }
    if (subscription?.end_date) {
      const endDate = new Date(subscription.end_date);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return null;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "relative flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200",
          "bg-gradient-to-r border",
          getTierColor()
        )}
        onClick={() => setShowDetails(!showDetails)}
      >
        {getTierIcon()}
        <span className="text-sm font-medium">
          {currentPlan}
        </span>
        <ChevronRight className={cn("h-3 w-3 opacity-50 transition-transform", showDetails && "rotate-90")} />
      </Button>

      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                  {getTierIcon()}
                  <h4 className="text-sm font-semibold">
                    {currentPlan} Plan
                  </h4>
                </div>
              {(isActive && daysRemaining && daysRemaining <= 7) || (isTrial && daysRemaining && daysRemaining <= 3) ? (
                <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                  {isTrial ? 'Trial Ending Soon' : 'Expiring Soon'}
                </span>
              ) : null}
            </div>

            {isTrial ? (
              <>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      Trial Active
                    </span>
                  </div>
                  {trialStatus?.trialEndDate ? (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Trial Ends</span>
                      <span className="font-medium">
                        {format(new Date(trialStatus.trialEndDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Trial Duration</span>
                      <span className="font-medium">
                        14 Days
                      </span>
                    </div>
                  )}
                  {daysRemaining !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Days Remaining</span>
                      <span className={cn(
                        "font-medium flex items-center space-x-1",
                        daysRemaining <= 3 ? "text-destructive" : daysRemaining <= 7 ? "text-orange-600" : ""
                      )}>
                        <Clock className="h-3 w-3" />
                        <span>{daysRemaining} days</span>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Max Drivers</span>
                    <span className="font-medium">
                      {trialStatus?.maxDrivers || 10} drivers
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-medium text-green-600">
                      Professional Features
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setShowDetails(false);
                      navigate('/subscriptions');
                    }}
                  >
                    Upgrade to Paid Plan
                  </Button>
                </div>
              </>
            ) : subscription ? (
              <>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={cn(
                      "font-medium",
                      isActive ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
                    )}>
                      {isActive ? 'Active' : subscription.status}
                    </span>
                  </div>
                  {subscription?.end_date && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Renews</span>
                        <span className="font-medium">
                          {format(new Date(subscription.end_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      {daysRemaining && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Time Remaining</span>
                          <span className={cn(
                            "font-medium flex items-center space-x-1",
                            daysRemaining <= 7 ? "text-destructive" : ""
                          )}>
                            <Clock className="h-3 w-3" />
                            <span>{daysRemaining} days</span>
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {subscription?.amount && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium">
                        £{subscription.amount}/month
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setShowDetails(false);
                      navigate('/subscriptions');
                    }}
                  >
                    Manage Subscription
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Upgrade to unlock premium features and enhance your transport management experience.
                </p>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setShowDetails(false);
                    navigate('/subscriptions');
                  }}
                >
                  Start Free Trial
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;
