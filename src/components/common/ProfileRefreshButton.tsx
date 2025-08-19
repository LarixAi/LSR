import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProfileRefreshButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const ProfileRefreshButton: React.FC<ProfileRefreshButtonProps> = ({ 
  className = '',
  variant = 'outline',
  size = 'sm'
}) => {
  const { forceRefreshProfile, profile } = useAuth();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await forceRefreshProfile();
      toast({
        title: "Profile refreshed",
        description: "Your profile data has been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant={variant}
      size={size}
      className={className}
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {size !== 'icon' && (
        <span className="ml-2">
          {isRefreshing ? 'Refreshing...' : 'Refresh Profile'}
        </span>
      )}
    </Button>
  );
};
