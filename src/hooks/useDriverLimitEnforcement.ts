import { useCheckDriverLimit } from './useTrialManagement';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useDriverLimitEnforcement = () => {
  const { data: driverLimit, isLoading } = useCheckDriverLimit();
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkBeforeAddingDriver = () => {
    if (isLoading) {
      return { canAdd: false, reason: 'Checking limits...' };
    }

    if (!driverLimit) {
      return { canAdd: true, reason: 'No limits configured' };
    }

    if (!driverLimit.canAddDriver) {
      const usagePercentage = (driverLimit.currentDrivers / driverLimit.maxDrivers) * 100;
      
      toast({
        title: 'Driver Limit Reached',
        description: `You've reached your limit of ${driverLimit.maxDrivers} drivers. Please upgrade your plan to add more drivers.`,
        variant: 'destructive',
      });

      return { 
        canAdd: false, 
        reason: `Limit reached: ${driverLimit.currentDrivers}/${driverLimit.maxDrivers} drivers` 
      };
    }

    const usagePercentage = (driverLimit.currentDrivers / driverLimit.maxDrivers) * 100;
    
    if (usagePercentage >= 80) {
      toast({
        title: 'Approaching Driver Limit',
        description: `You're using ${driverLimit.currentDrivers} of ${driverLimit.maxDrivers} drivers. Consider upgrading soon.`,
        variant: 'default',
      });
    }

    return { canAdd: true, reason: 'Within limits' };
  };

  const getDriverLimitInfo = () => {
    if (isLoading || !driverLimit) {
      return {
        currentDrivers: 0,
        maxDrivers: 0,
        usagePercentage: 0,
        canAddDriver: true,
        remainingSlots: 0,
        isNearLimit: false,
        isAtLimit: false
      };
    }

    const usagePercentage = (driverLimit.currentDrivers / driverLimit.maxDrivers) * 100;
    
    return {
      currentDrivers: driverLimit.currentDrivers,
      maxDrivers: driverLimit.maxDrivers,
      usagePercentage,
      canAddDriver: driverLimit.canAddDriver,
      remainingSlots: driverLimit.remainingSlots,
      isNearLimit: usagePercentage >= 80,
      isAtLimit: !driverLimit.canAddDriver
    };
  };

  return {
    checkBeforeAddingDriver,
    getDriverLimitInfo,
    isLoading,
    driverLimit
  };
};
