import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const SubscriptionStatus = () => {
  const { subscription, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg animate-pulse">
        <div className="h-4 w-4 bg-muted rounded"></div>
        <div className="h-4 w-20 bg-muted rounded"></div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const getTierIcon = () => {
    switch (subscription.subscription_tier) {
      case 'Enterprise':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'Premium':
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      case 'Basic':
        return <Crown className="h-4 w-4 text-blue-500" />;
      default:
        return <Crown className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTierColor = () => {
    switch (subscription.subscription_tier) {
      case 'Enterprise':
        return 'from-yellow-500/10 to-yellow-600/10 border-yellow-500/20 hover:border-yellow-500/30';
      case 'Premium':
        return 'from-purple-500/10 to-purple-600/10 border-purple-500/20 hover:border-purple-500/30';
      case 'Basic':
        return 'from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:border-blue-500/30';
      default:
        return 'from-muted/50 to-muted border-border hover:border-muted-foreground/20';
    }
  };

  const getDaysRemaining = () => {
    if (!subscription.subscription_end) return null;
    const endDate = new Date(subscription.subscription_end);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200",
            "bg-gradient-to-r border",
            getTierColor()
          )}
          onClick={() => navigate('/subscriptions')}
        >
          {getTierIcon()}
          <span className="text-sm font-medium">
            {subscription.subscribed 
              ? subscription.subscription_tier || 'Subscribed'
              : 'Free Plan'}
          </span>
          <ChevronRight className="h-3 w-3 opacity-50" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getTierIcon()}
              <h4 className="text-sm font-semibold">
                {subscription.subscribed 
                  ? `${subscription.subscription_tier} Plan`
                  : 'Free Plan'}
              </h4>
            </div>
            {subscription.subscribed && daysRemaining && daysRemaining <= 7 && (
              <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                Expiring Soon
              </span>
            )}
          </div>

          {subscription.subscribed ? (
            <>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium text-green-600 dark:text-green-400">Active</span>
                </div>
                {subscription.subscription_end && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Renews</span>
                      <span className="font-medium">
                        {format(new Date(subscription.subscription_end), 'MMM dd, yyyy')}
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
              </div>

              <div className="pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
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
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/subscriptions');
                }}
              >
                Upgrade Now
              </Button>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default SubscriptionStatus;