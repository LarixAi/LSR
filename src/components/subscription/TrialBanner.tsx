import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useTrialStatus } from '@/hooks/useTrialManagement';
import { useNavigate } from 'react-router-dom';

interface TrialBannerProps {
  className?: string;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ className = '' }) => {
  const { data: trialStatus, isLoading, error } = useTrialStatus();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = React.useState(true);

  if (isLoading || !isVisible) {
    return null;
  }

  if (error || !trialStatus) {
    return null;
  }

  // Don't show banner if trial is not active
  if (!trialStatus.isActive) {
    return null;
  }

  const getTrialStatusColor = (daysLeft: number) => {
    if (daysLeft <= 3) return 'destructive';
    if (daysLeft <= 7) return 'default';
    return 'default';
  };

  const getTrialStatusIcon = (daysLeft: number) => {
    if (daysLeft <= 3) return <AlertTriangle className="h-4 w-4" />;
    if (daysLeft <= 7) return <Clock className="h-4 w-4" />;
    return <Star className="h-4 w-4" />;
  };

  const getTrialStatusTitle = (daysLeft: number) => {
    if (daysLeft <= 3) return 'Trial Expiring Soon';
    if (daysLeft <= 7) return 'Trial Ending Soon';
    return 'Free Trial Active';
  };

  const getTrialStatusDescription = (daysLeft: number) => {
    if (daysLeft <= 3) {
      return `Your trial expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Upgrade now to continue using all features.`;
    }
    if (daysLeft <= 7) {
      return `Your trial ends in ${daysLeft} days. Upgrade to keep your data and continue using the platform.`;
    }
    return `You have ${daysLeft} days left in your free trial. Upgrade anytime to unlock all features.`;
  };

  return (
    <Alert className={`mb-6 ${className}`} variant={getTrialStatusColor(trialStatus.daysLeft)}>
      {getTrialStatusIcon(trialStatus.daysLeft)}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="font-medium">{getTrialStatusTitle(trialStatus.daysLeft)}</span>
          <Badge variant="outline">
            {trialStatus.currentDrivers}/{trialStatus.maxDrivers} Drivers
          </Badge>
          <Badge variant="secondary">
            {trialStatus.daysLeft} days left
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-6 w-6 p-0 hover:bg-background/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <AlertDescription className="flex items-center justify-between">
        <span>{getTrialStatusDescription(trialStatus.daysLeft)}</span>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => navigate('/subscriptions')}
            variant={trialStatus.daysLeft <= 3 ? 'default' : 'outline'}
          >
            {trialStatus.daysLeft <= 3 ? 'Upgrade Now' : 'View Plans'}
          </Button>
          {trialStatus.daysLeft > 3 && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => navigate('/subscriptions')}
            >
              Learn More
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export const TrialExpiredBanner: React.FC<TrialBannerProps> = ({ className = '' }) => {
  const { data: trialStatus, isLoading } = useTrialStatus();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = React.useState(true);

  if (isLoading || !trialStatus || !isVisible) {
    return null;
  }

  // Only show if trial is expired
  if (trialStatus.isActive || trialStatus.daysLeft > 0) {
    return null;
  }

  return (
    <Alert className={`mb-6 ${className}`} variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <div className="flex items-center justify-between w-full">
        <div className="font-medium">Trial Expired</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-6 w-6 p-0 hover:bg-destructive/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <AlertDescription className="flex items-center justify-between">
        <span>
          Your free trial has expired. Upgrade to a paid plan to continue using the platform and access your data.
        </span>
        <Button 
          size="sm" 
          onClick={() => navigate('/subscriptions')}
          variant="destructive"
        >
          Upgrade Now
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export const DriverLimitBanner: React.FC<TrialBannerProps> = ({ className = '' }) => {
  const { data: trialStatus, isLoading } = useTrialStatus();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = React.useState(true);

  if (isLoading || !trialStatus || !isVisible) {
    return null;
  }

  // Only show if approaching or at driver limit
  const usagePercentage = (trialStatus.currentDrivers / trialStatus.maxDrivers) * 100;
  if (usagePercentage < 80) {
    return null;
  }

  return (
    <Alert className={`mb-6 ${className}`} variant={usagePercentage >= 100 ? 'destructive' : 'default'}>
      <AlertTriangle className="h-4 w-4" />
      <div className="flex items-center justify-between w-full">
        <div className="font-medium">
          {usagePercentage >= 100 ? 'Driver Limit Reached' : 'Approaching Driver Limit'}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-6 w-6 p-0 hover:bg-background/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <AlertDescription className="flex items-center justify-between">
        <span>
          {usagePercentage >= 100 
            ? `You've reached your limit of ${trialStatus.maxDrivers} drivers. Upgrade to add more drivers.`
            : `You're using ${trialStatus.currentDrivers} of ${trialStatus.maxDrivers} drivers. Consider upgrading soon.`
          }
        </span>
        <Button 
          size="sm" 
          onClick={() => navigate('/subscriptions')}
          variant={usagePercentage >= 100 ? 'destructive' : 'outline'}
        >
          {usagePercentage >= 100 ? 'Upgrade Now' : 'View Plans'}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
