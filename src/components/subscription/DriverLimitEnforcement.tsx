import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Users, Lock } from 'lucide-react';
import { useCheckDriverLimit } from '@/hooks/useTrialManagement';
import { useNavigate } from 'react-router-dom';

interface DriverLimitEnforcementProps {
  className?: string;
  showUpgradeButton?: boolean;
}

export const DriverLimitEnforcement: React.FC<DriverLimitEnforcementProps> = ({ 
  className = '',
  showUpgradeButton = true 
}) => {
  const { data: driverLimit, isLoading, error } = useCheckDriverLimit();
  const navigate = useNavigate();

  if (isLoading || error || !driverLimit) {
    return null;
  }

  const usagePercentage = (driverLimit.currentDrivers / driverLimit.maxDrivers) * 100;
  const isAtLimit = !driverLimit.canAddDriver;
  const isNearLimit = usagePercentage >= 80;

  if (!isNearLimit && !isAtLimit) {
    return null;
  }

  return (
    <Alert className={`mb-6 ${className}`} variant={isAtLimit ? 'destructive' : 'default'}>
      <AlertTriangle className="h-4 w-4" />
      <div className="flex items-center justify-between font-medium">
        {isAtLimit ? 'Driver Limit Reached' : 'Approaching Driver Limit'}
        <Badge variant="outline">
          {driverLimit.currentDrivers}/{driverLimit.maxDrivers} Drivers
        </Badge>
      </div>
      <AlertDescription className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>
            {isAtLimit 
              ? `You've reached your limit of ${driverLimit.maxDrivers} drivers.`
              : `You're using ${driverLimit.currentDrivers} of ${driverLimit.maxDrivers} drivers.`
            }
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Driver Usage</span>
            <span>{Math.round(usagePercentage)}%</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>

        {isAtLimit && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>You cannot add more drivers until you upgrade your plan.</span>
          </div>
        )}

        {showUpgradeButton && (
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              onClick={() => navigate('/subscriptions')}
              variant={isAtLimit ? 'destructive' : 'outline'}
            >
              {isAtLimit ? 'Upgrade Now' : 'View Plans'}
            </Button>
            {!isAtLimit && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => navigate('/subscriptions')}
              >
                Learn More
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export const DriverLimitCheck: React.FC<{ 
  onLimitReached?: () => void;
  children: React.ReactNode;
}> = ({ onLimitReached, children }) => {
  const { data: driverLimit, isLoading } = useCheckDriverLimit();

  if (isLoading) {
    return <div className="opacity-50 pointer-events-none">{children}</div>;
  }

  if (!driverLimit?.canAddDriver) {
    if (onLimitReached) {
      onLimitReached();
    }
    return null;
  }

  return <>{children}</>;
};
